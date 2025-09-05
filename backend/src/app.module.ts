import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EtfModule } from './etf/etf.module';
import { ETFFlowModule } from './etf/etf-flow.module';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [PrismaModule, EtfModule, ETFFlowModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
