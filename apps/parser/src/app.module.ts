import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ParserModule } from './parser/parser.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ParserModule],
})
export class AppModule {}
