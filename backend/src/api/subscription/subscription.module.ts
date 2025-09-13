import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SharedModule } from '../../shared/shared.module';
import { RevenueCatModule } from '../revenuecat/revenuecat.module';

@Module({
  imports: [SharedModule, RevenueCatModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
