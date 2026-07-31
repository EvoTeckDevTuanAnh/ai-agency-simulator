import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RateLimitGuard } from './rate-limit.guard';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('health')
  health() {
    return this.auth.getHealth();
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  login(@Body('password') password: string) {
    return this.auth.login(password);
  }

  @Get('auth/check')
  check(@Headers('x-session-token') token: string) {
    return this.auth.validateSession(token);
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Headers('x-session-token') token: string) {
    return this.auth.logout(token);
  }
}
