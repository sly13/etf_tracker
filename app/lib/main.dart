import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:app_links/app_links.dart';
import 'providers/etf_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/crypto_price_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';
import 'providers/subscription_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/onboarding_provider.dart';
import 'screens/main_navigation_screen.dart';
import 'screens/onboarding_screen.dart';
import 'widgets/app_initializer.dart';
import 'services/subscription_service.dart';
import 'services/notification_service.dart';
import 'services/user_check_service.dart';
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

  // Инициализируем уведомления ПЕРВЫМИ (регистрируем устройство)
  try {
    await NotificationService.initialize();
    print('✅ NotificationService инициализирован');

    // Проверяем/создаем пользователя после регистрации устройства
    try {
      await UserCheckService.registerDeviceWithFullData();
      print('✅ Пользователь проверен/создан');
    } catch (e) {
      print('⚠️ Ошибка проверки пользователя: $e');
      print('🔧 Продолжаем работу...');
    }
  } catch (e) {
    print('❌ Ошибка инициализации NotificationService: $e');
    print('🔧 Приложение будет работать без пуш-уведомлений');
  }

  // Инициализируем RevenueCat ПОСЛЕ регистрации устройства
  try {
    await SubscriptionService.initialize();
    print('✅ RevenueCat инициализирован');

    // Запускаем диагностику в debug режиме
    await RevenueCatChecker.printDiagnostics();
  } catch (e) {
    print('❌ Ошибка инициализации RevenueCat: $e');
    print('🔧 Приложение будет работать без функций подписки');
  }

  // Инициализируем App Links для обработки deep links
  try {
    await _initializeAppLinks();
    print('✅ App Links инициализирован');
  } catch (e) {
    print('❌ Ошибка инициализации App Links: $e');
  }

  runApp(const MyApp());
}

// Инициализация App Links
Future<void> _initializeAppLinks() async {
  final appLinks = AppLinks();

  // Обработка deep links когда приложение запущено
  appLinks.uriLinkStream.listen((uri) {
    print('🔗 Получен deep link: $uri');
    _handleDeepLink(uri);
  });

  // Обработка deep links когда приложение закрыто
  final initialUri = await appLinks.getInitialLink();
  if (initialUri != null) {
    print('🔗 Получен initial deep link: $initialUri');
    _handleDeepLink(initialUri);
  }
}

// Обработка deep links
void _handleDeepLink(Uri uri) {
  print('🔗 Обрабатываем deep link: ${uri.toString()}');

  if (uri.scheme == 'etfapp') {
    switch (uri.host) {
      case 'open':
        print('🔗 Открываем главный экран приложения');
        // Здесь можно добавить логику навигации к определенному экрану
        break;
      default:
        print('🔗 Неизвестный deep link: ${uri.host}');
    }
  }
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
        ChangeNotifierProvider(
          create: (context) {
            final provider = OnboardingProvider();
            // Инициализируем онбординг при создании провайдера
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
              home: const AppInitializer(),
              debugShowCheckedModeBanner: false,
            );
          },
        ),
      ),
    );
  }
}
