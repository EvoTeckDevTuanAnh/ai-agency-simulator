import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthGatewayService } from './auth.service';
import { SessionGuard } from './session.guard';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthGatewayService, SessionGuard],
  exports: [SessionGuard, AuthGatewayService],
})
export class AuthModule {}
