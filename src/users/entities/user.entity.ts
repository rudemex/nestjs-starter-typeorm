import { Column, Entity, PrimaryGeneratedColumn } from '@tresdoce-nestjs-toolkit/typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Gender, Seniority } from '../interfaces/user.interface';

@Entity('users')
export class User {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Unique identifier of the user in the database.',
  })
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ example: 'Juan', description: 'The first name of the user.' })
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @ApiProperty({ example: 'Perez', description: 'The last name of the user.' })
  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @ApiProperty({
    example: 'juan.perez@mail.com',
    description: 'The email address of the user. It is unique and used for login.',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({
    example: Gender.MALE,
    enum: Gender,
    enumName: 'Gender',
    description: 'Gender: "male", "female", or "x".',
  })
  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @ApiProperty({
    example: Seniority.SEMI_SENIOR,
    enum: Seniority,
    enumName: 'Seniority',
    description: 'Seniority level in the organization.',
  })
  @Column({ type: 'enum', enum: Seniority })
  seniority: Seniority;

  @ApiProperty({
    required: false,
    example: '3 years of experience in software development',
    description: 'Brief professional experience (optional).',
  })
  @Column({ type: 'text', nullable: true })
  experience?: string;

  @ApiProperty({
    example: '2024-05-13T12:00:00.000Z',
    description: 'Timestamp when the user was created.',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-05-13T12:00:00.000Z',
    description: 'Timestamp of the last update to the user record.',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
