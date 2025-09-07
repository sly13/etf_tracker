import { Module } from '@nestjs/common';
import { EtfModule } from './etf/etf.module';
import { ETFFlowModule } from './etf/etf-flow.module';
import { NotificationModule } from './notifications/notification.module';
import { TelegramModule } from './telegram/telegram.module';
import { TestNotificationController } from './test-notification.controller';

@Module({
  imports: [EtfModule, ETFFlowModule, NotificationModule, TelegramModule],
  controllers: [TestNotificationController],
  exports: [EtfModule, ETFFlowModule, NotificationModule, TelegramModule],
})
export class ApiModule {}
