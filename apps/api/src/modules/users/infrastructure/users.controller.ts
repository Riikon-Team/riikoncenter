import { Controller, Get, Param } from '@nestjs/common';
import { FindUserUseCase } from '../application/use-cases/find-user.use-case';

@Controller('users')
export class UsersController {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.findUserUseCase.executeById(id);
    // Exclude passwordHash from response
    const { passwordHash, ...userResponse } = user;
    return userResponse;
  }
}
