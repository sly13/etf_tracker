import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:easy_localization/easy_localization.dart';
import 'providers/etf_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/crypto_price_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';
import 'screens/main_navigation_screen.dart';

void main() async {
  // Инициализируем Flutter
  WidgetsFlutterBinding.ensureInitialized();

  // Инициализируем easy_localization
  await EasyLocalization.ensureInitialized();
  print('🔧 EasyLocalization инициализирован');

  // Загружаем переменные окружения
  await dotenv.load(fileName: ".env");

  // Отладочная информация
  print('🔧 Загружены переменные окружения:');
  print('BACKEND_URL: ${dotenv.env['BACKEND_URL']}');
  print('REVENUECAT_IOS_API_KEY: ${dotenv.env['REVENUECAT_IOS_API_KEY']}');

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
      ],
      child: EasyLocalization(
        supportedLocales: const [Locale('en'), Locale('ru')],
        path: 'assets/translations',
        fallbackLocale: const Locale('en'),
        useOnlyLangCode: true,
        child: Consumer<ThemeProvider>(
          builder: (context, themeProvider, child) {
            return MaterialApp(
              title: 'app.name'.tr(),
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
