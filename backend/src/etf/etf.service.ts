import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEtfDto } from './dto/create-etf.dto';
import { UpdateEtfDto } from './dto/update-etf.dto';

@Injectable()
export class EtfService {
  constructor(private prisma: PrismaService) {}

  create(createEtfDto: CreateEtfDto) {
    return this.prisma.eTF.create({
      data: createEtfDto,
    });
  }

  findAll() {
    return this.prisma.eTF.findMany({
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        holdings: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.eTF.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        holdings: true,
      },
    });
  }

  findBySymbol(symbol: string) {
    return this.prisma.eTF.findUnique({
      where: { symbol },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        holdings: true,
      },
    });
  }

  update(id: string, updateEtfDto: UpdateEtfDto) {
    return this.prisma.eTF.update({
      where: { id },
      data: updateEtfDto,
    });
  }

  remove(id: string) {
    return this.prisma.eTF.delete({
      where: { id },
    });
  }
}
