import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationResponse } from '@tresdoce-nestjs-toolkit/paas';
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';

import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { Gender, Seniority } from '../interfaces/user.interface';
import { config, validationSchema } from '../../config';

describe('UsersService', () => {
  let app: INestApplication;
  let service: UsersService;

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
      providers: [UsersService],
    }).compile();

    app = moduleRef.createNestApplication();
    service = moduleRef.get<UsersService>(UsersService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    await service.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.all@mail.com',
      gender: Gender.X,
      seniority: Seniority.JR,
      experience: '',
    });

    const response: PaginationResponse<User> = await service.findAll({ page: 1, size: 10 });

    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
    expect(response).toHaveProperty('meta');
    expect(response.meta.total).toBeGreaterThan(0);
  });

  it('should throw if page > total pages', async () => {
    const page = 1000;
    await expect(service.findAll({ page, size: 10 })).rejects.toThrowError(
      `The page #${page} is greater than the total pages.`,
    );
  });

  it('should find a user by id', async () => {
    const created = await service.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'findme@mail.com',
      gender: Gender.MALE,
      seniority: Seniority.JR,
      experience: '',
    });

    const user = await service.findOne(created.id);
    expect(user).toHaveProperty('id', created.id);
    expect(user.email).toBe('findme@mail.com');
  });

  it('should throw when user by id not found', async () => {
    const userID = 9999;
    await expect(service.findOne(userID)).rejects.toThrowError(`User #${userID} not found`);
  });

  it('should create a new user', async () => {
    const payload: CreateUserDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@email.com',
      gender: Gender.FEMALE,
      seniority: Seniority.JR,
      experience: '',
    };
    const user: User = await service.create(payload);
    expect(user).toMatchObject(payload);
  });

  it('should update user info', async () => {
    const newUser = await service.create({
      firstName: 'Temp',
      lastName: 'User',
      email: 'temp.user@email.com',
      gender: Gender.MALE,
      seniority: Seniority.JR,
      experience: '',
    });

    const changes: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'User',
      email: 'updated.user@email.com',
      gender: Gender.X,
      seniority: Seniority.SENIOR,
      experience: 'Updated experience',
    };

    const updated = await service.update(newUser.id, changes);
    expect(updated).toMatchObject({ id: newUser.id, ...changes });
  });

  it('should throw when updating non-existing user', async () => {
    const userID = 9999;
    const changes: UpdateUserDto = {
      firstName: 'Jhon',
      lastName: 'Doe',
      email: 'jdoe@email.com',
    };
    await expect(service.update(userID, changes)).rejects.toThrowError(`User #${userID} not found`);
  });

  it('should delete a user', async () => {
    const newUser = await service.create({
      firstName: 'ToDelete',
      lastName: 'User',
      email: 'delete@email.com',
      gender: Gender.X,
      seniority: Seniority.TRAINEE,
      experience: '',
    });

    const result = await service.remove(newUser.id);
    expect(result).toEqual({ success: true });
  });

  it('should throw when deleting non-existing user', async () => {
    const userID = 9999;
    await expect(service.remove(userID)).rejects.toThrowError(`User #${userID} not found`);
  });
});
