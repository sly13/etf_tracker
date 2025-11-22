import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fundDetailsData = [
  {
    fundKey: 'blackrock',
    name: 'BlackRock',
    description:
      'BlackRock — крупнейший в мире управляющий активами с более чем $10 трлн под управлением. Компания предлагает широкий спектр инвестиционных продуктов, включая ETF фонды.',
    logoUrl: '/uploads/fund_logos/blackrock.jpg',
    ticker: 'BLACKROCK',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
    translations: [
      {
        language: 'en',
        name: 'BlackRock',
        description:
          "BlackRock is the world's largest asset manager with over $10 trillion in assets under management. The company offers a wide range of investment products, including ETF funds.",
      },
      {
        language: 'es',
        name: 'BlackRock',
        description:
          'BlackRock es el gestor de activos más grande del mundo con más de $10 billones en activos bajo gestión. La empresa ofrece una amplia gama de productos de inversión, incluidos fondos ETF.',
      },
    ],
  },
  {
    fundKey: 'fidelity',
    name: 'Fidelity',
    description:
      'Fidelity Investments — одна из крупнейших инвестиционных компаний США с богатой историей управления активами и предоставления финансовых услуг.',
    logoUrl: '/uploads/fund_logos/fidelity.jpg',
    ticker: 'FIDELITY',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
    translations: [
      {
        language: 'en',
        name: 'Fidelity',
        description:
          'Fidelity Investments is one of the largest investment companies in the United States with a rich history of asset management and financial services.',
      },
      {
        language: 'es',
        name: 'Fidelity',
        description:
          'Fidelity Investments es una de las mayores empresas de inversión de Estados Unidos con una rica historia en gestión de activos y servicios financieros.',
      },
    ],
  },
  {
    fundKey: 'bitwise',
    name: 'Bitwise',
    description:
      'Bitwise Asset Management — специализируется на криптовалютных инвестициях и управлении цифровыми активами для институциональных инвесторов.',
    logoUrl: '/uploads/fund_logos/bitwise.jpg',
    ticker: 'BITWISE',
    fundType: 'ETF',
    feePercentage: 0.2,
    launchDate: new Date('2024-01-11'),
    status: 'active',
    translations: [
      {
        language: 'en',
        name: 'Bitwise',
        description:
          'Bitwise Asset Management specializes in cryptocurrency investments and digital asset management for institutional investors.',
      },
      {
        language: 'es',
        name: 'Bitwise',
        description:
          'Bitwise Asset Management se especializa en inversiones en criptomonedas y gestión de activos digitales para inversores institucionales.',
      },
    ],
  },
];

async function seedFundDetailsWithTranslations() {
  console.log('🌱 Seeding fund details with translations...');

  for (const fundData of fundDetailsData) {
    try {
      const { translations, ...fundDataWithoutTranslations } = fundData;

      const fund = await prisma.fundDetail.upsert({
        where: { fundKey: fundData.fundKey },
        update: fundDataWithoutTranslations,
        create: fundDataWithoutTranslations,
      });

      // Добавляем переводы
      for (const translation of translations) {
        await prisma.fundTranslation.upsert({
          where: {
            fundId_language: {
              fundId: fund.id,
              language: translation.language,
            },
          },
          update: {
            name: translation.name,
            description: translation.description,
          },
          create: {
            fundId: fund.id,
            language: translation.language,
            name: translation.name,
            description: translation.description,
          },
        });
      }

      console.log(`✅ Seeded fund with translations: ${fundData.name}`);
    } catch (error) {
      console.error(`❌ Error seeding fund ${fundData.name}:`, error);
    }
  }

  console.log('🎉 Fund details with translations seeding completed!');
}

async function main() {
  await seedFundDetailsWithTranslations();
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
