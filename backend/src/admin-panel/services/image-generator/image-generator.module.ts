import { Module } from '@nestjs/common';
import { ImageGeneratorService } from './image-generator.service';
import { ImageGeneratorController } from './image-generator.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImageGeneratorController],
  providers: [ImageGeneratorService],
  exports: [ImageGeneratorService],
})
export class ImageGeneratorModule {}
