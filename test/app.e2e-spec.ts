import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { CreateUserDto, UpdateUserDto } from '../src/users/dtos/user.dto';
import { Gender, Seniority } from '../src/users/interfaces/user.interface';

jest.setTimeout(80000);

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdUserId: number;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('(GET) /', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('(GET) /test-env', () => {
    return request(app.getHttpServer()).get('/test-env').expect(200).expect('testKeyEnv-test');
  });

  it('(GET) /my-util', () => {
    return request(app.getHttpServer()).get('/my-util').expect(200).expect('this is an util');
  });

  it('(GET) /health/liveness', () => {
    return request(app.getHttpServer()).get('/health/liveness').expect(200).expect({
      status: 'up',
    });
  });

  it('(GET) /health/readiness', () => {
    return request(app.getHttpServer()).get('/health/readiness').expect(200);
  });

  it('(GET) /characters', () => {
    return request(app.getHttpServer())
      .get('/characters')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('info');
        expect(res.body).toHaveProperty('results');
      });
  });

  it('(GET) /characters - with query params', () => {
    return request(app.getHttpServer())
      .get('/characters')
      .query({ name: 'morty' })
      .query({ status: 'alive' })
      .query({ gender: 'female' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('info');
        expect(res.body.info).toHaveProperty('count');
        expect(res.body.info).toHaveProperty('pages');
        expect(res.body.info).toHaveProperty('next');
        expect(res.body.info).toHaveProperty('prev');
        expect(res.body).toHaveProperty('results');
        expect(res.body.results.length).toBeGreaterThan(0);
      });
  });

  it('(GET) /characters - with invalid query params', () => {
    return request(app.getHttpServer())
      .get('/characters')
      .query({ page: 1000 })
      .query({ name: 'morty' })
      .query({ status: 'alive' })
      .query({ gender: 'female' })
      .expect(404);
  });

  it('(POST) /users', async () => {
    const payload: CreateUserDto = {
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'jperez@email.com',
      gender: 'male' as Gender,
      seniority: 'trainee' as Seniority,
      experience: '',
    };
    const res = await request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .set('Accept', 'application/json')
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toEqual(payload.email);
    createdUserId = res.body.id; // guardar para otros tests
  });

  it('(GET) /users', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('size');
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('(GET) /users?page=1&size=5 - with pagination', async () => {
    const res = await request(app.getHttpServer()).get('/users?page=1&size=5').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('size');
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('(GET) /users/{id}', async () => {
    const res = await request(app.getHttpServer()).get(`/users/${createdUserId}`).expect(200);
    expect(res.body).toHaveProperty('id', createdUserId);
  });

  it('(PUT) /users/{id}', async () => {
    const payload: UpdateUserDto = {
      firstName: 'UpdatedName',
      lastName: 'UpdatedLastName',
      email: 'updated@email.com',
    };
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .send(payload)
      .set('Accept', 'application/json')
      .expect(200);

    expect(res.body).toMatchObject(payload);
  });

  it('(DELETE) /users/{id}', async () => {
    const res = await request(app.getHttpServer()).delete(`/users/${createdUserId}`).expect(200);

    expect(res.body).toEqual({ success: true });
  });
});
