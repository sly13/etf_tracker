import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class FundDetailsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const funds = await this.prisma.fundDetail.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        translations: {
          select: {
            language: true,
          },
        },
      },
    });

    // Добавляем информацию о доступных языках для каждого фонда
    return funds.map((fund) => ({
      ...fund,
      availableLanguages: fund.translations.map((t) => t.language),
    }));
  }

  async findByFundKey(fundKey: string, language?: string) {
    const fund = await this.prisma.fundDetail.findUnique({
      where: {
        fundKey,
      },
      include: {
        translations: true,
      },
    });

    if (!fund) {
      throw new NotFoundException(`Fund with key ${fundKey} not found`);
    }

    // Если указан язык, пытаемся найти перевод
    let translatedName = fund.name;
    let translatedDescription = fund.description;

    if (language) {
      const translation = fund.translations.find(
        (t) => t.language === language,
      );
      if (translation) {
        if (translation.name) {
          translatedName = translation.name;
        }
        if (translation.description) {
          translatedDescription = translation.description;
        }
      }
    }

    // Получаем данные о владениях
    const holdings = await this.getFundHoldings(fundKey);

    // Объединяем данные фонда с владениями
    // Преобразуем BigInt в строки для JSON сериализации
    return {
      ...fund,
      name: translatedName,
      description: translatedDescription,
      btcHoldings: holdings.btcHoldings.toString(),
      ethHoldings: holdings.ethHoldings.toString(),
      totalAssets: holdings.totalAssets.toString(),
      availableLanguages: fund.translations.map((t) => t.language),
    };
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

  // Методы для работы с переводами
  async getTranslations(fundKey: string) {
    const fund = await this.prisma.fundDetail.findUnique({
      where: { fundKey },
      include: { translations: true },
    });

    if (!fund) {
      throw new NotFoundException(`Fund with key ${fundKey} not found`);
    }

    return fund.translations;
  }

  async createOrUpdateTranslation(
    fundKey: string,
    language: string,
    data: { name?: string; description?: string },
  ) {
    const fund = await this.prisma.fundDetail.findUnique({
      where: { fundKey },
    });

    if (!fund) {
      throw new NotFoundException(`Fund with key ${fundKey} not found`);
    }

    return this.prisma.fundTranslation.upsert({
      where: {
        fundId_language: {
          fundId: fund.id,
          language,
        },
      },
      update: {
        name: data.name,
        description: data.description,
      },
      create: {
        fundId: fund.id,
        language,
        name: data.name,
        description: data.description,
      },
    });
  }

  async deleteTranslation(fundKey: string, language: string) {
    const fund = await this.prisma.fundDetail.findUnique({
      where: { fundKey },
    });

    if (!fund) {
      throw new NotFoundException(`Fund with key ${fundKey} not found`);
    }

    return this.prisma.fundTranslation.delete({
      where: {
        fundId_language: {
          fundId: fund.id,
          language,
        },
      },
    });
  }
}
