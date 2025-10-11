import { Module } from '@nestjs/common';
import { FundDetailsController } from './fund-details.controller';
import { FundDetailsService } from './fund-details.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  controllers: [FundDetailsController],
  providers: [FundDetailsService, PrismaService],
  exports: [FundDetailsService],
})
export class FundsModule {}
