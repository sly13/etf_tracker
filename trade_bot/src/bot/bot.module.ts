import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { DatabaseModule } from '../database/database.module';
import { FlowMonitoringModule } from '../flow-monitoring/flow-monitoring.module';
import { MLModule } from '../ml/ml.module';

@Module({
  imports: [DatabaseModule, FlowMonitoringModule, MLModule],
  controllers: [BotController],
})
export class BotModule {}
