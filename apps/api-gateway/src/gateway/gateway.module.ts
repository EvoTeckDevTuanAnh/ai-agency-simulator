import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgentGatewayController } from './agent-gateway.controller';
import { AgentGatewayService } from './agent-gateway.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
    AuthModule,
  ],
  controllers: [AgentGatewayController],
  providers: [AgentGatewayService],
})
export class GatewayModule {}
