import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('RelayBootstrap');
  
  // createApplicationContext creates a standalone application (no HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule);

  // Enable graceful shutdown hooks for SIGINT / SIGTERM
  app.enableShutdownHooks();
  
  logger.log('🚀 Outbox Relay Standalone Worker is running');
}
bootstrap();
