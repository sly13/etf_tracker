import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FundDetailsController } from './fund-details.controller';
import { FundLogoController } from './fund-logo.controller';
import { FundDetailsService } from './fund-details.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [FundDetailsController, FundLogoController],
  providers: [FundDetailsService, PrismaService],
  exports: [FundDetailsService],
})
export class FundsModule {}
