import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  ) {}

  private async generateTokens(userId: string, email: string, role?: string) {
    const payload = { sub: userId, email, role: role || 'user' };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' })
    ]);

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
      const user = await this.findUserUseCase.executeById(payload.sub);
      return this.generateTokens(user.id, user.email, user.role?.name);
    } catch (e) {
      throw new UnauthorizedException('auth.errors.invalid_refresh_token');
    }
  }
}
