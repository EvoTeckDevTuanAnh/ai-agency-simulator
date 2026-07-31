import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = parseInt(process.env.AUTH_SERVICE_PORT || '3003', 10);
  await app.listen(port);
  logger.log(`Auth service running on port ${port}`);
}
bootstrap();
