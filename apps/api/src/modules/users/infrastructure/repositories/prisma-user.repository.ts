import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/user.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: any): User {
    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.fullName,
      record.avatarUrl,
      record.createdAt,
      record.updatedAt,
      record.role ? {
        id: record.role.id,
        name: record.role.name,
        permissions: record.role.permissions,
      } : null,
    );
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ 
      where: { id },
      include: { role: true }
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      include: { role: true }
    });
    return this.toDomain(record);
  }
}
