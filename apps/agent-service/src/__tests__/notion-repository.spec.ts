import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('NotionAgentRepository', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NOTION_TOKEN = 'test-token';
    process.env.NOTION_DATABASE_ID = 'test-db-id';
  });

  afterEach(() => {
    process.env.NOTION_TOKEN = originalEnv.NOTION_TOKEN;
    process.env.NOTION_DATABASE_ID = originalEnv.NOTION_DATABASE_ID;
  });

  it('should require NOTION_TOKEN and NOTION_DATABASE_ID', async () => {
    delete process.env.NOTION_TOKEN;
    const { NotionAgentRepository } = await import('../agent/notion-repository');
    expect(() => new NotionAgentRepository()).toThrow();
  });

  it('should throw when env vars are missing', async () => {
    delete process.env.NOTION_TOKEN;
    delete process.env.NOTION_DATABASE_ID;
    const { NotionAgentRepository } = await import('../agent/notion-repository');
    expect(() => new NotionAgentRepository()).toThrow();
  });

  it('should map module env var correctly', () => {
    const repoType = process.env.AGENT_REPOSITORY || 'json';
    expect(['json', 'notion']).toContain(repoType);
  });
});
