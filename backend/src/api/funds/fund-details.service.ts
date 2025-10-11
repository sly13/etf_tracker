import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class FundDetailsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.fundDetail.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByFundKey(fundKey: string, language?: string) {
    const fund = await this.prisma.fundDetail.findUnique({
      where: {
        fundKey,
      },
    });

    if (!fund) {
      throw new NotFoundException(`Fund with key ${fundKey} not found`);
    }

    return fund;
  }

  private async getFundHoldings(fundKey: string) {
    // Получаем последние данные из таблиц потоков
    const latestETFFlow = await this.prisma.eTFFlow.findFirst({
      orderBy: { date: 'desc' },
    });

    const latestBTCFlow = await this.prisma.bTCFlow.findFirst({
      orderBy: { date: 'desc' },
    });

    // Маппинг ключей фондов на поля в таблицах
    const fundFieldMap: Record<string, string> = {
      blackrock: 'blackrock',
      fidelity: 'fidelity',
      bitwise: 'bitwise',
      twentyOneShares: 'twentyOneShares',
      vanEck: 'vanEck',
      invesco: 'invesco',
      franklin: 'franklin',
      grayscale: 'grayscale',
      grayscaleCrypto: 'grayscaleEth',
      valkyrie: 'valkyrie',
      wisdomTree: 'wisdomTree',
    };

    const fieldName = fundFieldMap[fundKey];
    if (!fieldName) {
      return {
        btcHoldings: BigInt(0),
        ethHoldings: BigInt(0),
        totalAssets: BigInt(0),
      };
    }

    // Получаем значения из таблиц потоков
    const btcFlow = latestBTCFlow?.[fieldName] || 0;
    const ethFlow = latestETFFlow?.[fieldName] || 0;

    // Конвертируем в BigInt (предполагаем, что значения в миллионах)
    const btcHoldings = BigInt(Math.round((btcFlow || 0) * 1000000));
    const ethHoldings = BigInt(Math.round((ethFlow || 0) * 1000000));
    const totalAssets = btcHoldings + ethHoldings;

    return {
      btcHoldings,
      ethHoldings,
      totalAssets,
    };
  }

  async create(data: {
    fundKey: string;
    name: string;
    description?: string;
    logoUrl?: string;
    ticker?: string;
    fundType?: string;
    feePercentage?: number;
    launchDate?: Date;
    status?: string;
  }) {
    return this.prisma.fundDetail.create({
      data,
    });
  }

  async update(
    fundKey: string,
    data: {
      name?: string;
      description?: string;
      logoUrl?: string;
      ticker?: string;
      fundType?: string;
      feePercentage?: number;
      launchDate?: Date;
      status?: string;
    },
  ) {
    return this.prisma.fundDetail.update({
      where: {
        fundKey,
      },
      data,
    });
  }

  async delete(fundKey: string) {
    return this.prisma.fundDetail.delete({
      where: {
        fundKey,
      },
    });
  }
}
