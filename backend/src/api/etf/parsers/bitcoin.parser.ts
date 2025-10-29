import * as puppeteer from 'puppeteer';
import { BTCFlowData } from '../etf-types';

export async function parseBitcoin(
  page: puppeteer.Page,
): Promise<BTCFlowData[]> {
  const flowData: BTCFlowData[] = await page.evaluate(() => {
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

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 13) {
        const firstCellText = cells[0]
          .querySelector('span.tabletext')
          ?.textContent?.trim();
        if (firstCellText && firstCellText !== 'Seed') {
          try {
            const parsedDate = parseDate(firstCellText);
            if (parsedDate) {
              const item = {
                date: parsedDate,
                blackrock: parseNumber(
                  cells[1].querySelector('span.tabletext')?.textContent,
                ),
                fidelity: parseNumber(
                  cells[2].querySelector('span.tabletext')?.textContent,
                ),
                bitwise: parseNumber(
                  cells[3].querySelector('span.tabletext')?.textContent,
                ),
                twentyOneShares: parseNumber(
                  cells[4].querySelector('span.tabletext')?.textContent,
                ),
                invesco: parseNumber(
                  cells[5].querySelector('span.tabletext')?.textContent,
                ),
                franklin: parseNumber(
                  cells[6].querySelector('span.tabletext')?.textContent,
                ),
                valkyrie: parseNumber(
                  cells[7].querySelector('span.tabletext')?.textContent,
                ),
                vanEck: parseNumber(
                  cells[8].querySelector('span.tabletext')?.textContent,
                ),
                wisdomTree: parseNumber(
                  cells[9].querySelector('span.tabletext')?.textContent,
                ),
                grayscale: parseNumber(
                  cells[10].querySelector('span.tabletext')?.textContent,
                ),
                grayscaleBtc: parseNumber(
                  cells[11].querySelector('span.tabletext')?.textContent,
                ),
                total: parseNumber(
                  cells[12].querySelector('span.tabletext')?.textContent,
                ),
              };

              const today = new Date().toISOString().split('T')[0];
              if (item.date === today) {
                const rest: any = { ...(item as any) };
                delete rest.date;
                const allZero = Object.values(rest).every(
                  (v) => (v as any) === 0,
                );
                if (allZero) return;
              }

              data.push(item);
            }
          } catch {
            // ignore
          }
        }
      }
    });

    return data;
  });

  return flowData;
}
