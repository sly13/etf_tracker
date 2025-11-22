import { Module } from '@nestjs/common';
import { EtfModule } from './etf/etf.module';
import { ETFFlowModule } from './etf/etf-flow.module';
import { NotificationModule } from './notifications/notification.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SummaryModule } from './summary/summary.module';
import { FundsModule } from './funds/funds.module';
import { MLModule } from './ml/ml.module';
import { CandlesModule } from './candles/candles.module';
import { DataSyncModule } from './sync/data-sync.module';
import { LanguagesModule } from './languages/languages.module';
import { TestNotificationController } from './test-notification.controller';

@Module({
  imports: [
    EtfModule,
    ETFFlowModule,
    NotificationModule,
    TelegramBotModule,
    SubscriptionModule,
    SummaryModule,
    FundsModule,
    MLModule,
    CandlesModule,
    DataSyncModule,
    LanguagesModule,
  ],
  controllers: [TestNotificationController],
  exports: [
    EtfModule,
    ETFFlowModule,
    NotificationModule,
    TelegramBotModule,
    SubscriptionModule,
    SummaryModule,
    FundsModule,
    MLModule,
    CandlesModule,
    DataSyncModule,
    LanguagesModule,
  ],
})
export class ApiModule {}
