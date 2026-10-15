import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { AppModule } from './../src/app.module.js';

describe('App & Employees (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/employees (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/employees')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/employees with pagination (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/employees?page=1&limit=5')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
  });

  it('/employees/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/employees/EMP-31433')
      .expect(200);

    expect(res.body.id).toBe('EMP-31433');
    expect(res.body.name).toBe('สมชาย ศรีเจริญ');
    expect(res.body.department).toBe('Engineering');
  });

  it('/users (GET) alias route', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
