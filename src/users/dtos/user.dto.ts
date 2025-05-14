import { IsEmail, IsEnum, IsOptional, IsString } from '@nestjs/class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

import { Gender, Seniority } from '../interfaces/user.interface'; // Asegurate de que el path sea correcto

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    example: 'Juan',
    description: 'The first name of the user.',
  })
  readonly firstName: string;

  @IsString()
  @ApiProperty({
    example: 'Perez',
    description: 'The last name of the user.',
  })
  readonly lastName: string;

  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'juan.perez@mail.com',
    description: 'The email address of the user. It is unique and used for login.',
  })
  readonly email: string;

  @IsEnum(Gender)
  @ApiProperty({
    example: Gender.MALE,
    enum: Gender,
    enumName: 'Gender',
    description: 'The gender of the user.',
  })
  readonly gender: Gender;

  @IsEnum(Seniority)
  @ApiProperty({
    example: Seniority.SEMI_SENIOR,
    enum: Seniority,
    enumName: 'Seniority',
    description: 'The seniority level of the user within the organization.',
  })
  readonly seniority: Seniority;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: '3 years of experience in software development',
    description: 'A brief description of the user’s experience.',
  })
  readonly experience?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

