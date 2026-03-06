import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { StorageModule } from '../../infra/storage/storage.module';

@Module({
  imports: [ConfigModule, StorageModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
