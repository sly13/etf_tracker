import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [LanguagesController],
  providers: [LanguagesService, PrismaService],
  exports: [LanguagesService],
})
export class LanguagesModule {}

