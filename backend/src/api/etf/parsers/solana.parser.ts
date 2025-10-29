import * as puppeteer from 'puppeteer';
import { SolFlowData } from '../etf-types';

export async function parseSolana(
  page: puppeteer.Page,
): Promise<SolFlowData[]> {
  const flowData: SolFlowData[] = await page.evaluate(() => {
    const table = document.querySelector('table.etf');
    if (!table) return [] as any;
    const tbody = table.querySelector('tbody');
    if (!tbody) return [] as any;

    const rows = tbody.querySelectorAll('tr');
    const data: any[] = [];

    function parseDate(dateText: string): string | null {
      try {
        const parts = dateText.trim().split(' ');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0]);
        const month = parts[1];
        const year = parseInt(parts[2]);
        if (isNaN(day) || isNaN(year)) return null;
        const monthMap: { [key: string]: number } = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        const monthIndex = monthMap[month];
        if (monthIndex === undefined) return null;
        const date = new Date(Date.UTC(year, monthIndex, day));
        if (
          date.getUTCFullYear() !== year ||
          date.getUTCMonth() !== monthIndex ||
          date.getUTCDate() !== day
        )
          return null;
        return date.toISOString().split('T')[0];
      } catch {
        return null;
      }
    }

    function parseNumber(text: string | null | undefined): number {
      if (!text) return 0;
      try {
        const cleanText = text.replace(/[^\d.,-]/g, '');
        if (text.includes('(') && text.includes(')')) {
          const number = parseFloat(cleanText.replace(/[()]/g, ''));
          return isNaN(number) ? 0 : -number;
        }
        const numberText = cleanText.replace(/,/g, '');
        const number = parseFloat(numberText);
        return isNaN(number) ? 0 : number;
      } catch {
        return 0;
      }
    }

    const getCellText = (td: Element | null | undefined): string | null => {
      if (!td) return null;
      const span = td.querySelector('span.tabletext');
      const raw = (span ? span.textContent : td.textContent) || '';
      return raw.trim();
    };

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const firstCellText = getCellText(cells[0]);
        if (!firstCellText) return;

        if (firstCellText === 'Seed') {
          const bitwiseSeed = parseNumber(getCellText(cells[1]));
          const grayscaleSeed = parseNumber(getCellText(cells[2]));
          const totalSeed = (bitwiseSeed || 0) + (grayscaleSeed || 0);
          data.push({
            date: '2025-10-27',
            bitwise: bitwiseSeed,
            grayscale: grayscaleSeed,
            total: totalSeed,
          });
          return;
        }

        if (firstCellText === 'Total') return;

        const parsedDate = parseDate(firstCellText);
        if (!parsedDate) return;

        const bitwise = parseNumber(getCellText(cells[1]));
        const grayscale = parseNumber(getCellText(cells[2]));
        const total = (bitwise || 0) + (grayscale || 0);

        const today = new Date().toISOString().split('T')[0];
        if (parsedDate === today) {
          const allZero = [bitwise, grayscale, total].every(
            (v) => (v || 0) === 0,
          );
          if (allZero) return;
        }

        data.push({ date: parsedDate, bitwise, grayscale, total });
      }
    });

    return data;
  });

  return flowData;
}
