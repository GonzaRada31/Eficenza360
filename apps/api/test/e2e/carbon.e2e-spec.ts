import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('CarbonController (e2e)', () => {
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

  it('/api/v1/carbon/calculate (POST) - Blocks unauthorized users', () => {
    return request(app.getHttpServer())
      .post('/api/v1/carbon/calculate')
      .send({ auditId: '123e4567-e89b-12d3-a456-426614174000', activities: [] })
      .expect(401);
  });
});
