import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  AnalyzeOperationOutput,
  AnalyzeResultOutput,
  DocumentFieldOutput,
} from '@azure-rest/ai-document-intelligence';
import { PollerLike, OperationState } from '@azure/core-lro';
import { DefaultAzureCredential } from '@azure/identity';
import { IStorageProvider, STORAGE_PROVIDER } from '../../infra/storage/storage.provider.interface';

@Injectable()
export class AzureInvoiceService {
  private readonly logger = new Logger(AzureInvoiceService.name);

  constructor(
    private configService: ConfigService,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  async uploadToBlob(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    tenantId: string,
  ): Promise<{ blobName: string; sasUrl: string }> {
    // ENFORCE TENANT ISOLATION
    if (!filename.startsWith(`${tenantId}/`)) {
      throw new Error(`Security Alert: Upload filename '${filename}' must start with tenantId '${tenantId}'`);
    }

    // Direct injection into storage module abstraction
    const result = await this.storage.uploadFile(fileBuffer, filename.split('/').pop() || filename, mimeType, tenantId);
    
    return {
      blobName: result.blobName,
      sasUrl: result.sasUrl,
    };
  }

  async getSasUrl(blobName: string, tenantId: string): Promise<string> {
    return this.storage.generatePresignedUrl(blobName, tenantId);
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
