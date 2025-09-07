import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UniversalETFFlowService } from './api/etf/universal-etf-flow.service';
import { AdminService } from './admin-panel/admin/admin.service';
import { TelegramBotService } from './api/telegram/telegram-bot.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS для админской панели
  app.enableCors({
    origin: ['http://localhost:3065', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Устанавливаем глобальный префикс для API
  app.setGlobalPrefix('api');

  // Получаем сервисы
  const etfFlowService = app.get(UniversalETFFlowService);
  const adminService = app.get(AdminService);
  const telegramBotService = app.get(TelegramBotService);

  console.log('🚀 Запуск ETF Flow Tracker сервера...');
  console.log('👤 Инициализация администратора...');

  // Создаем администратора по умолчанию
  try {
    await adminService.createDefaultAdmin();
    console.log('✅ Администратор по умолчанию создан');
  } catch (error) {
    console.log('⚠️ Ошибка создания администратора:', error.message);
  }

  console.log('📊 Инициализация данных ETF...');

  try {
    // Запускаем парсинг данных при старте
    const results = await etfFlowService.parseAllETFFlowData();

    console.log('✅ Результаты парсинга при старте:');
    console.log(
      `   Ethereum: ${results.ethereum.success ? '✅' : '❌'} ${results.ethereum.count} записей`,
    );
    console.log(
      `   Bitcoin: ${results.bitcoin.success ? '✅' : '❌'} ${results.bitcoin.count} записей`,
    );

    if (results.ethereum.error) {
      console.log(`   Ошибка Ethereum: ${results.ethereum.error}`);
    }
    if (results.bitcoin.error) {
      console.log(`   Ошибка Bitcoin: ${results.bitcoin.error}`);
    }
  } catch (error) {
    console.log('⚠️ Ошибка при инициализации данных ETF:', error.message);
    console.log('📝 Сервер запустится с существующими данными');
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🌐 Сервер запущен на порту ${process.env.PORT ?? 3000}`);
  console.log('🎯 ETF Flow Tracker готов к работе!');

  // Проверяем состояние Telegram бота
  console.log('📱 Состояние Telegram бота:');
  try {
    const botInfo = await telegramBotService.getBotInfo();
    if (botInfo) {
      console.log(`   ✅ Бот активен: @${botInfo.username}`);
      console.log(`   📝 Имя: ${botInfo.first_name}`);
      console.log(`   🆔 ID: ${botInfo.id}`);
    } else {
      console.log('   ❌ Бот не инициализирован');
    }
  } catch (error) {
    console.log(`   ⚠️ Ошибка проверки бота: ${error.message}`);
  }
}

void bootstrap();
