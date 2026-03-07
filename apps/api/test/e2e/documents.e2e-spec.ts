import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('DocumentsController (e2e)', () => {
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

  it('/api/v1/documents/presign (POST) - requires Auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/documents/presign')
      .send({ fileName: 'test.pdf', mimeType: 'pdf', size: 100 })
      .expect(401);
  });
});
