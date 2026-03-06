import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  AnalyzeOperationOutput,
  AnalyzeResultOutput,
  DocumentFieldOutput,
} from '@azure-rest/ai-document-intelligence';
import { PollerLike, OperationState } from '@azure/core-lro';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class AzureInvoiceService {
  private readonly logger = new Logger(AzureInvoiceService.name);

  constructor(private configService: ConfigService) {}

  async uploadToBlob(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    tenantId: string,
  ): Promise<{ blobName: string; sasUrl: string }> {
    // ENFORCE TENANT ISOLATION
    if (!filename.startsWith(`${tenantId}/`)) {
      throw new Error(
        `Security Alert: Upload filename '${filename}' must start with tenantId '${tenantId}'`,
      );
    }
    const accountUrl = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_URL',
    );
    if (!accountUrl) {
      throw new Error('AZURE_STORAGE_ACCOUNT_URL not configured');
    }

    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(accountUrl, credential);

    const containerName = 'invoices';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
      // Ensure container exists (PRIVATE access)
      await containerClient.createIfNotExists();

      // Configure CORS to allow browser access to the blobs (images)
      const serviceProperties = await blobServiceClient.getProperties();
      const corsRules = serviceProperties.cors || [];
      const allowedOrigin = '*'; // For development simplicity, or use 'http://localhost:5173'

      const existingRule = corsRules.find(
        (r) => r.allowedOrigins === allowedOrigin,
      );

      if (!existingRule) {
        this.logger.log(`Enabling CORS for origin: ${allowedOrigin}`);
        corsRules.push({
          allowedOrigins: allowedOrigin,
          allowedMethods: 'GET,OPTIONS',
          allowedHeaders: '*',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600,
        });

        await blobServiceClient.setProperties({
          ...serviceProperties,
          cors: corsRules,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to create/check container or set CORS '${containerName}': ${err.message}`,
        err.stack,
      );
      // Don't throw here for CORS errors, proceed with upload
    }

    const blobClient = containerClient.getBlockBlobClient(filename);
    try {
      await blobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: mimeType },
      });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to upload blob '${filename}': ${err.message}`,
        err.stack,
      );
      throw new Error(`Upload Error: ${err.message}`);
    }

    // Generate SAS Token for frontend access
    const now = new Date();
    now.setMinutes(now.getMinutes() - 5); // Adjust for clock skew
    const expiresOn = new Date(now);
    expiresOn.setHours(expiresOn.getHours() + 24); // Valid for 24h

    const delegationKey = await blobServiceClient.getUserDelegationKey(
      now,
      expiresOn,
    );

    // Extract account name robustly
    let accountName = blobServiceClient.accountName;
    if (!accountName) {
      const hostname = new URL(accountUrl).hostname;
      // Handle IP addresses (local emulator) vs defaults
      if (hostname === '127.0.0.1' || hostname === 'localhost') {
        accountName = 'devstoreaccount1';
      } else {
        accountName = hostname.split('.')[0];
      }
    }
    this.logger.log(`Generating SAS for account: ${accountName}`);

    let sasToken: string;
    try {
      sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName: filename,
          permissions: BlobSASPermissions.parse('r'),
          startsOn: now,
          expiresOn: expiresOn,
          protocol: SASProtocol.HttpsAndHttp,
        },
        delegationKey,
        accountName,
      ).toString();
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to generate SAS token: ${err.message}`,
        err.stack,
      );
      throw new Error(`SAS Gen Error: ${err.message}`);
    }

    const blobUrlWithSas = `${blobClient.url}?${sasToken}`;
    this.logger.log(`Generated Blob URL with SAS: ${blobClient.url}?***`);

    // Return both the full SAS URL (for immediate use) and the blobName (for storage)
    return {
      blobName: filename,
      sasUrl: blobUrlWithSas,
    };
  }

  async getSasUrl(blobName: string, tenantId: string): Promise<string> {
    // ENFORCE TENANT ISOLATION
    if (!blobName.startsWith(`${tenantId}/`)) {
      throw new Error(
        `Security Alert: Access to blob '${blobName}' denied for tenant '${tenantId}'`,
      );
    }
    const accountUrl = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_URL',
    );
    if (!accountUrl) throw new Error('AZURE_STORAGE_ACCOUNT_URL not users');

    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(accountUrl, credential);
    const containerName = 'invoices';
    const blobClient = blobServiceClient
      .getContainerClient(containerName)
      .getBlobClient(blobName);

    // Generate SAS
    const now = new Date();
    now.setMinutes(now.getMinutes() - 5);
    const expiresOn = new Date(now);
    expiresOn.setHours(expiresOn.getHours() + 24);

    const delegationKey = await blobServiceClient.getUserDelegationKey(
      now,
      expiresOn,
    );

    let accountName = blobServiceClient.accountName;
    if (!accountName) {
      const hostname = new URL(accountUrl).hostname;
      if (hostname === '127.0.0.1' || hostname === 'localhost') {
        accountName = 'devstoreaccount1';
      } else {
        accountName = hostname.split('.')[0];
      }
    }

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: now,
        expiresOn,
        protocol: SASProtocol.HttpsAndHttp,
      },
      delegationKey,
      accountName,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  async analyzeInvoice(fileUrl: string) {
    const endpoint =
      this.configService.get<string>('AZURE-DOCUMENT-INTELLIGENCE-ENDPOINT') ||
      this.configService.get<string>('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT');
    if (!endpoint) {
      const msg = 'AZURE-DOCUMENT-INTELLIGENCE-ENDPOINT not configured';
      this.logger.error(msg);
      throw new Error(msg);
    }

    try {
      const credential = new DefaultAzureCredential();
      const client = DocumentIntelligence(endpoint, credential);

      this.logger.log(`Starting analysis for: ${fileUrl}`);

      const initialResponse = await client
        .path('/documentModels/{modelId}:analyze', 'prebuilt-invoice')
        .post({
          contentType: 'application/json',
          body: { urlSource: fileUrl },
        });

      if (isUnexpected(initialResponse)) {
        const errorMsg = JSON.stringify(initialResponse.body.error);
        this.logger.error(`Analysis unexpected response: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const poller = getLongRunningPoller(
        client,
        initialResponse,
      ) as unknown as PollerLike<
        OperationState<{ body: AnalyzeOperationOutput; error?: unknown }>,
        { body: AnalyzeOperationOutput; error?: unknown }
      >;
      const result = await poller.pollUntilDone();
      const responseBody = result.body;

      // The result is the full response object including body, headers, etc.
      // We need to access the analyzeResult inside the body.
      if (!responseBody || !responseBody.analyzeResult) {
        this.logger.error(
          `
          Full Analysis Result: ${JSON.stringify(result, null, 2)},
        `,
        );

        // Check if there is an error at the top level or in body
        const error: unknown = result.error || responseBody?.error;
        if (error) {
          throw new Error(
            `Analysis failed with API error: ${JSON.stringify(error)}`,
          );
        }
        throw new Error(
          'Analysis failed: analyzeResult is missing in the response.',
        );
      }

      this.logger.log('Analysis completed successfully.');
      return this.mapToInvoiceData(responseBody.analyzeResult);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Analysis failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  private mapToInvoiceData(analyzeResult: AnalyzeResultOutput) {
    const documents = analyzeResult.documents;
    if (!documents || documents.length === 0) return null;

    const doc = documents[0];
    const fields = doc.fields; // Record<string, DocumentFieldOutput>

    if (!fields) return null;

    return {
      vendorName: fields.VendorName?.valueString,
      vendorTaxId: fields.VendorTaxId?.valueString, // InvoiceId or TaxId depending on model
      totalAmount: fields.InvoiceTotal?.valueCurrency?.amount,
      currency: fields.InvoiceTotal?.valueCurrency?.currencyCode,
      date: fields.InvoiceDate?.valueDate,
      dueDate: fields.DueDate?.valueDate,
      periodStart:
        fields.ServiceStartDate?.valueDate ||
        fields.BillingPeriodStartDate?.valueDate,
      periodEnd:
        fields.ServiceEndDate?.valueDate ||
        fields.BillingPeriodEndDate?.valueDate,
      // Map other fields as needed for consumption
      items: fields.Items?.valueArray?.map((item: DocumentFieldOutput) => ({
        description: item.valueObject?.Description?.valueString,
        amount: item.valueObject?.Amount?.valueCurrency?.amount,
      })),
      rawData: analyzeResult,
    };
  }
}
