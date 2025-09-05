import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'providers/etf_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/crypto_price_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';
import 'providers/subscription_provider.dart';
import 'providers/notification_provider.dart';
import 'screens/main_navigation_screen.dart';
import 'services/subscription_service.dart';
import 'services/notification_service.dart';
import 'utils/revenuecat_checker.dart';

void main() async {
  // Инициализируем Flutter
  WidgetsFlutterBinding.ensureInitialized();

  // Инициализируем easy_localization
  await EasyLocalization.ensureInitialized();
  print('🔧 EasyLocalization инициализирован');

  // Загружаем переменные окружения
  try {
    await dotenv.load(fileName: ".env");
    print('✅ Файл .env загружен успешно');
  } catch (e) {
    print('⚠️ Ошибка загрузки .env файла: $e');
    print('🔧 Используем значения по умолчанию');
  }

  // Отладочная информация
  print('🔧 Загружены переменные окружения:');
  print('BACKEND_URL: ${dotenv.env['BACKEND_URL']}');
  print('REVENUECAT_IOS_API_KEY: ${dotenv.env['REVENUECAT_IOS_API_KEY']}');

  // Инициализируем RevenueCat
  try {
    await SubscriptionService.initialize();
    print('✅ RevenueCat инициализирован');

    // Запускаем диагностику в debug режиме
    await RevenueCatChecker.printDiagnostics();
  } catch (e) {
    print('❌ Ошибка инициализации RevenueCat: $e');
    print('🔧 Приложение будет работать без функций подписки');
  }

  // Инициализируем Firebase
  try {
    await Firebase.initializeApp();
    print('✅ Firebase Core инициализирован');
  } catch (e) {
    print('❌ Ошибка инициализации Firebase Core: $e');
  }

  // Инициализируем Firebase Analytics
  try {
    await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
    print('✅ Firebase Analytics инициализирован');
  } catch (e) {
    print('❌ Ошибка инициализации Firebase Analytics: $e');
  }

  // Инициализируем уведомления
  try {
    await NotificationService.initialize();
    print('✅ NotificationService инициализирован');
  } catch (e) {
    print('❌ Ошибка инициализации NotificationService: $e');
    print('🔧 Приложение будет работать без пуш-уведомлений');
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => ThemeProvider()),
        ChangeNotifierProvider(create: (context) => LanguageProvider()),
        ChangeNotifierProvider(
          create: (context) {
            final provider = ETFProvider();
            // Инициализируем данные сразу при создании провайдера
            provider.initializeData();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = CryptoPriceProvider();
            // Инициализируем цены криптовалют при создании провайдера
            provider.initialize();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = AuthProvider();
            // Инициализируем аутентификацию при создании провайдера
            provider.initialize();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = SubscriptionProvider();
            // Инициализируем подписку при создании провайдера
            provider.initialize();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = NotificationProvider();
            // Инициализируем уведомления при создании провайдера
            provider.initialize();
            return provider;
          },
        ),
      ],
      child: EasyLocalization(
        supportedLocales: const [Locale('en'), Locale('ru')],
        path: 'assets/translations',
        fallbackLocale: const Locale('en'),
        startLocale: const Locale('ru'),
        useOnlyLangCode: true,
        child: Consumer<ThemeProvider>(
          builder: (context, themeProvider, child) {
            return MaterialApp(
              title: 'app.title'.tr(),
              theme: themeProvider.currentTheme,
              localizationsDelegates: context.localizationDelegates,
              supportedLocales: context.supportedLocales,
              locale: context.locale,
              home: const MainNavigationScreen(),
              debugShowCheckedModeBanner: false,
            );
          },
        ),
      ),
    );
  }
}
