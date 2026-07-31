import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { JsonAgentRepository } from './agent.repository';
import { NotionAgentRepository } from './notion-repository';
import { AGENT_REPOSITORY } from './agent.repository.interface';

const REPOSITORY_PROVIDER = {
  provide: AGENT_REPOSITORY,
  useClass: process.env.AGENT_REPOSITORY === 'notion'
    ? NotionAgentRepository
    : JsonAgentRepository,
};

@Module({
  controllers: [AgentController],
  providers: [
    AgentService,
    REPOSITORY_PROVIDER,
  ],
  exports: [AgentService],
})
export class AgentModule {}
