import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Pagination,
  PaginationParams,
  PaginationResponse,
  PaginationParamsDto,
} from '@tresdoce-nestjs-toolkit/paas';

import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';

@ApiTags('Users')
@Controller('users')
@ApiExtraModels(PaginationResponse, User)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get all users with pagination',
    description: 'Retrieves a list of users with optional pagination.',
  })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(User) },
            },
          },
        },
      ],
    },
  })
  @Get()
  findAll(@Pagination() pagination?: PaginationParams): Promise<PaginationResponse<User>> {
    return this.usersService.findAll(pagination);
  }

  @ApiOperation({ summary: 'Find user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto, required: true })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @Post()
  create(@Body() payload: CreateUserDto): Promise<User> {
    return this.usersService.create(payload);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, payload);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.usersService.remove(id);
  }
}
