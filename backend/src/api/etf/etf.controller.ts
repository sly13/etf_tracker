import { Controller, Get, Param } from '@nestjs/common';
import { EtfService } from './etf.service';

@Controller('etf')
export class EtfController {
  constructor(private readonly etfService: EtfService) {}

  @Get()
  findAll() {
    return this.etfService.findAll();
  }

  @Get('bitcoin')
  findAllBitcoin() {
    return this.etfService.findAllBitcoin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.etfService.findOne(id);
  }

  @Get('bitcoin/:id')
  findOneBitcoin(@Param('id') id: string) {
    return this.etfService.findOneBitcoin(id);
  }
}
