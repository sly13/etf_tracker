import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EtfModule } from './etf/etf.module';
import { ETFFlowModule } from './etf/etf-flow.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, EtfModule, ETFFlowModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
