import { Module } from '@nestjs/common';
import { STORAGE_PROVIDER } from './storage.provider.interface';
import { AzureBlobProvider } from './azure-blob.provider';

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: AzureBlobProvider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
