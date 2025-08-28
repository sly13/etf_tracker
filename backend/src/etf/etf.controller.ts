import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EtfService } from './etf.service';
import { CreateEtfDto } from './dto/create-etf.dto';
import { UpdateEtfDto } from './dto/update-etf.dto';

@Controller('etf')
export class EtfController {
  constructor(private readonly etfService: EtfService) {}

  @Post()
  create(@Body() createEtfDto: CreateEtfDto) {
    return this.etfService.create(createEtfDto);
  }

  @Get()
  findAll() {
    return this.etfService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.etfService.findOne(id);
  }

  @Get('symbol/:symbol')
  findBySymbol(@Param('symbol') symbol: string) {
    return this.etfService.findBySymbol(symbol);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEtfDto: UpdateEtfDto) {
    return this.etfService.update(id, updateEtfDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.etfService.remove(id);
  }
}
