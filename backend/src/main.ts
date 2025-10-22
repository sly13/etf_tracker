import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UniversalETFFlowService } from './api/etf/universal-etf-flow.service';
import { AdminService } from './admin-panel/admin/admin.service';
import { TelegramBotService } from './api/telegram-bot/telegram-bot.service';
import { DataSyncService } from './api/sync/data-sync.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS - принимаем запросы отовсюду
  app.enableCors({
    origin: true, // Принимаем запросы отовсюду
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
  const dataSyncService = app.get(DataSyncService);

  console.log('🚀 Запуск ETF Flow Tracker сервера...');
  console.log('👤 Инициализация администратора...');

  // Создаем администратора по умолчанию
  try {
    await adminService.createDefaultAdmin();
    console.log('✅ Администратор по умолчанию создан');
  } catch (error) {
    console.log('⚠️ Ошибка создания администратора:', error.message);
  }

  // Запускаем синхронизацию данных при старте
  console.log('📊 Запуск синхронизации данных при старте...');
  try {
    await dataSyncService.onApplicationBootstrap();
    console.log('✅ Синхронизация данных при старте завершена');
  } catch (error) {
    console.log('⚠️ Ошибка синхронизации данных при старте:', error.message);
  }

  console.log('📊 Инициализация данных ETF...');

  // В режиме разработки пропускаем парсинг данных ETF
  if (process.env.NODE_ENV === 'development!') {
    console.log('🔧 Development режим: пропускаем парсинг данных ETF');
  } else {
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
  }

  const port = process.env.PORT ?? 3066;
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);
  console.log(`🌐 Сервер запущен на ${host}:${port}`);
  console.log('🎯 ETF Flow Tracker готов к работе!');

  // Проверяем состояние Telegram бота
  console.log('📱 Состояние Telegram бота:');
  try {
    if (telegramBotService.isBotInitialized()) {
      console.log('   ✅ Telegram бот инициализирован');
    } else {
      console.log('   ❌ Бот не инициализирован');
    }
  } catch (error) {
    console.log(`   ⚠️ Ошибка проверки бота: ${error.message}`);
  }
}

void bootstrap();
