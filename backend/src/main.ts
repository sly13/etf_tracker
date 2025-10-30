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

  const port = process.env.PORT ?? 3066;
  const host = process.env.HOST ?? '0.0.0.0';

  // Запускаем сервер сразу, не дожидаясь синхронизации данных
  await app.listen(port, host);
  console.log(`🌐 Сервер запущен на ${host}:${port}`);
  console.log('🎯 ETF Flow Tracker готов к работе!');

  // Запускаем синхронизацию данных в фоновом режиме (не блокируем запуск)
  console.log('📊 Запуск синхронизации данных в фоновом режиме...');
  dataSyncService.onApplicationBootstrap().catch((error) => {
    console.log('⚠️ Ошибка синхронизации данных в фоне:', error.message);
  });

  // Запускаем парсинг данных ETF в фоновом режиме (не блокируем запуск)
  if (process.env.NODE_ENV !== 'development!') {
    console.log('📊 Запуск парсинга данных ETF в фоновом режиме...');
    etfFlowService.parseAllETFFlowData()
      .then((results) => {
        console.log('✅ Результаты парсинга в фоне:');
        console.log(
          `   Ethereum: ${results.ethereum.success ? '✅' : '❌'} ${results.ethereum.count} записей`,
        );
        console.log(
          `   Bitcoin: ${results.bitcoin.success ? '✅' : '❌'} ${results.bitcoin.count} записей`,
        );
        if (results.solana) {
          console.log(
            `   Solana: ${results.solana.success ? '✅' : '❌'} ${results.solana.count} записей`,
          );
        }
        if (results.ethereum.error) {
          console.log(`   Ошибка Ethereum: ${results.ethereum.error}`);
        }
        if (results.bitcoin.error) {
          console.log(`   Ошибка Bitcoin: ${results.bitcoin.error}`);
        }
      })
      .catch((error) => {
        console.log('⚠️ Ошибка при парсинге данных ETF в фоне:', error.message);
      });
  } else {
    console.log('🔧 Development режим: пропускаем парсинг данных ETF');
  }

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
