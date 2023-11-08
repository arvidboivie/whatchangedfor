import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ParserService } from './parser/parser.service';

export const parse = async () => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });

  app.get(ParserService).parse();
};
