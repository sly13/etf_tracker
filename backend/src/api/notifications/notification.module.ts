import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [PrismaModule, TelegramBotModule],
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseAdminService],
  exports: [NotificationService, FirebaseAdminService],
})
export class NotificationModule {}
