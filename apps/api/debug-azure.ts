import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import DocumentIntelligence from '@azure-rest/ai-document-intelligence';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Try to load .env from current directory
const envPath = path.resolve(__dirname, '.env');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

const accountUrl = process.env.AZURE_STORAGE_ACCOUNT_URL;
const clientId = process.env.AZURE_CLIENT_ID;
const tenantId = process.env.AZURE_TENANT_ID;

console.log('--- Azure Debug Script ---');
console.log(`Account URL: ${accountUrl}`);
console.log(
  `Client ID: ${clientId ? clientId.substring(0, 5) + '...' : 'undefined'}`,
);
console.log(
  `Tenant ID: ${tenantId ? tenantId.substring(0, 5) + '...' : 'undefined'}`,
);

if (!accountUrl) {
  console.error('Error: AZURE_STORAGE_ACCOUNT_URL is missing in .env');
  process.exit(1);
}

async function main() {
  try {
    console.log('\nInitializing DefaultAzureCredential...');
    const credential = new DefaultAzureCredential();

    console.log('Initializing BlobServiceClient...');
    const blobServiceClient = new BlobServiceClient(accountUrl!, credential);

    console.log('Attempting to list containers to verify connectivity...');
    let count = 0;
    for await (const container of blobServiceClient.listContainers()) {
      console.log(`- Found container: ${container.name}`);
      count++;
      if (count >= 5) {
        console.log('... (limiting output to 5)');
        break;
      }
    }
    console.log('\nSUCCESS: Azure Blob Storage connectivity verified.');

    // Check specific container
    const containerName = 'invoices';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    console.log(`\nChecking access to container '${containerName}'...`);
    const exists = await containerClient.exists();
    console.log(`Container '${containerName}' exists: ${exists}`);

    if (!exists) {
      console.log(`Attempting to create container '${containerName}'...`);
      await containerClient.create();
      console.log(`Container '${containerName}' created successfully.`);
    }

    // Check User Delegation Key (Permission check)
    console.log('\nChecking User Delegation Key generation (Permissions)...');
    const now = new Date();
    const expiresOn = new Date(now);
    expiresOn.setHours(expiresOn.getHours() + 1);
    try {
      await blobServiceClient.getUserDelegationKey(now, expiresOn);
      console.log(
        'User Delegation Key generated successfully. Permissions are OK.',
      );
    } catch (e: unknown) {
      const err = e as Error;
      console.error('Failed to generate User Delegation Key:', err.message);
      console.error(
        'HINT: This usually means missing "Storage Blob Data Contributor" role.',
      );
    }

    // Check Document Intelligence
    const docEndpoint = process.env['AZURE-DOCUMENT-INTELLIGENCE-ENDPOINT'];
    if (docEndpoint) {
      console.log(`\nChecking Document Intelligence at: ${docEndpoint}`);

      try {
        const client = DocumentIntelligence(docEndpoint, credential);
        if (client) {
          console.log(
            'Document Intelligence client initialized (Connectivity check requires an actual request).',
          );
        }
      } catch (e: unknown) {
        const err = e as Error;
        console.error(
          'Failed to initialize Document Intelligence client:',
          err.message,
        );
      }
    } else {
      console.log(
        '\nSKIPPING Document Intelligence check (endpoint not found in .env)',
      );
    }
  } catch (error: unknown) {
    const err = error as Error & { statusCode?: number };
    console.error('\nFAILED: Could not connect to Azure Blob Storage.');
    console.error('Error details:', err.message);
    if (err.statusCode) {
      console.error('Status Code:', err.statusCode);
    }
    if (err.message.includes('AuthorizationPermissionMismatch')) {
      console.error(
        'HINT: The Service Principal may fail permission checks. Ensure "Storage Blob Data Contributor" role is assigned.',
      );
    }
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
});
