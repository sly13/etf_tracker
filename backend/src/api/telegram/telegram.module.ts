import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TelegramService } from './telegram.service';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TelegramService, TelegramBotService],
  exports: [TelegramService, TelegramBotService],
})
export class TelegramModule {}
