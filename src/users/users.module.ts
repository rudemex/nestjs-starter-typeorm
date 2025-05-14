import { Module } from '@nestjs/common';
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmClientModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
