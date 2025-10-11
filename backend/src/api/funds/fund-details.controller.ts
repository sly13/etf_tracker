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
}
