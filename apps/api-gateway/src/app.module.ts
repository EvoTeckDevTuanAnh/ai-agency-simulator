import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { RequestIdMiddleware } from './common/request-id.middleware';
import { GatewayErrorFilter, GlobalErrorFilter } from './common/error.filter';

@Module({
  imports: [GatewayModule, AuthModule],
  providers: [
    { provide: APP_FILTER, useClass: GatewayErrorFilter },
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
