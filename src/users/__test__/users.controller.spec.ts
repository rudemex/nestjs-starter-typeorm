import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationResponse } from '@tresdoce-nestjs-toolkit/paas';
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';

import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { Gender, Seniority } from '../interfaces/user.interface';
import { config, validationSchema } from '../../config';

describe('UsersController', () => {
  let app: INestApplication;
  let controller: UsersController;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'env.test',
          ignoreEnvFile: false,
          load: [config],
          isGlobal: true,
          validationSchema,
        }),
        TypeOrmClientModule,
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    app = moduleRef.createNestApplication();
    controller = moduleRef.get<UsersController>(UsersController);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const payload: CreateUserDto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@mail.com',
      gender: 'x' as Gender,
      seniority: 'jr' as Seniority,
      experience: 'testing',
    };

    const user = await controller.create(payload);
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(payload.email);
  });

  it('should return paginated users', async () => {
    const response: PaginationResponse<User> = await controller.findAll();
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response).toHaveProperty('meta');
  });

  it('should return a single user', async () => {
    const users = await controller.findAll();
    const first = users.data[0];
    const user = await controller.findOne(first.id);
    expect(user).toHaveProperty('email', first.email);
  });

  it('should update a user', async () => {
    const users = await controller.findAll();
    const target = users.data[0];

    const changes: UpdateUserDto = {
      firstName: 'UpdatedName',
      seniority: 'senior' as Seniority,
    };

    const updated = await controller.update(target.id, changes);
    expect(updated.firstName).toBe(changes.firstName);
    expect(updated.seniority).toBe(changes.seniority);
  });

  it('should delete a user', async () => {
    const newUser = await controller.create({
      firstName: 'Delete',
      lastName: 'Me',
      email: 'delete.me@mail.com',
      gender: 'female' as Gender,
      seniority: 'trainee' as Seniority,
      experience: '',
    });

    const response = await controller.remove(newUser.id);
    expect(response).toEqual({ success: true });
  });
});
