import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CryptoPriceService {
  static const String _baseUrl = 'https://min-api.cryptocompare.com/data/price';
  static const Duration _timeout = Duration(seconds: 10);
  static const int _cacheDuration = 5 * 60 * 1000; // 5 минут кэширования

  // Получить цену Ethereum
  Future<double> getEthereumPrice() async {
    try {
      // Проверяем кэш
      final cachedPrice = await _getCachedPrice('ETH');
      if (cachedPrice != null) {
        return cachedPrice;
      }

      final url = '$_baseUrl?fsym=ETH&tsyms=USD';

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException(
                'Превышено время ожидания ответа от сервера',
              );
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final price = data['USD'] as double;

        // Сохраняем в кэш
        await _cachePrice('ETH', price);

        return price;
      } else {
        throw Exception(
          'Ошибка загрузки цены Ethereum: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception(
          'Сервер не отвечает. Проверьте подключение к интернету.',
        );
      }
      throw Exception('Ошибка получения цены Ethereum: $e');
    }
  }

  // Получить цену Bitcoin
  Future<double> getBitcoinPrice() async {
    try {
      // Проверяем кэш
      final cachedPrice = await _getCachedPrice('BTC');
      if (cachedPrice != null) {
        return cachedPrice;
      }

      final url = '$_baseUrl?fsym=BTC&tsyms=USD';

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException(
                'Превышено время ожидания ответа от сервера',
              );
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final price = data['USD'] as double;

        // Сохраняем в кэш
        await _cachePrice('BTC', price);

        return price;
      } else {
        throw Exception('Ошибка загрузки цены Bitcoin: ${response.statusCode}');
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception(
          'Сервер не отвечает. Проверьте подключение к интернету.',
        );
      }
      throw Exception('Ошибка получения цены Bitcoin: $e');
    }
  }

  // Получить цены обеих криптовалют одновременно
  Future<Map<String, double>> getCryptoPrices() async {
    try {
      final ethPrice = await getEthereumPrice();
      final btcPrice = await getBitcoinPrice();

      return {'ETH': ethPrice, 'BTC': btcPrice};
    } catch (e) {
      throw Exception('Ошибка получения цен криптовалют: $e');
    }
  }

  // Принудительно обновить цены (игнорируя кэш)
  Future<Map<String, double>> refreshCryptoPrices() async {
    try {
      // Очищаем кэш
      await _clearPriceCache();

      // Получаем свежие цены
      return await getCryptoPrices();
    } catch (e) {
      throw Exception('Ошибка обновления цен криптовалют: $e');
    }
  }

  // Получить кэшированную цену
  Future<double?> _getCachedPrice(String symbol) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = 'crypto_price_$symbol';
      final timestampKey = 'crypto_price_${symbol}_timestamp';

      final cachedPrice = prefs.getDouble(cacheKey);
      final timestamp = prefs.getInt(timestampKey);

      if (cachedPrice != null && timestamp != null) {
        final now = DateTime.now().millisecondsSinceEpoch;
        final timeDiff = now - timestamp;

        // Если кэш еще актуален
        if (timeDiff < _cacheDuration) {
          return cachedPrice;
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  // Сохранить цену в кэш
  Future<void> _cachePrice(String symbol, double price) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = 'crypto_price_$symbol';
      final timestampKey = 'crypto_price_${symbol}_timestamp';

      await prefs.setDouble(cacheKey, price);
      await prefs.setInt(timestampKey, DateTime.now().millisecondsSinceEpoch);
    } catch (e) {
      // Игнорируем ошибки кэширования
    }
  }

  // Очистить кэш цен
  Future<void> _clearPriceCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('crypto_price_ETH');
      await prefs.remove('crypto_price_ETH_timestamp');
      await prefs.remove('crypto_price_BTC');
      await prefs.remove('crypto_price_BTC_timestamp');
    } catch (e) {
      // Игнорируем ошибки очистки кэша
    }
  }

  // Получить время последнего обновления цен
  Future<DateTime?> getLastPriceUpdateTime() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ethTimestamp = prefs.getInt('crypto_price_ETH_timestamp');
      final btcTimestamp = prefs.getInt('crypto_price_BTC_timestamp');

      if (ethTimestamp != null && btcTimestamp != null) {
        final latestTimestamp = ethTimestamp > btcTimestamp
            ? ethTimestamp
            : btcTimestamp;
        return DateTime.fromMillisecondsSinceEpoch(latestTimestamp);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  // Проверить, нужно ли обновлять цены
  Future<bool> shouldUpdatePrices() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ethTimestamp = prefs.getInt('crypto_price_ETH_timestamp');
      final btcTimestamp = prefs.getInt('crypto_price_BTC_timestamp');

      if (ethTimestamp == null || btcTimestamp == null) {
        return true; // Нет кэшированных данных
      }

      final now = DateTime.now().millisecondsSinceEpoch;
      final ethTimeDiff = now - ethTimestamp;
      final btcTimeDiff = now - btcTimestamp;

      return ethTimeDiff > _cacheDuration || btcTimeDiff > _cacheDuration;
    } catch (e) {
      return true;
    }
  }
}
