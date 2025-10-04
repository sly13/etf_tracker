import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OkxModule } from './okx/okx.module';
import { DatabaseModule } from './database/database.module';
import { FlowMonitoringModule } from './flow-monitoring/flow-monitoring.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FlowMonitoringModule,
    OkxModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
