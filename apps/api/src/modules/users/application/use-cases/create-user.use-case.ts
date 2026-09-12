import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('auth.errors.email_exists');
    }

    return this.userRepository.create({
      email: dto.email,
      passwordHash: dto.passwordHash,
      fullName: dto.fullName ?? null,
      avatarUrl: dto.avatarUrl ?? null,
    });
  }
}
