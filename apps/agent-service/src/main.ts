import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.AGENT_SERVICE_PORT || '3002', 10);
  await app.listen(port);
  logger.log(`Agent service running on port ${port}`);
}
bootstrap();
