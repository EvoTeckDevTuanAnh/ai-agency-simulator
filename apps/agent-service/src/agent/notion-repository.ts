import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { Agent, AgentRole, AgentStatus } from '@ai-agency/contracts';
import { IAgentRepository } from './agent.repository.interface';
import { AgentError, ErrorCodes } from '../common/agent-error';

const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 200;
const NOTION_TIMEOUT_MS = 10000;

interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(fn(), context);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastError!;
}

function withTimeout<T>(promise: Promise<T>, context: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${context} timed out after ${NOTION_TIMEOUT_MS}ms`)), NOTION_TIMEOUT_MS),
  );
  return Promise.race([promise, timeout]);
}

interface NotionProp {
  title?: Array<{ plain_text: string }>;
  number?: number | null;
  rich_text?: Array<{ plain_text: string }>;
  select?: { name: string };
  checkbox?: boolean;
  date?: { start: string };
}

function pageToAgent(page: NotionPage): Agent {
  const props = page.properties as Record<string, NotionProp>;

  const id = props.id?.title?.[0]?.plain_text || '';
  const sequenceNumber = props.sequenceNumber?.number ?? 0;
  const name = props.name?.rich_text?.[0]?.plain_text || '';
  const roleStr = props.role?.select?.name || '';
  const isDirector = props.isDirector?.checkbox ?? false;
  const createdAtStr = props.createdAt?.date?.start || new Date().toISOString();

  const role = Object.values(AgentRole).includes(roleStr as AgentRole)
    ? (roleStr as AgentRole)
    : AgentRole.DEVELOPER;

  return {
    id,
    sequenceNumber,
    name,
    role,
    status: AgentStatus.WORKING,
    isDirector,
    createdAt: new Date(createdAtStr),
  };
}

@Injectable()
export class NotionAgentRepository implements IAgentRepository {
  private readonly logger = new Logger(NotionAgentRepository.name);
  private readonly client: Client;
  private readonly databaseId: string;
  private ready: Promise<void>;

  constructor() {
    if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
      throw new AgentError(
        ErrorCodes.DATA_DIRECTORY_MISSING,
        'NOTION_TOKEN and NOTION_DATABASE_ID environment variables are required',
        500,
      );
    }

    this.client = new Client({
      auth: NOTION_TOKEN,
      timeoutMs: NOTION_TIMEOUT_MS,
    });
    this.databaseId = NOTION_DATABASE_ID;
    this.ready = this.ensureDirector();
  }

  private async ensureDirector(): Promise<void> {
    try {
      const existing = await this.queryDatabase({ filter: { property: 'isDirector', checkbox: { equals: true } } });
      const hasDirector = existing.some((p) => pageToAgent(p).isDirector);
      if (!hasDirector) {
        await this.createPage({
          id: 'director-001',
          sequenceNumber: 0,
          name: 'Director',
          role: AgentRole.DIRECTOR,
          status: AgentStatus.WORKING,
          isDirector: true,
          createdAt: new Date(),
        });
        this.logger.log('Created default Director in Notion');
      }
    } catch (err) {
      this.logger.error('Failed to ensure director in Notion', err);
      throw new AgentError(
        ErrorCodes.DATA_DIRECTORY_MISSING,
        'Cannot connect to Notion database. Check NOTION_TOKEN and NOTION_DATABASE_ID.',
        500,
      );
    }
  }

  private async queryDatabase(filter?: Record<string, unknown>): Promise<NotionPage[]> {
    return withRetry(async () => {
      const body: Record<string, unknown> = {};
      if (filter) {
        body.filter = filter.filter;
        if (filter.sorts) body.sorts = filter.sorts;
        if (filter.page_size) body.page_size = filter.page_size;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await this.client.request({
        path: `/databases/${this.databaseId}/query`,
        method: 'post',
        body,
      });
      return response.results as NotionPage[];
    }, 'Notion query');
  }

  private async createPage(agent: Agent): Promise<void> {
    return withRetry(async () => {
      await this.client.pages.create({
        parent: { database_id: this.databaseId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: this.agentToProperties(agent) as any,
      });
    }, 'Notion page create');
  }

  private async updatePage(pageId: string, properties: Record<string, unknown>): Promise<void> {
    return withRetry(async () => {
      await this.client.pages.update({
        page_id: pageId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: properties as any,
      });
    }, 'Notion page update');
  }

  private async deletePage(pageId: string): Promise<void> {
    return withRetry(async () => {
      await this.client.pages.update({
        page_id: pageId,
        archived: true,
      });
    }, 'Notion page delete');
  }

  private agentToProperties(agent: Agent): Record<string, unknown> {
    return {
      id: { title: [{ text: { content: agent.id } }] },
      sequenceNumber: { number: agent.sequenceNumber },
      name: { rich_text: [{ text: { content: agent.name } }] },
      role: { select: { name: agent.role } },
      isDirector: { checkbox: agent.isDirector },
      createdAt: { date: { start: agent.createdAt.toISOString() } },
    };
  }

  async findAll(): Promise<Agent[]> {
    await this.ready;
    const pages = await this.queryDatabase();
    return pages.map(pageToAgent);
  }

  async findById(id: string): Promise<Agent | undefined> {
    await this.ready;
    const pages = await this.queryDatabase({
      filter: { property: 'id', title: { equals: id } },
    });
    if (pages.length === 0) return undefined;
    return pageToAgent(pages[0]);
  }

  async findBySequenceNumber(seq: number): Promise<Agent | undefined> {
    await this.ready;
    const pages = await this.queryDatabase({
      filter: { property: 'sequenceNumber', number: { equals: seq } },
    });
    if (pages.length === 0) return undefined;
    return pageToAgent(pages[0]);
  }

  async save(agent: Agent): Promise<void> {
    await this.ready;
    await this.createPage(agent);
  }

  async update(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    await this.ready;
    const pages = await this.queryDatabase({
      filter: { property: 'id', title: { equals: id } },
    });
    if (pages.length === 0) return undefined;

    const page = pages[0];
    const current = pageToAgent(page);
    const merged = { ...current, ...updates };
    const properties = this.agentToProperties(merged);

    await this.updatePage(page.id, properties);
    return merged;
  }

  async delete(id: string): Promise<boolean> {
    await this.ready;
    const pages = await this.queryDatabase({
      filter: { property: 'id', title: { equals: id } },
    });
    if (pages.length === 0) return false;

    await this.deletePage(pages[0].id);
    return true;
  }

  async getNextSequenceNumber(): Promise<number> {
    await this.ready;
    const pages = await this.queryDatabase({
      sorts: [{ property: 'sequenceNumber', direction: 'descending' }],
      page_size: 1,
    });
    if (pages.length === 0) return 1;
    const max = pageToAgent(pages[0]).sequenceNumber;
    return max + 1;
  }

  async getRegularAgentCount(): Promise<number> {
    await this.ready;
    const all = await this.findAll();
    return all.filter((a) => !a.isDirector).length;
  }
}
