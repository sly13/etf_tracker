import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OkxController } from './okx.controller';
import { OkxService } from './okx.service';

@Module({
  imports: [ConfigModule],
  controllers: [OkxController],
  providers: [OkxService],
  exports: [OkxService],
})
export class OkxModule {}
