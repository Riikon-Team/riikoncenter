import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { FindUserUseCase } from '../application/use-cases/find-user.use-case';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from '../domain/interfaces/user.repository.interface';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    FindUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [CreateUserUseCase, FindUserUseCase],
})
export class UsersModule {}
