import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export interface DailyETFData {
  date: string;
  ethereum: {
    blackrock: number;
    fidelity: number;
    bitwise: number;
    twentyOneShares: number;
    vanEck: number;
    invesco: number;
    franklin: number;
    grayscale: number;
    grayscaleEth: number;
    total: number;
  } | null;
  bitcoin: {
    blackrock: number;
    fidelity: number;
    bitwise: number;
    twentyOneShares: number;
    vanEck: number;
    invesco: number;
    franklin: number;
    grayscale: number;
    grayscaleBtc: number;
    valkyrie: number;
    wisdomTree: number;
    total: number;
  } | null;
  solana: {
    bitwise: number;
    grayscale: number;
    total: number;
  } | null;
}

interface Translations {
  dataFor: string;
  ethereumETF: string;
  bitcoinETF: string;
  solanaETF: string;
  total: string;
  company: string;
  flow: string;
  createdBy: string;
}

@Injectable()
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить переводы для указанного языка
   */
  private getTranslations(lang: string): Translations {
    const translations: Record<string, Translations> = {
      ru: {
        dataFor: 'Данные за',
        ethereumETF: 'Ethereum ETF',
        bitcoinETF: 'Bitcoin ETF',
        solanaETF: 'Solana ETF',
        total: 'Итого',
        company: 'Company',
        flow: 'Flow',
        createdBy: 'Created by ETF Tracker',
      },
      en: {
        dataFor: 'Data for',
        ethereumETF: 'Ethereum ETF',
        bitcoinETF: 'Bitcoin ETF',
        solanaETF: 'Solana ETF',
        total: 'Total',
        company: 'Company',
        flow: 'Flow',
        createdBy: 'Created by ETF Tracker',
      },
    };

    return translations[lang] || translations.ru;
  }

  /**
   * Создать изображение с данными ETF за день
   */
  async generateDailyETFImage(
    date: string,
    lang: string = 'ru',
  ): Promise<Buffer> {
    try {
      // Получаем данные за день
      const data = await this.getDailyETFData(date);

      // Создаем canvas (увеличиваем высоту для нового дизайна)
      const canvas = createCanvas(900, 1600);
      const ctx = canvas.getContext('2d');

      // Настраиваем стили
      this.setupCanvasStyles(ctx);

      // Рисуем фон
      this.drawBackground(ctx, canvas.width, canvas.height);

      // Рисуем заголовок
      this.drawHeader(ctx, date, lang);

      let yOffset = 140;

      // Рисуем данные Ethereum
      if (data.ethereum) {
        yOffset = this.drawCryptoSection(
          ctx,
          'Ethereum ETF',
          'ETH',
          '#007AFF',
          data.ethereum,
          yOffset,
          lang,
        );
        yOffset += 30;
      }

      // Рисуем данные Bitcoin
      if (data.bitcoin) {
        yOffset = this.drawCryptoSection(
          ctx,
          'Bitcoin ETF',
          'BTC',
          '#FFA500',
          data.bitcoin,
          yOffset,
          lang,
        );
        yOffset += 30;
      }

      // Рисуем данные Solana
      if (data.solana) {
        yOffset = this.drawCryptoSection(
          ctx,
          'Solana ETF',
          'SOL',
          '#8A2BE2',
          data.solana,
          yOffset,
          lang,
        );
        yOffset += 30;
      }

      // Рисуем подвал
      this.drawFooter(ctx, canvas.width, canvas.height, lang);

      return canvas.toBuffer('image/png');
    } catch (error) {
      this.logger.error('Ошибка генерации изображения:', error);
      throw error;
    }
  }

  /**
   * Получить последнюю доступную дату из базы данных
   */
  async getLatestAvailableDate(): Promise<string> {
    const [latestEthereum, latestBitcoin, latestSolana] = await Promise.all([
      this.prisma.eTFFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
      this.prisma.bTCFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
      this.prisma.solFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
    ]);

    // Выбираем самую позднюю дату из всех таблиц
    const dates = [
      latestEthereum?.date,
      latestBitcoin?.date,
      latestSolana?.date,
    ].filter((date): date is Date => date !== null);
    if (dates.length === 0) {
      throw new Error('Нет данных в базе данных');
    }

    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    return latestDate.toISOString().split('T')[0];
  }

  /**
   * Получить данные ETF за день
   */
  private async getDailyETFData(date: string): Promise<DailyETFData> {
    const targetDate = new Date(date);

    const [ethereumData, bitcoinData, solanaData] = await Promise.all([
      this.prisma.eTFFlow.findUnique({
        where: { date: targetDate },
      }),
      this.prisma.bTCFlow.findUnique({
        where: { date: targetDate },
      }),
      this.prisma.solFlow.findUnique({
        where: { date: targetDate },
      }),
    ]);

    return {
      date,
      ethereum: ethereumData
        ? {
            blackrock: ethereumData.blackrock || 0,
            fidelity: ethereumData.fidelity || 0,
            bitwise: ethereumData.bitwise || 0,
            twentyOneShares: ethereumData.twentyOneShares || 0,
            vanEck: ethereumData.vanEck || 0,
            invesco: ethereumData.invesco || 0,
            franklin: ethereumData.franklin || 0,
            grayscale: ethereumData.grayscale || 0,
            grayscaleEth: ethereumData.grayscaleEth || 0,
            total: ethereumData.total || 0,
          }
        : null,
      bitcoin: bitcoinData
        ? {
            blackrock: bitcoinData.blackrock || 0,
            fidelity: bitcoinData.fidelity || 0,
            bitwise: bitcoinData.bitwise || 0,
            twentyOneShares: bitcoinData.twentyOneShares || 0,
            vanEck: bitcoinData.vanEck || 0,
            invesco: bitcoinData.invesco || 0,
            franklin: bitcoinData.franklin || 0,
            grayscale: bitcoinData.grayscale || 0,
            grayscaleBtc: bitcoinData.grayscaleBtc || 0,
            valkyrie: bitcoinData.valkyrie || 0,
            wisdomTree: bitcoinData.wisdomTree || 0,
            total: bitcoinData.total || 0,
          }
        : null,
      solana: solanaData
        ? {
            bitwise: solanaData.bitwise || 0,
            grayscale: solanaData.grayscale || 0,
            total: solanaData.total || 0,
          }
        : null,
    };
  }

  /**
   * Настроить стили canvas
   */
  private setupCanvasStyles(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  /**
   * Нарисовать закругленный прямоугольник
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Нарисовать фон
   */
  private drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1A1A1A');
    gradient.addColorStop(1, '#2D2D2D');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Нарисовать заголовок
   */
  private drawHeader(
    ctx: CanvasRenderingContext2D,
    date: string,
    lang: string = 'ru',
  ): void {
    const t = this.getTranslations(lang);

    // Заголовок приложения
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ETF Tracker', 450, 50);

    // Дата
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '22px Arial';
    ctx.fillText(`${t.dataFor} ${date}`, 450, 100);

    ctx.textAlign = 'left';
  }

  /**
   * Нарисовать секцию криптовалюты
   */
  private drawCryptoSection(
    ctx: CanvasRenderingContext2D,
    title: string,
    tag: string,
    color: string,
    data: any,
    yOffset: number,
    lang: string = 'ru',
  ): number {
    const x = 50;
    const width = 800;
    const padding = 24;
    const t = this.getTranslations(lang);

    // Вычисляем высоту секции на основе количества компаний
    const companies = this.getCompaniesFromData(data);
    const headerHeight = 80;
    const tableHeaderHeight = 30;
    const companyHeight = 35;
    const totalHeight = 50;
    const sectionHeight =
      headerHeight +
      tableHeaderHeight +
      companies.length * companyHeight +
      totalHeight +
      padding * 2;

    // Фон карточки с закругленными углами (#2C2C2C)
    ctx.fillStyle = '#2C2C2C';
    this.drawRoundedRect(ctx, x, yOffset, width, sectionHeight, 12);
    ctx.fill();

    // Иконка слева (круглая с цветной границей)
    const iconX = x + padding;
    const iconY = yOffset + padding + 20;
    const iconRadius = 12;

    // Внешний круг (граница)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(iconX + iconRadius, iconY, iconRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Внутренний круг (заливка)
    ctx.fillStyle = color + '33'; // 20% прозрачности
    ctx.beginPath();
    ctx.arc(iconX + iconRadius, iconY, iconRadius - 1, 0, Math.PI * 2);
    ctx.fill();

    // Вертикальная линия от иконки
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(iconX + iconRadius, iconY + iconRadius);
    ctx.lineTo(iconX + iconRadius, yOffset + sectionHeight - padding);
    ctx.stroke();

    // Заголовок секции
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(title, iconX + iconRadius * 2 + 15, iconY - 8);

    // Тег справа
    const tagX = x + width - padding - 60;
    const tagY = yOffset + padding + 15;
    const tagWidth = 50;
    const tagHeight = 28;

    // Фон тега
    ctx.fillStyle = color + '33';
    this.drawRoundedRect(ctx, tagX, tagY, tagWidth, tagHeight, 14);
    ctx.fill();

    // Граница тега
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    this.drawRoundedRect(ctx, tagX, tagY, tagWidth, tagHeight, 14);
    ctx.stroke();

    // Текст тега
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tag, tagX + tagWidth / 2, tagY + 7);
    ctx.textAlign = 'left';

    // Заголовки таблицы
    let currentY = yOffset + headerHeight;
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + padding, currentY);
    ctx.lineTo(x + width - padding, currentY);
    ctx.stroke();

    currentY += 10;
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '14px Arial';
    ctx.fillText(t.company, x + padding, currentY);

    ctx.fillStyle = '#AAAAAA';
    ctx.textAlign = 'right';
    ctx.fillText(t.flow, x + width - padding, currentY);
    ctx.textAlign = 'left';

    currentY += 25;

    // Компании
    companies.forEach(([name, amount]) => {
      this.drawCompanyRow(
        ctx,
        name,
        amount,
        x + padding,
        currentY,
        width - 2 * padding,
      );
      currentY += companyHeight;
    });

    // Разделитель перед итогом
    currentY += 10;
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + padding, currentY);
    ctx.lineTo(x + width - padding, currentY);
    ctx.stroke();

    // Итого
    currentY += 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(t.total, x + padding, currentY);

    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(this.formatAmount(data.total), x + width - padding, currentY);
    ctx.textAlign = 'left';

    return yOffset + sectionHeight;
  }

  /**
   * Нарисовать строку компании
   */
  private drawCompanyRow(
    ctx: CanvasRenderingContext2D,
    name: string,
    amount: number,
    x: number,
    y: number,
    width: number,
  ): void {
    const isPositive = amount > 0;
    const amountColor = isPositive ? '#00FF00' : '#FF0000';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(name, x, y);

    ctx.fillStyle = amountColor;
    ctx.textAlign = 'right';
    ctx.font = '16px Arial';
    ctx.fillText(this.formatAmount(amount), x + width, y);
    ctx.textAlign = 'left';
  }


  /**
   * Нарисовать подвал
   */
  private drawFooter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    lang: string = 'ru',
  ): void {
    const t = this.getTranslations(lang);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.createdBy, width / 2, height - 40);
    ctx.textAlign = 'left';
  }

  /**
   * Получить компании из данных
   */
  private getCompaniesFromData(data: any): [string, number][] {
    const companies: [string, number][] = [];

    const companyMap: Record<string, string> = {
      blackrock: 'BlackRock',
      fidelity: 'Fidelity',
      bitwise: 'Bitwise',
      twentyOneShares: '21Shares',
      vanEck: 'VanEck',
      invesco: 'Invesco',
      franklin: 'Franklin Templeton',
      grayscale: 'Grayscale',
      grayscaleEth: 'Grayscale Crypto',
      grayscaleBtc: 'Grayscale BTC',
      valkyrie: 'Valkyrie',
      wisdomTree: 'WisdomTree',
    };

    Object.entries(data).forEach(([key, value]) => {
      if (
        key !== 'total' &&
        companyMap[key] &&
        value !== null &&
        value !== undefined &&
        value !== 0 // Фильтруем компании с нулевыми значениями
      ) {
        companies.push([companyMap[key], value as number]);
      }
    });

    // Сортируем по убыванию суммы (от больших к меньшим)
    companies.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

    return companies;
  }

  /**
   * Форматировать сумму
   */
  private formatAmount(amount: number): string {
    if (amount === 0) return '0.0M';

    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 1000) {
      return `${sign}${(absAmount / 1000).toFixed(1)}B`;
    } else {
      return `${sign}${absAmount.toFixed(1)}M`;
    }
  }
}
