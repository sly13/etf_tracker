import '../providers/etf_provider.dart';
import '../utils/haptic_feedback.dart';

class RefreshTest {
  // Тест функциональности pull-to-refresh
  static Future<void> testPullToRefresh(ETFProvider provider) async {
    try {
      print('🧪 Тестируем функциональность pull-to-refresh...');

      // Проверяем начальное состояние
      print('📊 Начальное состояние:');
      print('  - isLoading: ${provider.isLoading}');
      print('  - isDataReady: ${provider.isDataReady}');
      print('  - ethereumData.length: ${provider.ethereumData.length}');
      print('  - bitcoinData.length: ${provider.bitcoinData.length}');

      // Симулируем тактильную обратную связь
      print('📱 Тестируем тактильную обратную связь...');
      HapticUtils.lightImpact();
      await Future.delayed(Duration(milliseconds: 100));
      HapticUtils.notificationSuccess();

      // Выполняем обновление данных
      print('🔄 Выполняем обновление данных...');
      await provider.forceRefreshAllData();

      // Проверяем состояние после обновления
      print('📊 Состояние после обновления:');
      print('  - isLoading: ${provider.isLoading}');
      print('  - isDataReady: ${provider.isDataReady}');
      print('  - ethereumData.length: ${provider.ethereumData.length}');
      print('  - bitcoinData.length: ${provider.bitcoinData.length}');
      print('  - error: ${provider.error}');

      if (provider.error == null) {
        print('✅ Обновление данных прошло успешно');
      } else {
        print('❌ Ошибка при обновлении: ${provider.error}');
      }
    } catch (e) {
      print('❌ Ошибка тестирования pull-to-refresh: $e');
    }
  }

  // Тест состояния загрузки
  static void testLoadingStates(ETFProvider provider) {
    print('🧪 Тестируем состояния загрузки...');

    print('📊 Текущие состояния:');
    print('  - isLoading: ${provider.isLoading}');
    print('  - isInitializing: ${provider.isInitializing}');
    print('  - isEthereumLoaded: ${provider.isEthereumLoaded}');
    print('  - isBitcoinLoaded: ${provider.isBitcoinLoaded}');
    print('  - isDataReady: ${provider.isDataReady}');
    print('  - lastDataUpdate: ${provider.lastDataUpdate}');

    // Проверяем логику отображения кнопки обновления
    final shouldShowRefresh =
        provider.lastDataUpdate != null &&
        DateTime.now().difference(provider.lastDataUpdate!).inHours >= 1;
    print('  - shouldShowRefreshButton: $shouldShowRefresh');

    print('✅ Тест состояний загрузки завершен');
  }

  // Тест тактильной обратной связи
  static void testHapticFeedback() {
    print('🧪 Тестируем тактильную обратную связь...');

    print('📱 Легкая вибрация...');
    HapticUtils.lightImpact();

    Future.delayed(Duration(milliseconds: 500), () {
      print('📱 Средняя вибрация...');
      HapticUtils.mediumImpact();

      Future.delayed(Duration(milliseconds: 500), () {
        print('📱 Тяжелая вибрация...');
        HapticUtils.heavyImpact();

        Future.delayed(Duration(milliseconds: 500), () {
          print('📱 Вибрация успеха...');
          HapticUtils.notificationSuccess();

          Future.delayed(Duration(milliseconds: 500), () {
            print('📱 Вибрация ошибки...');
            HapticUtils.notificationError();
            print('✅ Тест тактильной обратной связи завершен');
          });
        });
      });
    });
  }

  // Тест обновления Bitcoin данных
  static Future<void> testBitcoinRefresh(ETFProvider provider) async {
    try {
      print('🧪 Тестируем обновление Bitcoin данных...');

      print('📊 Начальное состояние Bitcoin:');
      print('  - bitcoinData.length: ${provider.bitcoinData.length}');
      print('  - isBitcoinLoaded: ${provider.isBitcoinLoaded}');

      // Выполняем обновление Bitcoin данных
      print('🔄 Выполняем обновление Bitcoin данных...');
      await provider.loadBitcoinData();

      // Проверяем состояние после обновления
      print('📊 Состояние Bitcoin после обновления:');
      print('  - bitcoinData.length: ${provider.bitcoinData.length}');
      print('  - isBitcoinLoaded: ${provider.isBitcoinLoaded}');
      print('  - error: ${provider.error}');

      if (provider.error == null) {
        print('✅ Обновление Bitcoin данных прошло успешно');
      } else {
        print('❌ Ошибка при обновлении Bitcoin: ${provider.error}');
      }
    } catch (e) {
      print('❌ Ошибка тестирования Bitcoin refresh: $e');
    }
  }

  // Тест обновления Ethereum данных
  static Future<void> testEthereumRefresh(ETFProvider provider) async {
    try {
      print('🧪 Тестируем обновление Ethereum данных...');

      print('📊 Начальное состояние Ethereum:');
      print('  - ethereumData.length: ${provider.ethereumData.length}');
      print('  - isEthereumLoaded: ${provider.isEthereumLoaded}');

      // Выполняем обновление Ethereum данных
      print('🔄 Выполняем обновление Ethereum данных...');
      await provider.loadEthereumData();

      // Проверяем состояние после обновления
      print('📊 Состояние Ethereum после обновления:');
      print('  - ethereumData.length: ${provider.ethereumData.length}');
      print('  - isEthereumLoaded: ${provider.isEthereumLoaded}');
      print('  - error: ${provider.error}');

      if (provider.error == null) {
        print('✅ Обновление Ethereum данных прошло успешно');
      } else {
        print('❌ Ошибка при обновлении Ethereum: ${provider.error}');
      }
    } catch (e) {
      print('❌ Ошибка тестирования Ethereum refresh: $e');
    }
  }

  // Полный тест функциональности обновления
  static Future<void> runAllTests(ETFProvider provider) async {
    print('🚀 Запускаем полный тест функциональности обновления...');

    testHapticFeedback();
    await Future.delayed(Duration(seconds: 3));

    testLoadingStates(provider);
    await Future.delayed(Duration(seconds: 1));

    await testPullToRefresh(provider);
    await Future.delayed(Duration(seconds: 2));

    await testBitcoinRefresh(provider);
    await Future.delayed(Duration(seconds: 2));

    await testEthereumRefresh(provider);

    print('✅ Все тесты функциональности обновления завершены!');
  }
}
