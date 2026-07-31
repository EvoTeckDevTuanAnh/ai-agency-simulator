import { randomBytes } from 'crypto';

export interface Session {
  token: string;
  createdAt: Date;
}

const TOKEN_BYTES = 32;

export class SessionStore {
  private readonly sessions = new Map<string, Session>();

  create(): Session {
    const token = randomBytes(TOKEN_BYTES).toString('hex');
    const session: Session = { token, createdAt: new Date() };
    this.sessions.set(token, session);
    return session;
  }

  findByToken(token: string): Session | undefined {
    return this.sessions.get(token);
  }

  delete(token: string): boolean {
    return this.sessions.delete(token);
  }
}
