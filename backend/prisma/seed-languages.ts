import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Языки из приложения (из language_provider.dart)
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

async function seedLanguages() {
  console.log('🌱 Seeding languages...');

  for (const lang of languages) {
    try {
      // Используем any для обхода проблем TypeScript до перезапуска TS сервера
      await (prisma as any).language.upsert({
        where: { code: lang.code },
        update: {
          name: lang.name,
          nativeName: lang.nativeName,
          isActive: true,
        },
        create: {
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isActive: true,
        },
      });
      console.log(`✅ Seeded language: ${lang.name} (${lang.code})`);
    } catch (error) {
      console.error(`❌ Error seeding language ${lang.code}:`, error);
    }
  }

  // Обновляем существующие переводы, связывая их с языками
  console.log('🔗 Linking existing translations to languages...');
  const allLanguages = await (prisma as any).language.findMany();

  // Используем прямой SQL запрос для обновления, так как Prisma Client может быть не перегенерирован
  for (const lang of allLanguages) {
    try {
      const result = await prisma.$executeRawUnsafe(
        `UPDATE fund_translations 
         SET language_id = $1 
         WHERE language = $2 AND language_id IS NULL`,
        lang.id,
        lang.code,
      );
      if (result && result > 0) {
        console.log(
          `✅ Linked ${result} translation(s) to language ${lang.name} (${lang.code})`,
        );
      }
    } catch (error) {
      console.error(`❌ Error linking translations for ${lang.code}:`, error);
    }
  }

  console.log('🎉 Languages seeding completed!');
}

async function main() {
  await seedLanguages();
}

void main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
