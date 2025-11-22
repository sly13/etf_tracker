import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get('public')
  async getPublicLanguages() {
    const languages = await this.languagesService.findActive();
    return {
      success: true,
      languages,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllLanguages() {
    const languages = await this.languagesService.findAll();
    return {
      success: true,
      languages,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getLanguageById(@Param('id') id: string) {
    const language = await this.languagesService.findOne(parseInt(id));
    return {
      success: true,
      language,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLanguage(
    @Body()
    data: {
      code: string;
      name: string;
      nativeName: string;
      isActive?: boolean;
    },
  ) {
    const language = await this.languagesService.create(data);
    return {
      success: true,
      language,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateLanguage(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      nativeName?: string;
      isActive?: boolean;
    },
  ) {
    const language = await this.languagesService.update(parseInt(id), data);
    return {
      success: true,
      language,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteLanguage(@Param('id') id: string) {
    await this.languagesService.delete(parseInt(id));
    return {
      success: true,
      message: 'Language deleted successfully',
    };
  }
}

