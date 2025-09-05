import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EtfModule } from './etf/etf.module';
import { ETFFlowModule } from './etf/etf-flow.module';
import { NotificationModule } from './notifications/notification.module';
import { ImageGeneratorModule } from './services/image-generator.module';

@Module({
  imports: [
    PrismaModule,
    EtfModule,
    ETFFlowModule,
    NotificationModule,
    ImageGeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
