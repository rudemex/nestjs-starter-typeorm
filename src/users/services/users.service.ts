import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  calculatePagination,
  IPaginateData,
  PaginationParamsDto,
  PaginationResponse,
} from '@tresdoce-nestjs-toolkit/paas';
import { Repository, InjectRepository } from '@tresdoce-nestjs-toolkit/typeorm';

import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findAll(
    { page, size }: PaginationParamsDto = { page: 1, size: 10 },
  ): Promise<PaginationResponse<User>> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { id: 'ASC' },
    });

    const meta: IPaginateData = calculatePagination({ total, page, size });

    return { data: users, meta };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(data: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(data);
    return await this.userRepository.save(newUser);
  }

  async update(id: number, changes: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = this.userRepository.merge(user, changes);
    return await this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return { success: true };
  }
}
