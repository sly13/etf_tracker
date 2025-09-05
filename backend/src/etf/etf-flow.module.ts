import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { ETFFlowController } from './etf-flow.controller';
import { ETFSchedulerService } from './etf-scheduler.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), NotificationModule],
  providers: [UniversalETFFlowService, ETFSchedulerService],
  controllers: [ETFFlowController],
  exports: [UniversalETFFlowService],
})
export class ETFFlowModule {}
