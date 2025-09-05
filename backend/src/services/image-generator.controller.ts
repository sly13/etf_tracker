import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ImageGeneratorService } from './image-generator.service';

@Controller('image')
export class ImageGeneratorController {
  constructor(private readonly imageGeneratorService: ImageGeneratorService) {}

  /**
   * Сгенерировать изображение с данными ETF за день
   */
  @Get('daily/:date')
  async generateDailyETFImage(
    @Param('date') date: string,
    @Query('lang') lang: string = 'ru',
    @Res() res: Response,
  ) {
    try {
      const imageBuffer =
        await this.imageGeneratorService.generateDailyETFImage(date, lang);

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="etf_daily_${date}.png"`,
        'Cache-Control': 'no-cache',
      });

      res.send(imageBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка генерации изображения',
        error: error.message,
      });
    }
  }

  /**
   * Сгенерировать изображение с данными за последнюю доступную дату
   */
  @Get('today')
  async generateTodayETFImage(
    @Query('lang') lang: string = 'ru',
    @Res() res: Response,
  ) {
    try {
      // Получаем последнюю доступную дату из базы данных
      const latestDate =
        await this.imageGeneratorService.getLatestAvailableDate();
      return this.generateDailyETFImage(latestDate, lang, res);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Нет данных в базе данных',
        error: error.message,
      });
    }
  }
}
