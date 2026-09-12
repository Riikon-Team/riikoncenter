import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/user.entity';

@Injectable()
export class FindUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async executeByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  
  async executeById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
