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
}

interface Translations {
  dataFor: string;
  ethereumETF: string;
  bitcoinETF: string;
  total: string;
  overallTotals: string;
  overallTotal: string;
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
        total: 'Итого',
        overallTotals: 'Общие итоги',
        overallTotal: 'Общий итог',
        createdBy: 'Создано в ETF Tracker',
      },
      en: {
        dataFor: 'Data for',
        ethereumETF: 'Ethereum ETF',
        bitcoinETF: 'Bitcoin ETF',
        total: 'Total',
        overallTotals: 'Overall Totals',
        overallTotal: 'Overall Total',
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

      // Создаем canvas
      const canvas = createCanvas(900, 1500);
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
          'Ξ',
          '#3B82F6',
          data.ethereum,
          yOffset,
        );
        yOffset += 50;
      }

      // Рисуем данные Bitcoin
      if (data.bitcoin) {
        yOffset = this.drawCryptoSection(
          ctx,
          'Bitcoin ETF',
          '₿',
          '#F97316',
          data.bitcoin,
          yOffset,
        );
        yOffset += 50;
      }

      // Рисуем итоги
      this.drawSummarySection(ctx, data, yOffset, lang);

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
    const [latestEthereum, latestBitcoin] = await Promise.all([
      this.prisma.eTFFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
      this.prisma.bTCFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
    ]);

    // Выбираем самую позднюю дату из двух таблиц
    const dates = [latestEthereum?.date, latestBitcoin?.date].filter(
      (date): date is Date => date !== null,
    );
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

    const [ethereumData, bitcoinData] = await Promise.all([
      this.prisma.eTFFlow.findUnique({
        where: { date: targetDate },
      }),
      this.prisma.bTCFlow.findUnique({
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
    icon: string,
    color: string,
    data: any,
    yOffset: number,
  ): number {
    const x = 80;
    const width = 740;
    const padding = 30;

    // Вычисляем высоту секции на основе количества компаний
    const companies = this.getCompaniesFromData(data);
    const baseHeight = 100; // заголовок + отступы
    const companyHeight = 28; // высота одной строки компании
    const totalHeight = Math.max(
      450,
      baseHeight + companies.length * companyHeight + 80,
    ); // минимум 450px

    // Фон секции с закругленными углами
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.drawRoundedRect(ctx, x, yOffset, width, totalHeight, 15);
    ctx.fill();

    // Граница с закругленными углами
    ctx.strokeStyle = color + '4D';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, x, yOffset, width, totalHeight, 15);
    ctx.stroke();

    // Заголовок секции
    ctx.fillStyle = color;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(icon, x + padding, yOffset + padding);
    ctx.fillText(title, x + padding + 50, yOffset + padding);

    let currentY = yOffset + padding + 50;

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
      currentY += 28;
    });

    // Итого
    currentY += 15;
    ctx.strokeStyle = color + '4D';
    ctx.beginPath();
    ctx.moveTo(x + padding, currentY);
    ctx.lineTo(x + width - padding, currentY);
    ctx.stroke();

    currentY += 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Итого:', x + padding, currentY);

    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(this.formatAmount(data.total), x + width - padding, currentY);
    ctx.textAlign = 'left';

    return yOffset + totalHeight;
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
    const amountColor = isPositive ? '#10B981' : '#EF4444';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(name, x, y);

    ctx.fillStyle = amountColor;
    ctx.textAlign = 'right';
    ctx.font = '16px Arial';
    ctx.fillText(
      `${isPositive ? '+' : ''}${this.formatAmount(amount)}`,
      x + width,
      y,
    );
    ctx.textAlign = 'left';
  }

  /**
   * Нарисовать секцию итогов
   */
  private drawSummarySection(
    ctx: CanvasRenderingContext2D,
    data: DailyETFData,
    yOffset: number,
    lang: string = 'ru',
  ): void {
    const x = 80;
    const width = 740;
    const padding = 30;

    // Фон секции с закругленными углами
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.drawRoundedRect(ctx, x, yOffset, width, 220, 15);
    ctx.fill();

    // Граница с закругленными углами
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, x, yOffset, width, 220, 15);
    ctx.stroke();

    const t = this.getTranslations(lang);

    // Заголовок
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(t.overallTotals, x + padding, yOffset + padding);

    let currentY = yOffset + padding + 35;

    // Ethereum итог
    if (data.ethereum) {
      this.drawSummaryRow(
        ctx,
        'Ethereum',
        data.ethereum.total,
        x + padding,
        currentY,
        width - 2 * padding,
        '#3B82F6',
      );
      currentY += 30;
    }

    // Bitcoin итог
    if (data.bitcoin) {
      this.drawSummaryRow(
        ctx,
        'Bitcoin',
        data.bitcoin.total,
        x + padding,
        currentY,
        width - 2 * padding,
        '#F97316',
      );
      currentY += 30;
    }

    // Общий итог
    const overallTotal =
      (data.ethereum?.total || 0) + (data.bitcoin?.total || 0);
    currentY += 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x + padding, currentY);
    ctx.lineTo(x + width - padding, currentY);
    ctx.stroke();

    currentY += 25;
    const overallColor = overallTotal > 0 ? '#10B981' : '#EF4444';
    this.drawSummaryRow(
      ctx,
      t.overallTotal,
      overallTotal,
      x + padding,
      currentY,
      width - 2 * padding,
      overallColor,
      true,
    );
  }

  /**
   * Нарисовать строку итогов
   */
  private drawSummaryRow(
    ctx: CanvasRenderingContext2D,
    label: string,
    amount: number,
    x: number,
    y: number,
    width: number,
    color: string,
    isBold = false,
  ): void {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = isBold ? 'bold 18px Arial' : '16px Arial';
    ctx.fillText(label, x, y);

    ctx.fillStyle = color;
    ctx.font = isBold ? 'bold 20px Arial' : '16px Arial';
    ctx.textAlign = 'right';
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
        value !== undefined
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
    if (amount === 0) return '0.0M$';

    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 1000) {
      return `${sign}${(absAmount / 1000).toFixed(1)}B$`;
    } else {
      return `${sign}${absAmount.toFixed(1)}M$`;
    }
  }
}
