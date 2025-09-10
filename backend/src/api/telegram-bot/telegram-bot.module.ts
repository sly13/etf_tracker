import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UniversalETFFlowService } from '../etf/universal-etf-flow.service';
import { BotService } from './services/bot.service';
import { UserService } from './services/user.service';
import { ETFService } from './services/etf.service';
import { BasicCommands } from './commands/basic.commands';
import { ETFCommands } from './commands/etf.commands';
import { BotHandler } from './handlers/bot.handler';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    UniversalETFFlowService,
    BotService,
    UserService,
    ETFService,
    BasicCommands,
    ETFCommands,
    BotHandler,
    TelegramBotService,
  ],
  exports: [BotService, TelegramBotService],
})
export class TelegramBotModule {}
