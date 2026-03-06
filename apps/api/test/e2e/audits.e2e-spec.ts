import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Simplified E2E Test Skeleton. In a real environment, 
// this would use a dedicated test DB and test AuthTokens.
describe('AuditsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/audits (POST) - should block without Auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/audits')
      .send({ name: 'Test Audit', description: 'desc', sites: [] })
      .expect(401);
  });

  it('/api/v1/audits/:id/submit (POST) - should block without Auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/audits/123/submit')
      .expect(401);
  });
});
