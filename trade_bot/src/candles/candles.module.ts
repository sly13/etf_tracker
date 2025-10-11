import { Module } from '@nestjs/common';
import { CandlesController } from './candles.controller';
import { CandlesService } from './candles.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CandlesController],
  providers: [CandlesService],
  exports: [CandlesService],
})
export class CandlesModule {}
