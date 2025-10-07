import { Module } from '@nestjs/common';
import { FlowMonitoringService } from './flow-monitoring.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [FlowMonitoringService],
  exports: [FlowMonitoringService],
})
export class FlowMonitoringModule {}
