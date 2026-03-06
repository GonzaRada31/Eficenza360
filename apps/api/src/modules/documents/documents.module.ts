import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { S3StorageAdapter } from '../../infra/storage/s3.adapter';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, S3StorageAdapter],
  exports: [DocumentsService],
})
export class DocumentsModule {}
