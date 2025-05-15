import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createMock } from '@tresdoce-nestjs-toolkit/test-utils';
import { Typings } from '@tresdoce-nestjs-toolkit/paas';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '../src/app.module';
import { CreateUserDto, UpdateUserDto } from '../src/users/dtos/user.dto';
import { Gender, Seniority } from '../src/users/interfaces/user.interface';

const readFixtureFile = (filePath: string) => {
  const absolutePath = path.resolve(__dirname, filePath);
  const fileContents = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(fileContents);
};

jest.setTimeout(80000);
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let appConfig: Typings.AppConfig;
  let createdUserId: number;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appConfig = app.get<ConfigService>(ConfigService)['internalConfig']['config'];
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

  it('(GET) /character', () => {
    createMock({
      url: `${appConfig.services.rickAndMortyAPI.url}/character`,
      method: 'get',
      statusCode: 200,
      options: {
        encodedQueryParams: true,
      },
      responseBody: readFixtureFile('../fixtures/characters/response-200.json'),
    });

    return request(app.getHttpServer())
      .get('/characters')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('info');
        expect(res.body).toHaveProperty('results');
        expect(res.body.info).toHaveProperty('count', 826);
        expect(res.body.info).toHaveProperty('pages', 42);
        expect(res.body.info).toHaveProperty('next');
        expect(res.body.info).toHaveProperty('prev');
        expect(res.body).toHaveProperty('results');
        expect(res.body.results.length).toBeGreaterThan(0);
        expect(res.body.results[0]).toHaveProperty('id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('status');
        expect(res.body.results[0]).toHaveProperty('species');
        expect(res.body.results[0]).toHaveProperty('type');
        expect(res.body.results[0]).toHaveProperty('gender');
        expect(res.body.results[0]).toHaveProperty('origin');
        expect(res.body.results[0]).toHaveProperty('location');
        expect(res.body.results[0]).toHaveProperty('image');
        expect(res.body.results[0]).toHaveProperty('episode');
        expect(res.body.results[0]).toHaveProperty('url');
        expect(res.body.results[0]).toHaveProperty('created');
      });
  });

  it('(GET) /character - with query params', async () => {
    createMock({
      url: `${appConfig.services.rickAndMortyAPI.url}/character`,
      method: 'get',
      statusCode: 200,
      options: {
        encodedQueryParams: true,
      },
      queryParams: {
        page: 1,
        name: 'rick',
        status: 'dead',
        gender: 'male',
      },
      responseBody: readFixtureFile('../fixtures/characters/response-params-200.json'),
    });
    return request(app.getHttpServer())
      .get('/characters')
      .query({ page: 1 })
      .query({ name: 'rick' })
      .query({ status: 'dead' })
      .query({ gender: 'male' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('info');
        expect(res.body.info).toHaveProperty('count', 54);
        expect(res.body.info).toHaveProperty('pages', 3);
        expect(res.body.info).toHaveProperty('next');
        expect(res.body.info).toHaveProperty('prev');
        expect(res.body).toHaveProperty('results');
        expect(res.body.results.length).toBeGreaterThan(0);
        expect(res.body.results[0]).toHaveProperty('id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('status');
        expect(res.body.results[0]).toHaveProperty('species');
        expect(res.body.results[0]).toHaveProperty('type');
        expect(res.body.results[0]).toHaveProperty('gender');
        expect(res.body.results[0]).toHaveProperty('origin');
        expect(res.body.results[0]).toHaveProperty('location');
        expect(res.body.results[0]).toHaveProperty('image');
        expect(res.body.results[0]).toHaveProperty('episode');
        expect(res.body.results[0]).toHaveProperty('url');
        expect(res.body.results[0]).toHaveProperty('created');
      });
  });

  it('(GET) /character - with invalid query params', async () => {
    createMock({
      url: `${appConfig.services.rickAndMortyAPI.url}/character`,
      method: 'get',
      statusCode: 404,
      options: {
        encodedQueryParams: true,
      },
      queryParams: {
        page: 9999,
      },
      responseBody: readFixtureFile('../fixtures/characters/response-404.json'),
    });
    return request(app.getHttpServer())
      .get('/characters')
      .query({ page: 9999 })
      .expect(404)
      .catch((_error) => {
        expect(_error).toBeInstanceOf(Error);
        expect(_error.response.errors.message).toBe('There is nothing here');
        expect(_error.status).toBe(HttpStatus.NOT_FOUND);
      });
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
