import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { FundDetailsService } from './fund-details.service';

@Controller('funds')
export class FundDetailsController {
  constructor(private fundDetailsService: FundDetailsService) {}

  @Get()
  async getAllFunds() {
    return this.fundDetailsService.findAll();
  }

  @Get(':fundKey')
  async getFundDetails(
    @Param('fundKey') fundKey: string,
    @Query('lang') language?: string,
  ) {
    return this.fundDetailsService.findByFundKey(fundKey, language);
  }

  @Post()
  async createFund(@Body() data: any) {
    return this.fundDetailsService.create(data);
  }

  @Put(':fundKey')
  async updateFund(@Param('fundKey') fundKey: string, @Body() data: any) {
    return this.fundDetailsService.update(fundKey, data);
  }

  @Delete(':fundKey')
  async deleteFund(@Param('fundKey') fundKey: string) {
    return this.fundDetailsService.delete(fundKey);
  }

  // Методы для работы с переводами
  @Get(':fundKey/translations')
  async getTranslations(@Param('fundKey') fundKey: string) {
    return this.fundDetailsService.getTranslations(fundKey);
  }

  @Post(':fundKey/translations')
  async createOrUpdateTranslation(
    @Param('fundKey') fundKey: string,
    @Body()
    data: {
      language: string;
      name?: string;
      description?: string;
    },
  ) {
    return this.fundDetailsService.createOrUpdateTranslation(
      fundKey,
      data.language,
      {
        name: data.name,
        description: data.description,
      },
    );
  }

  @Delete(':fundKey/translations/:language')
  async deleteTranslation(
    @Param('fundKey') fundKey: string,
    @Param('language') language: string,
  ) {
    return this.fundDetailsService.deleteTranslation(fundKey, language);
  }
}
