import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { ETFFlowController } from './etf-flow.controller';

@Module({
  imports: [PrismaModule],
  providers: [UniversalETFFlowService],
  controllers: [ETFFlowController],
  exports: [UniversalETFFlowService],
})
export class ETFFlowModule {}
