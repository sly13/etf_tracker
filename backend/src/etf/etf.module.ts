import { Module } from '@nestjs/common';
import { EtfService } from './etf.service';
import { EtfController } from './etf.controller';

@Module({
  controllers: [EtfController],
  providers: [EtfService],
})
export class EtfModule {}
