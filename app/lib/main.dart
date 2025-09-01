import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/etf_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/crypto_price_provider.dart';
import 'screens/main_navigation_screen.dart';

void main() {
  runApp(const MyApp());
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
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'ETF Tracker',
            theme: themeProvider.currentTheme,
            home: const MainNavigationScreen(),
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}
