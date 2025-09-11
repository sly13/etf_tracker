"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const universal_etf_flow_service_1 = require("./api/etf/universal-etf-flow.service");
const admin_service_1 = require("./admin-panel/admin/admin.service");
const telegram_bot_service_1 = require("./api/telegram-bot/telegram-bot.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:3065',
            'http://localhost:3066',
            'http://10.0.2.2:3066',
            'http://127.0.0.1:3066',
            'http://172.20.10.9:3066',
            'https://admin-etf.vadimsemenko.ru',
        ],
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
    app.setGlobalPrefix('api');
    const etfFlowService = app.get(universal_etf_flow_service_1.UniversalETFFlowService);
    const adminService = app.get(admin_service_1.AdminService);
    const telegramBotService = app.get(telegram_bot_service_1.TelegramBotService);
    console.log('🚀 Запуск ETF Flow Tracker сервера...');
    console.log('👤 Инициализация администратора...');
    try {
        await adminService.createDefaultAdmin();
        console.log('✅ Администратор по умолчанию создан');
    }
    catch (error) {
        console.log('⚠️ Ошибка создания администратора:', error.message);
    }
    console.log('📊 Инициализация данных ETF...');
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development режим: пропускаем парсинг данных ETF');
    }
    else {
        try {
            const results = await etfFlowService.parseAllETFFlowData();
            console.log('✅ Результаты парсинга при старте:');
            console.log(`   Ethereum: ${results.ethereum.success ? '✅' : '❌'} ${results.ethereum.count} записей`);
            console.log(`   Bitcoin: ${results.bitcoin.success ? '✅' : '❌'} ${results.bitcoin.count} записей`);
            if (results.ethereum.error) {
                console.log(`   Ошибка Ethereum: ${results.ethereum.error}`);
            }
            if (results.bitcoin.error) {
                console.log(`   Ошибка Bitcoin: ${results.bitcoin.error}`);
            }
        }
        catch (error) {
            console.log('⚠️ Ошибка при инициализации данных ETF:', error.message);
            console.log('📝 Сервер запустится с существующими данными');
        }
    }
    await app.listen(process.env.PORT ?? 3066);
    console.log(`🌐 Сервер запущен на порту ${process.env.PORT ?? 3066}`);
    console.log('🎯 ETF Flow Tracker готов к работе!');
    console.log('📱 Состояние Telegram бота:');
    try {
        if (telegramBotService.isBotInitialized()) {
            console.log('   ✅ Telegram бот инициализирован');
        }
        else {
            console.log('   ❌ Бот не инициализирован');
        }
    }
    catch (error) {
        console.log(`   ⚠️ Ошибка проверки бота: ${error.message}`);
    }
}
void bootstrap();
//# sourceMappingURL=main.js.map