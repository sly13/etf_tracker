import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('funds/logos')
@UseGuards(JwtAuthGuard)
export class FundLogoController {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'fund_logos');

  constructor() {
    // Создаем папку для загрузок, если её нет
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  @Post('upload')
  @UseInterceptors(
    (() => {
      const uploadPath = join(process.cwd(), 'uploads', 'fund_logos');
      return FileInterceptor('logo', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            // Генерируем уникальное имя файла
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `logo-${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          // Разрешаем только изображения
          if (
            file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/) ||
            extname(file.originalname).match(/\.(jpg|jpeg|png|gif|webp)$/i)
          ) {
            cb(null, true);
          } else {
            cb(
              new Error(
                'Разрешены только изображения (jpg, jpeg, png, gif, webp)',
              ),
              false,
            );
          }
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      });
    })(),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File): {
    success: boolean;
    url: string;
    filename: string;
  } {
    if (!file) {
      throw new Error('Файл не был загружен');
    }

    const url = `/uploads/fund_logos/${file.filename}`;
    return {
      success: true,
      url,
      filename: file.filename,
    };
  }

  @Delete(':filename')
  deleteLogo(@Param('filename') filename: string, @Res() res: Response): void {
    try {
      const filePath = join(this.uploadPath, filename);

      // Проверяем, что файл существует
      if (!existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Файл не найден',
        });
        return;
      }

      // Удаляем файл
      unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Файл успешно удален',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении файла',
        error: error.message,
      });
    }
  }
}
