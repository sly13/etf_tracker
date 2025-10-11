import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { UniversalETFFlowService } from '../etf/universal-etf-flow.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  controllers: [SummaryController],
  providers: [UniversalETFFlowService, PrismaService],
})
export class SummaryModule {}


