import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

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

  // Получить все Solana потоки
  findAllSolana() {
    return this.prisma.solFlow.findMany({
      orderBy: { date: 'desc' },
    });
  }

  // Получить Solana поток по ID
  findOneSolana(id: string) {
    return this.prisma.solFlow.findUnique({
      where: { id },
    });
  }

  // Получить Solana поток по дате
  findByDateSolana(date: Date) {
    return this.prisma.solFlow.findUnique({
      where: { date },
    });
  }

  // Upsert Solana поток на дату
  async upsertSolana(params: {
    date: Date;
    bitwise?: number | null;
    grayscale?: number | null;
    total?: number | null;
  }) {
    const { date, bitwise, grayscale, total } = params;
    return this.prisma.solFlow.upsert({
      where: { date },
      update: {
        bitwise,
        grayscale,
        total,
        updatedAt: new Date(),
      },
      create: {
        date,
        bitwise: bitwise ?? null,
        grayscale: grayscale ?? null,
        total: total ?? null,
      },
    });
  }
}
