import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MLService } from './ml.service';

@Controller('ml')
export class MLController {
  constructor(private readonly mlService: MLService) {}

  @Get('predict')
  async getPrediction() {
    try {
      const prediction = await this.mlService.getBitcoinPrediction();
      return {
        success: true,
        data: prediction,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('predict')
  async predictFromData(@Body() data: any) {
    try {
      const prediction = await this.mlService.predictFromData(data);
      return {
        success: true,
        data: prediction,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('model-info')
  async getModelInfo() {
    try {
      const info = await this.mlService.getModelInfo();
      return {
        success: true,
        data: info,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  healthCheck() {
    return {
      success: true,
      message: 'ML Service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
