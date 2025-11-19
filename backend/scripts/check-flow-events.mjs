import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFlowEvents() {
  try {
    console.log('🔍 Проверка данных для событий притоков/оттоков...\n');

    // 1. Проверка таблицы etf_new_records
    console.log('📊 Проверка таблицы etf_new_records:');
    try {
      const newRecordsCount = await prisma.eTFNewRecord.count();
      console.log(`   Всего записей: ${newRecordsCount}`);

      if (newRecordsCount > 0) {
        const recentRecords = await prisma.eTFNewRecord.findMany({
          take: 5,
          orderBy: { detectedAt: 'desc' },
          select: {
            id: true,
            date: true,
            assetType: true,
            company: true,
            amount: true,
            detectedAt: true,
          },
        });

        console.log(`   Последние 5 записей:`);
        recentRecords.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.date.toISOString().split('T')[0]} | ${record.assetType} | ${record.company} | ${record.amount}M | ${record.detectedAt.toISOString()}`);
        });
      } else {
        console.log('   ⚠️  Записей нет');
      }
    } catch (error) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('   ❌ Таблица etf_new_records не существует');
      } else {
        console.log(`   ❌ Ошибка: ${error.message}`);
      }
    }

    console.log('\n');

    // 2. Проверка таблиц потоков (для динамической генерации событий)
    console.log('📊 Проверка таблиц потоков:');

    // Ethereum
    try {
      const ethCount = await prisma.eTFFlow.count();
      const ethLatest = await prisma.eTFFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true, total: true },
      });
      console.log(`   Ethereum (eth_flow): ${ethCount} записей`);
      if (ethLatest) {
        console.log(`   Последняя запись: ${ethLatest.date.toISOString().split('T')[0]} (total: ${ethLatest.total || 0}M)`);
      }
    } catch (error) {
      console.log(`   ❌ Ethereum: ${error.message}`);
    }

    // Bitcoin
    try {
      const btcCount = await prisma.bTCFlow.count();
      const btcLatest = await prisma.bTCFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true, total: true },
      });
      console.log(`   Bitcoin (btc_flows): ${btcCount} записей`);
      if (btcLatest) {
        console.log(`   Последняя запись: ${btcLatest.date.toISOString().split('T')[0]} (total: ${btcLatest.total || 0}M)`);
      }
    } catch (error) {
      console.log(`   ❌ Bitcoin: ${error.message}`);
    }

    // Solana
    try {
      const solCount = await prisma.solFlow.count();
      const solLatest = await prisma.solFlow.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true, total: true },
      });
      console.log(`   Solana (sol_flow): ${solCount} записей`);
      if (solLatest) {
        console.log(`   Последняя запись: ${solLatest.date.toISOString().split('T')[0]} (total: ${solLatest.total || 0}M)`);
      }
    } catch (error) {
      console.log(`   ❌ Solana: ${error.message}`);
    }

    console.log('\n');

    // 3. Проверка данных за сегодня для генерации событий
    console.log('📅 Проверка данных за сегодня:');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const ethToday = await prisma.eTFFlow.findFirst({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
      console.log(`   Ethereum сегодня: ${ethToday ? '✅ Есть данные' : '❌ Нет данных'}`);

      const btcToday = await prisma.bTCFlow.findFirst({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
      console.log(`   Bitcoin сегодня: ${btcToday ? '✅ Есть данные' : '❌ Нет данных'}`);

      const solToday = await prisma.solFlow.findFirst({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
      console.log(`   Solana сегодня: ${solToday ? '✅ Есть данные' : '❌ Нет данных'}`);

      // Подсчет событий, которые можно сгенерировать из данных за сегодня
      if (ethToday || btcToday || solToday) {
        let eventCount = 0;
        if (ethToday) {
          const ethFields = ['blackrock', 'fidelity', 'bitwise', 'twentyOneShares', 'vanEck', 'invesco', 'franklin', 'grayscale', 'grayscaleEth'];
          eventCount += ethFields.filter(field => ethToday[field] != null && ethToday[field] !== 0).length;
        }
        if (btcToday) {
          const btcFields = ['blackrock', 'fidelity', 'bitwise', 'twentyOneShares', 'vanEck', 'invesco', 'franklin', 'grayscale', 'grayscaleBtc', 'valkyrie', 'wisdomTree'];
          eventCount += btcFields.filter(field => btcToday[field] != null && btcToday[field] !== 0).length;
        }
        if (solToday) {
          const solFields = ['bitwise', 'grayscale'];
          eventCount += solFields.filter(field => solToday[field] != null && solToday[field] !== 0).length;
        }
        console.log(`\n   📊 Можно сгенерировать ~${eventCount} событий из данных за сегодня`);
      }
    } catch (error) {
      console.log(`   ❌ Ошибка проверки данных за сегодня: ${error.message}`);
    }

    console.log('\n✅ Проверка завершена');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFlowEvents();

