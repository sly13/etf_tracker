import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { DatabaseModule } from '../database/database.module';
import { FlowMonitoringModule } from '../flow-monitoring/flow-monitoring.module';

@Module({
  imports: [DatabaseModule, FlowMonitoringModule],
  controllers: [BotController],
})
export class BotModule {}
