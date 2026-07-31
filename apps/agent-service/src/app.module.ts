import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AgentModule } from './agent/agent.module';
import { AgentErrorFilter } from './common/agent-error.filter';

@Module({
  imports: [AgentModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AgentErrorFilter,
    },
  ],
})
export class AppModule {}
