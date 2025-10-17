import { Module } from '@nestjs/common';
import { EtfService } from './etf.service';
import { EtfController } from './etf.controller';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { ETFSchedulerService } from './etf-scheduler.service';
import { ETFNotificationService } from './etf-notification.service';
import { ETFNotificationController } from './etf-notification.controller';
import { FirebaseAdminService } from '../notifications/firebase-admin.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  controllers: [EtfController, ETFNotificationController],
  providers: [
    EtfService,
    UniversalETFFlowService,
    ETFSchedulerService,
    ETFNotificationService,
    FirebaseAdminService,
    TelegramBotService,
    PrismaService,
  ],
  exports: [
    UniversalETFFlowService,
    ETFSchedulerService,
    ETFNotificationService,
  ],
})
export class EtfModule {}
