import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../auth/password';
import { SessionStore } from '../auth/session.store';

describe('password', () => {
  it('should hash and verify a password', () => {
    const hash = hashPassword('test-password');
    expect(hash).toContain(':');
    expect(verifyPassword('test-password', hash)).toBe(true);
  });

  it('should reject wrong password', () => {
    const hash = hashPassword('correct');
    expect(verifyPassword('wrong', hash)).toBe(false);
  });

  it('should produce different hashes for same password', () => {
    const h1 = hashPassword('same');
    const h2 = hashPassword('same');
    expect(h1).not.toBe(h2);
  });

  it('should handle empty password', () => {
    const hash = hashPassword('');
    expect(verifyPassword('', hash)).toBe(true);
  });
});

describe('SessionStore', () => {
  it('should create and find a session', () => {
    const store = new SessionStore();
    const session = store.create();
    expect(session.token).toBeDefined();
    expect(session.createdAt).toBeInstanceOf(Date);

    const found = store.findByToken(session.token);
    expect(found).toBeDefined();
    expect(found!.token).toBe(session.token);
  });

  it('should return undefined for unknown token', () => {
    const store = new SessionStore();
    expect(store.findByToken('nonexistent')).toBeUndefined();
  });

  it('should delete a session', () => {
    const store = new SessionStore();
    const session = store.create();
    expect(store.delete(session.token)).toBe(true);
    expect(store.findByToken(session.token)).toBeUndefined();
  });

  it('should return false when deleting nonexistent session', () => {
    const store = new SessionStore();
    expect(store.delete('nonexistent')).toBe(false);
  });

  it('should generate unique tokens', () => {
    const store = new SessionStore();
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(store.create().token);
    }
    expect(tokens.size).toBe(100);
  });
});
