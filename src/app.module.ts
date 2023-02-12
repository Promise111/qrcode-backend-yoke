import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeModule } from './code/code.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CodeModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
