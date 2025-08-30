import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UniversalETFFlowService } from './etf/universal-etf-flow.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Получаем сервис для парсинга данных
  const etfFlowService = app.get(UniversalETFFlowService);

  console.log('🚀 Запуск ETF Flow Tracker сервера...');
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
}
bootstrap();
