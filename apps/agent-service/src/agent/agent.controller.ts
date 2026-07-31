import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateAgentRequest, UpdateAgentRoleRequest } from '@ai-agency/contracts';
import { AgentService } from './agent.service';

@Controller()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('health')
  getHealth() {
    return this.agentService.getHealth();
  }

  @Get('agents')
  getAllAgents() {
    return this.agentService.getAllAgents();
  }

  @Get('agents/:id')
  getAgentById(@Param('id') id: string) {
    return this.agentService.getAgentById(id);
  }

  @Post('agents')
  @HttpCode(HttpStatus.CREATED)
  createAgent(@Body() body: CreateAgentRequest) {
    return this.agentService.createAgent(body);
  }

  @Patch('agents/:id/role')
  updateAgentRole(@Param('id') id: string, @Body() body: UpdateAgentRoleRequest) {
    return this.agentService.updateAgentRole(id, body);
  }

  @Delete('agents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAgent(@Param('id') id: string): void {
    this.agentService.deleteAgent(id);
  }
}
