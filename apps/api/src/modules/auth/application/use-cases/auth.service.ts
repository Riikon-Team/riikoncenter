import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcrypt';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';
import { FindUserUseCase } from '../../../users/application/use-cases/find-user.use-case';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshDto } from '../dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // Fallback store in case Redis is disconnected (e.g., ETIMEDOUT network issues)
  private fallbackStore = new Map<string, string>();

  private async generateTokens(userId: string, email: string, role?: string) {
    const payload = { sub: userId, email, role: role || 'user' };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' })
    ]);

    // Store refresh token in Redis with 7 days TTL (604800 seconds)
    try {
      await this.redis.set(`rt:${refreshToken}`, userId, 'EX', 604800);
    } catch (err) {
      console.warn('Redis unavailable, using memory fallback for token');
      this.fallbackStore.set(refreshToken, userId);
    }

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    let user;
    try {
      user = await this.findUserUseCase.executeByEmail(dto.email);
    } catch (e) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role?.name);
    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async register(dto: RegisterDto) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.createUserUseCase.execute({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role?.name);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async refreshToken(dto: RefreshDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken);
      
      // Check if refresh token exists in Redis or Fallback
      let storedUserId;
      try {
        storedUserId = await this.redis.get(`rt:${dto.refreshToken}`);
      } catch (err) {
        storedUserId = this.fallbackStore.get(dto.refreshToken);
      }

      if (!storedUserId || storedUserId !== payload.sub) {
        throw new Error('Refresh token not found or invalid');
      }

      // Rotate token: delete the old one
      try {
        await this.redis.del(`rt:${dto.refreshToken}`);
      } catch (err) {
        this.fallbackStore.delete(dto.refreshToken);
      }

      const user = await this.findUserUseCase.executeById(payload.sub);
      return this.generateTokens(user.id, user.email, user.role?.name);
    } catch (e) {
      throw new UnauthorizedException('auth.errors.invalid_refresh_token');
    }
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      try {
        await this.redis.del(`rt:${refreshToken}`);
      } catch (err) {
        this.fallbackStore.delete(refreshToken);
      }
    }
  }
}
