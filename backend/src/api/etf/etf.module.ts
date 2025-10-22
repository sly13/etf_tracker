import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { EtfService } from './etf.service';
import { EtfController } from './etf.controller';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { ETFSchedulerService } from './etf-scheduler.service';
import { ETFNotificationService } from './etf-notification.service';
import { ETFNotificationController } from './etf-notification.controller';
import { FirebaseAdminService } from '../notifications/firebase-admin.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { BotService } from '../telegram-bot/services/bot.service';
import { BotHandler } from '../telegram-bot/handlers/bot.handler';
import { UserService } from '../telegram-bot/services/user.service';
import { ETFService as TelegramETFService } from '../telegram-bot/services/etf.service';
import { BasicCommands } from '../telegram-bot/commands/basic.commands';
import { ETFCommands } from '../telegram-bot/commands/etf.commands';

@Module({
  imports: [HttpModule, JwtModule],
  controllers: [EtfController, ETFNotificationController],
  providers: [
    EtfService,
    UniversalETFFlowService,
    ETFSchedulerService,
    ETFNotificationService,
    FirebaseAdminService,
    TelegramBotService,
    NotificationService,
    PrismaService,
    BotService,
    BotHandler,
    UserService,
    TelegramETFService,
    BasicCommands,
    ETFCommands,
  ],
  exports: [
    UniversalETFFlowService,
    ETFSchedulerService,
    ETFNotificationService,
    NotificationService,
    FirebaseAdminService,
    TelegramBotService,
  ],
})
export class EtfModule {}
