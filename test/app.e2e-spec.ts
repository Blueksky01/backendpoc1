import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { AppModule } from './../src/app.module.js';

describe('App, Employees & Auth (e2e)', () => {
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

  it('POST /auth/login with valid credentials should return accessToken and refreshToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin1234' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.admin.username).toBe('admin');
    expect(res.body.admin.role).toBe('admin');
  });

  it('POST /auth/login with invalid credentials should return 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /auth/refresh with valid refreshToken should return new tokens', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin1234' })
      .expect(200);

    const oldRefreshToken = loginRes.body.refreshToken;

    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/refresh with invalid refreshToken should return 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'invalid.refresh.token' })
      .expect(401);
  });

  it('GET /auth/profile with valid token should return profile', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin1234' })
      .expect(200);

    const token = loginRes.body.accessToken;

    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileRes.body.username).toBe('admin');
    expect(profileRes.body.role).toBe('admin');
    expect(profileRes.body).not.toHaveProperty('password');
    expect(profileRes.body).not.toHaveProperty('refreshToken');
  });

  it('POST /auth/logout should invalidate refresh token', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin1234' })
      .expect(200);

    const { accessToken, refreshToken } = loginRes.body;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Refresh should now fail because refreshToken in DB is null
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('GET /auth/profile without token should return 401', async () => {
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });
});
