import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EtfService {
  constructor(private prisma: PrismaService) {}

  // Получить все ETF потоки (Ethereum)
  findAll() {
    return this.prisma.eTFFlow.findMany({
      orderBy: { date: 'desc' },
    });
  }

  // Получить ETF поток по ID
  findOne(id: string) {
    return this.prisma.eTFFlow.findUnique({
      where: { id },
    });
  }

  // Получить ETF поток по дате
  findByDate(date: Date) {
    return this.prisma.eTFFlow.findUnique({
      where: { date },
    });
  }

  // Получить все Bitcoin потоки
  findAllBitcoin() {
    return this.prisma.bTCFlow.findMany({
      orderBy: { date: 'desc' },
    });
  }

  // Получить Bitcoin поток по ID
  findOneBitcoin(id: string) {
    return this.prisma.bTCFlow.findUnique({
      where: { id },
    });
  }

  // Получить Bitcoin поток по дате
  findByDateBitcoin(date: Date) {
    return this.prisma.bTCFlow.findUnique({
      where: { date },
    });
  }
}
