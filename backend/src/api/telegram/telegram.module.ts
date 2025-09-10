import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TelegramService } from './telegram.service';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [ConfigModule, PrismaModule, TelegramBotModule],
  providers: [TelegramService],
  exports: [TelegramService, TelegramBotModule],
})
export class TelegramModule {}
