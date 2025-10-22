import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { DataSyncService } from './data-sync.service';
import { DataSyncController } from './data-sync.controller';

@Module({
  imports: [ScheduleModule.forRoot(), JwtModule],
  controllers: [DataSyncController],
  providers: [DataSyncService],
  exports: [DataSyncService],
})
export class DataSyncModule {}



