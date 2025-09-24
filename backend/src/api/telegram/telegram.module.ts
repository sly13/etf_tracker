import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TelegramService } from './telegram.service';
// import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
