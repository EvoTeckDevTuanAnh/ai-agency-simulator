import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { hashPassword, verifyPassword } from './password';
import { SessionStore } from './session.store';

const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD || 'admin';

@Injectable()
export class AuthService {
  private readonly adminPasswordHash: string;
  readonly sessions = new SessionStore();

  constructor() {
    this.adminPasswordHash = hashPassword(ADMIN_PASSWORD);
  }

  login(password: string): { token: string } {
    if (!verifyPassword(password, this.adminPasswordHash)) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }
    const session = this.sessions.create();
    return { token: session.token };
  }

  validateSession(token: string): { valid: true } {
    const session = this.sessions.findByToken(token);
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.UNAUTHORIZED);
    }
    return { valid: true };
  }

  logout(token: string): { ok: true } {
    this.sessions.delete(token);
    return { ok: true };
  }

  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
