const puppeteer = require('puppeteer');

async function parseBitcoinETFFlowData() {
  let browser;
  
  try {
    console.log('Запускаю браузер для парсинга данных о потоках Bitcoin ETF...');
    
    // Запускаем браузер
    browser = await puppeteer.launch({
      headless: false, // Показываем браузер для отладки
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Устанавливаем User-Agent как у реального браузера
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
    
    // Устанавливаем viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Перехожу на страницу с данными Bitcoin ETF...');
    
    // Переходим на страницу
    await page.goto('https://farside.co.uk/bitcoin-etf-flow-all-data/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('Страница загружена, жду загрузки таблицы...');
    
    // Ждем появления таблицы
    await page.waitForSelector('table.etf', { timeout: 10000 });
    
    console.log('Таблица найдена, начинаю парсинг...');
    
    // Получаем количество строк в таблице
    const rowCount = await page.evaluate(() => {
      const table = document.querySelector('table.etf');
      if (!table) return 0;
      
      const tbody = table.querySelector('tbody');
      if (!tbody) return 0;
      
      return tbody.querySelectorAll('tr').length;
    });
    
    console.log(`Найдено ${rowCount} строк в таблице Bitcoin ETF`);
    
    // Парсим данные
    const flowData = await page.evaluate(() => {
      const table = document.querySelector('table.etf');
      if (!table) return [];
      
      const tbody = table.querySelector('tbody');
      if (!tbody) return [];
      
      const rows = tbody.querySelectorAll('tr');
      const data = [];
      
      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        
        if (cells.length >= 11) {
          const firstCellText = cells[0].querySelector('span.tabletext')?.textContent?.trim();
          
          // Пропускаем строки без дат (например, "Seed")
          if (firstCellText && firstCellText !== 'Seed') {
            try {
              // Парсим дату
              const date = new Date(firstCellText);
              if (!isNaN(date.getTime())) {
                const flowDataItem = {
                  date: date.toISOString().split('T')[0],
                  blackrock: parseNumber(cells[1].querySelector('span.tabletext')?.textContent),
                  fidelity: parseNumber(cells[2].querySelector('span.tabletext')?.textContent),
                  bitwise: parseNumber(cells[3].querySelector('span.tabletext')?.textContent),
                  twentyOneShares: parseNumber(cells[4].querySelector('span.tabletext')?.textContent),
                  vanEck: parseNumber(cells[5].querySelector('span.tabletext')?.textContent),
                  invesco: parseNumber(cells[6].querySelector('span.tabletext')?.textContent),
                  franklin: parseNumber(cells[7].querySelector('span.tabletext')?.textContent),
                  grayscale: parseNumber(cells[8].querySelector('span.tabletext')?.textContent),
                  grayscaleBtc: parseNumber(cells[9].querySelector('span.tabletext')?.textContent),
                  total: parseNumber(cells[10].querySelector('span.tabletext')?.textContent),
                };
                
                data.push(flowDataItem);
                console.log(`Обработана строка ${index + 1}: ${flowDataItem.date} - Total: ${flowDataItem.total}`);
              }
            } catch (error) {
              console.log(`Ошибка при обработке строки ${index + 1}:`, error);
            }
          }
        }
      });
      
      return data;
      
      function parseNumber(text) {
        if (!text) return 0;
        
        try {
          // Убираем все символы кроме цифр, точек, запятых и минусов
          const cleanText = text.replace(/[^\d.,\-]/g, '');
          
          // Обрабатываем отрицательные числа в скобках
          if (text.includes('(') && text.includes(')')) {
            const number = parseFloat(cleanText.replace(/[()]/g, ''));
            return isNaN(number) ? 0 : -number;
          }
          
          // Заменяем запятые на точки и парсим
          const number = parseFloat(cleanText.replace(',', '.'));
          return isNaN(number) ? 0 : number;
        } catch {
          return 0;
        }
      }
    });
    
    console.log(`\nУспешно спарсено ${flowData.length} записей о потоках Bitcoin ETF`);
    
    if (flowData.length > 0) {
      console.log('\nПервые 5 записей:');
      flowData.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.date} - Total: ${item.total}`);
      });
      
      if (flowData.length > 5) {
        console.log(`... и еще ${flowData.length - 5} записей`);
      }
      
      console.log('\nПоследние 5 записей:');
      flowData.slice(-5).forEach((item, index) => {
        console.log(`${flowData.length - 4 + index}. ${item.date} - Total: ${item.total}`);
      });
    }
    
    // Сохраняем полные данные в JSON файл
    const fs = require('fs');
    fs.writeFileSync('bitcoin-etf-flow-data.json', JSON.stringify(flowData, null, 2));
    console.log('\nПолные данные сохранены в файл bitcoin-etf-flow-data.json');
    
    return flowData;
    
  } catch (error) {
    console.error('Ошибка при парсинге данных Bitcoin ETF:', error.message);
    throw error;
  } finally {
    if (browser) {
      console.log('Закрываю браузер...');
      await browser.close();
    }
  }
}

// Запускаем парсинг
parseBitcoinETFFlowData()
  .then(() => {
    console.log('\nПарсинг Bitcoin ETF завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nПарсинг Bitcoin ETF завершился с ошибкой:', error.message);
    process.exit(1);
  });
