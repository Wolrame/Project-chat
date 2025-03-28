
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
