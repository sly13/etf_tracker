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
import 'widgets/app_initializer.dart';
import 'services/subscription_service.dart';
import 'services/notification_service.dart';
import 'services/user_check_service.dart';

void main() async {
  // Инициализируем Flutter
  WidgetsFlutterBinding.ensureInitialized();

  // Критичные инициализации (блокирующие запуск приложения)
  await Future.wait([
    // Инициализируем easy_localization
    EasyLocalization.ensureInitialized().then((_) {
      print('🔧 EasyLocalization инициализирован');
    }),
    // Загружаем переменные окружения
    dotenv.load(fileName: ".env").then((_) {
      print('✅ Файл .env загружен успешно');
    }).catchError((e) {
      print('⚠️ Ошибка загрузки .env файла: $e');
      print('🔧 Используем значения по умолчанию');
    }),
  ]);

  // Отладочная информация
  print('🔧 Загружены переменные окружения:');
  print('BACKEND_API_URL : ${dotenv.env['BACKEND_API_URL ']}');
  print('REVENUECAT_IOS_API_KEY: ${dotenv.env['REVENUECAT_IOS_API_KEY']}');

  // Запускаем приложение сразу, не блокируя UI
  runApp(const MyApp());

  // Инициализируем некритичные сервисы в фоне (не блокируют запуск UI)
  _initializeBackgroundServices();
}

// Инициализация сервисов в фоновом режиме
Future<void> _initializeBackgroundServices() async {
  // Параллельная инициализация Firebase сервисов
  try {
    await Future.wait([
      Firebase.initializeApp().then((_) {
        print('✅ Firebase Core инициализирован');
      }).catchError((e) {
        print('❌ Ошибка инициализации Firebase Core: $e');
      }),
      Future.value().then((_) async {
        try {
          await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
          print('✅ Firebase Analytics инициализирован');
        } catch (e) {
          print('❌ Ошибка инициализации Firebase Analytics: $e');
        }
      }),
    ]);
  } catch (e) {
    print('⚠️ Ошибка инициализации Firebase: $e');
  }

  // Инициализируем уведомления в фоне
  Future.microtask(() async {
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
  });

  // Инициализируем RevenueCat в фоне
  Future.microtask(() async {
    try {
      await SubscriptionService.initialize();
      print('✅ RevenueCat инициализирован');
    } catch (e) {
      print('❌ Ошибка инициализации RevenueCat: $e');
      print('🔧 Приложение будет работать без функций подписки');
    }
  });

  // Инициализируем App Links в фоне
  Future.microtask(() async {
    try {
      await _initializeAppLinks();
      print('✅ App Links инициализирован');
    } catch (e) {
      print('❌ Ошибка инициализации App Links: $e');
    }
  });
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
        ChangeNotifierProvider(
          create: (context) {
            final provider = LanguageProvider();
            // Инициализируем язык при создании провайдера
            provider.initialize();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = ETFProvider();
            // Инициализируем данные в фоне, не блокируем запуск
            Future.microtask(() => provider.initializeData());
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
            final provider = NotificationProvider();
            // Инициализируем уведомления при создании провайдера
            provider.initialize();
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = OnboardingProvider();
            // Не инициализируем здесь, инициализация будет в AppInitializer
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = SubscriptionProvider();
            // Не инициализируем здесь, инициализация будет в AppInitializer
            return provider;
          },
        ),
      ],
      child: EasyLocalization(
        supportedLocales: const [
          Locale('en'),
          Locale('ru'),
          Locale('zh'),
          Locale('ja'),
          Locale('pt'),
          Locale('es'),
          Locale('tr'),
          Locale('vi'),
          Locale('ko'),
          Locale('ar'),
        ],
        path: 'assets/translations',
        fallbackLocale: const Locale('en'),
        startLocale:
            null, // Позволяем EasyLocalization автоматически определять язык
        useOnlyLangCode: true,
        child: Consumer2<ThemeProvider, LanguageProvider>(
          builder: (context, themeProvider, languageProvider, child) {
            return MaterialApp(
              title: 'app.title'.tr(),
              theme: themeProvider.currentTheme,
              localizationsDelegates: context.localizationDelegates,
              supportedLocales: context.supportedLocales,
              locale: languageProvider.currentLocale,
              home: const AppInitializer(),
              debugShowCheckedModeBanner: false,
            );
          },
        ),
      ),
    );
  }
}
