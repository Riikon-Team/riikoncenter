import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../application/use-cases/auth.service';
import { LoginDto } from '../application/dto/login.dto';
import { RegisterDto } from '../application/dto/register.dto';
import { RefreshDto } from '../application/dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    this.setCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.register(dto);
    this.setCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken = req.cookies['refresh_token'];
    if (!oldRefreshToken) {
      throw new UnauthorizedException('auth.errors.no_refresh_token');
    }
    const { accessToken, refreshToken } = await this.authService.refreshToken({ refreshToken: oldRefreshToken });
    this.setCookies(res, accessToken, refreshToken);
    return { success: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true };
  }
}
