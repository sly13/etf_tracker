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
  },
  {
    fundKey: 'twentyOneShares',
    name: '21Shares',
    description:
      '21Shares — европейский лидер в области криптовалютных ETF, предлагающий доступ к цифровым активам через регулируемые инвестиционные продукты.',
    logoUrl: '/uploads/fund_logos/ark.jpg',
    ticker: '21SHARES',
    fundType: 'ETF',
    feePercentage: 0.21,
    launchDate: new Date('2024-01-11'),
    status: 'active',
  },
  {
    fundKey: 'vanEck',
    name: 'VanEck',
    description:
      'VanEck — международная инвестиционная компания, известная своими инновационными ETF продуктами и экспертными знаниями в области товарных рынков.',
    logoUrl: '/uploads/fund_logos/vaneck.jpg',
    ticker: 'VANEK',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
  },
  {
    fundKey: 'invesco',
    name: 'Invesco',
    description:
      'Invesco — глобальная инвестиционная компания с широким спектром ETF продуктов и активным управлением активами.',
    logoUrl: '/uploads/fund_logos/invesco.jpg',
    ticker: 'INVESCO',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
  },
  {
    fundKey: 'franklin',
    name: 'Franklin Templeton',
    description:
      'Franklin Templeton — одна из старейших инвестиционных компаний США с фокусом на долгосрочных инвестиционных стратегиях.',
    logoUrl: '/uploads/fund_logos/franklin.jpg',
    ticker: 'FRANKLIN',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
  },
  {
    fundKey: 'grayscale',
    name: 'Grayscale BTC',
    description:
      'Grayscale Investments — пионер в области криптовалютных инвестиций, предлагающий институциональным инвесторам доступ к цифровым активам.',
    logoUrl: '/uploads/fund_logos/grayscale-gbtc.jpg',
    ticker: 'GBTC',
    fundType: 'Trust',
    feePercentage: 1.5,
    launchDate: new Date('2013-09-25'),
    status: 'active',
  },
  {
    fundKey: 'grayscaleCrypto',
    name: 'Grayscale Crypto',
    description:
      'Grayscale Crypto — специализированное подразделение Grayscale, фокусирующееся на разнообразных криптовалютных инвестициях.',
    logoUrl: '/uploads/fund_logos/grayscale.jpg',
    ticker: 'GCRYPTO',
    fundType: 'Trust',
    feePercentage: 2.5,
    launchDate: new Date('2018-12-18'),
    status: 'active',
  },
  {
    fundKey: 'valkyrie',
    name: 'Valkyrie',
    description:
      'Valkyrie Investments — инновационная инвестиционная компания, специализирующаяся на криптовалютных и альтернативных инвестициях.',
    logoUrl: '/uploads/fund_logos/valkyrie.jpg',
    ticker: 'VALKYRIE',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
  },
  {
    fundKey: 'wisdomTree',
    name: 'WisdomTree',
    description:
      'WisdomTree — компания, известная своими дивидендными ETF и стратегиями, основанными на фундаментальных показателях.',
    logoUrl: '/uploads/fund_logos/wtree.jpg',
    ticker: 'WISDOMTREE',
    fundType: 'ETF',
    feePercentage: 0.25,
    launchDate: new Date('2024-01-11'),
    status: 'active',
  },
];

async function seedFundDetails() {
  console.log('🌱 Seeding fund details...');

  for (const fundData of fundDetailsData) {
    try {
      await prisma.fundDetail.upsert({
        where: { fundKey: fundData.fundKey },
        update: fundData,
        create: fundData,
      });
      console.log(`✅ Seeded fund: ${fundData.name}`);
    } catch (error) {
      console.error(`❌ Error seeding fund ${fundData.name}:`, error);
    }
  }

  console.log('🎉 Fund details seeding completed!');
}

async function main() {
  await seedFundDetails();
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
