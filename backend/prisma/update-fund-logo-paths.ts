import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Скрипт для обновления путей к логотипам фондов
 * Меняет /images/fund_logos/ на /uploads/fund_logos/
 */
async function updateFundLogoPaths() {
  console.log('🔄 Обновление путей к логотипам фондов...');

  try {
    // Получаем все фонды
    const funds = await prisma.fundDetail.findMany({
      where: {
        logoUrl: {
          not: null,
        },
      },
    });

    console.log(`📊 Найдено ${funds.length} фондов с логотипами`);

    let updatedCount = 0;

    for (const fund of funds) {
      if (fund.logoUrl && fund.logoUrl.includes('/images/fund_logos/')) {
        const newLogoUrl = fund.logoUrl.replace(
          '/images/fund_logos/',
          '/uploads/fund_logos/',
        );

        await prisma.fundDetail.update({
          where: { id: fund.id },
          data: { logoUrl: newLogoUrl },
        });

        console.log(
          `✅ Обновлен фонд ${fund.name}: ${fund.logoUrl} -> ${newLogoUrl}`,
        );
        updatedCount++;
      }
    }

    console.log(`🎉 Обновлено ${updatedCount} фондов!`);
  } catch (error) {
    console.error('❌ Ошибка при обновлении путей:', error);
    throw error;
  }
}

async function main() {
  await updateFundLogoPaths();
}

main()
  .catch((e) => {
    console.error('❌ Скрипт завершился с ошибкой:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

