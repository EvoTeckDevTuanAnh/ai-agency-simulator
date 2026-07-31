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
  Logger,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { AgentGatewayService } from './agent-gateway.service';
import { SessionGuard } from '../auth/session.guard';

@Controller('api')
export class AgentGatewayController {
  private readonly logger = new Logger(AgentGatewayController.name);

  constructor(@Inject(AgentGatewayService) private readonly gateway: AgentGatewayService) {}

  @Get('health')
  getHealth() {
    return this.gateway.getHealth();
  }

  @Get('agents')
  @UseGuards(SessionGuard)
  getAgents() {
    return this.gateway.getAgents();
  }

  @Get('agents/:id')
  @UseGuards(SessionGuard)
  getAgentById(@Param('id') id: string) {
    return this.gateway.getAgentById(id);
  }

  @Post('agents')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SessionGuard)
  createAgent(@Body() body: { role: string }) {
    return this.gateway.createAgent(body);
  }

  @Patch('agents/:id/role')
  @UseGuards(SessionGuard)
  updateAgentRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.gateway.updateAgentRole(id, body);
  }

  @Delete('agents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionGuard)
  deleteAgent(@Param('id') id: string): Promise<void> {
    return this.gateway.deleteAgent(id);
  }
}
