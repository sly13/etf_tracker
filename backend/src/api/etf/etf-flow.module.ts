import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { EtfModule } from './etf.module';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { ETFFlowController } from './etf-flow.controller';
import { ETFSchedulerService } from './etf-scheduler.service';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    NotificationModule,
    EtfModule,
  ],
  providers: [UniversalETFFlowService, ETFSchedulerService],
  controllers: [ETFFlowController],
  exports: [UniversalETFFlowService],
})
export class ETFFlowModule {}
