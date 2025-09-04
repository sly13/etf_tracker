import 'package:flutter/foundation.dart';
import 'package:easy_localization/easy_localization.dart';
import '../services/crypto_price_service.dart';

class CryptoPriceProvider extends ChangeNotifier {
  final CryptoPriceService _cryptoPriceService = CryptoPriceService();

  Map<String, double> _prices = {};
  bool _isLoading = false;
  String? _error;
  DateTime? _lastUpdateTime;

  // Getters
  Map<String, double> get prices => _prices;
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastUpdateTime => _lastUpdateTime;

  double? get ethereumPrice => _prices['ETH'];
  double? get bitcoinPrice => _prices['BTC'];

  // Initialization - load prices when provider is created
  Future<void> initialize() async {
    await loadPrices();
  }

  // Load cryptocurrency prices
  Future<void> loadPrices() async {
    if (_isLoading) return;

    _setLoading(true);
    _clearError();

    try {
      final prices = await _cryptoPriceService.getCryptoPrices();
      _prices = prices;
      _lastUpdateTime = await _cryptoPriceService.getLastPriceUpdateTime();
      notifyListeners();
    } catch (e) {
      _setError('errors.price_load_error'.tr() + ': $e');
    } finally {
      _setLoading(false);
    }
  }

  // Принудительно обновить цены
  Future<void> refreshPrices() async {
    if (_isLoading) return;

    _setLoading(true);
    _clearError();

    try {
      final prices = await _cryptoPriceService.refreshCryptoPrices();
      _prices = prices;
      _lastUpdateTime = DateTime.now();
      notifyListeners();
    } catch (e) {
      _setError('errors.price_refresh_error'.tr() + ': $e');
    } finally {
      _setLoading(false);
    }
  }

  // Проверить, нужно ли обновлять цены
  Future<bool> shouldUpdatePrices() async {
    return await _cryptoPriceService.shouldUpdatePrices();
  }

  // Автоматическое обновление цен (если нужно)
  Future<void> autoUpdatePrices() async {
    final shouldUpdate = await shouldUpdatePrices();
    if (shouldUpdate) {
      await loadPrices();
    }
  }

  // Получить цену Ethereum
  Future<double> getEthereumPrice() async {
    try {
      final price = await _cryptoPriceService.getEthereumPrice();
      _prices['ETH'] = price;
      _lastUpdateTime = await _cryptoPriceService.getLastPriceUpdateTime();
      notifyListeners();
      return price;
    } catch (e) {
      _setError('errors.ethereum_price_error'.tr() + ': $e');
      rethrow;
    }
  }

  // Получить цену Bitcoin
  Future<double> getBitcoinPrice() async {
    try {
      final price = await _cryptoPriceService.getBitcoinPrice();
      _prices['BTC'] = price;
      _lastUpdateTime = await _cryptoPriceService.getLastPriceUpdateTime();
      notifyListeners();
      return price;
    } catch (e) {
      _setError('errors.bitcoin_price_error'.tr() + ': $e');
      rethrow;
    }
  }

  // Очистить ошибку
  void clearError() {
    _clearError();
  }

  // Приватные методы для управления состоянием
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // Форматирование цены для отображения
  String formatPrice(double? price) {
    if (price == null) return 'N/A';

    if (price >= 1000) {
      return '\$${(price / 1000).toStringAsFixed(2)}K';
    } else {
      return '\$${price.toStringAsFixed(2)}';
    }
  }

  // Форматирование времени последнего обновления
  String formatLastUpdateTime() {
    if (_lastUpdateTime == null) return 'Не обновлялось';

    final now = DateTime.now();
    final difference = now.difference(_lastUpdateTime!);

    if (difference.inMinutes < 1) {
      return 'Только что';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} мин. назад';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} ч. назад';
    } else {
      return '${difference.inDays} дн. назад';
    }
  }

  // Проверить, есть ли данные
  bool get hasData => _prices.isNotEmpty;

  // Проверить, есть ли ошибка
  bool get hasError => _error != null;
}
