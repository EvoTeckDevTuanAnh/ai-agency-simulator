import { Controller, Get, Post, Body, Req, Res, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGatewayService } from './auth.service';

const COOKIE_NAME = 'session';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthGatewayService) private readonly auth: AuthGatewayService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body('password') password: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(password);
    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      try {
        await this.auth.logout(token);
      } catch {
      }
    }
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { ok: true };
  }

  @Get('session')
  async session(@Req() req: Request) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return { authenticated: false };
    }
    try {
      await this.auth.validateSession(token);
      return { authenticated: true };
    } catch {
      return { authenticated: false };
    }
  }
}
