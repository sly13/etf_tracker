import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/etf_flow_data.dart';
import '../models/cefi_index.dart';

class LocalStorageService {
  static const String _ethereumDataKey = 'ethereum_data';
  static const String _bitcoinDataKey = 'bitcoin_data';
  static const String _solanaDataKey = 'solana_data';
  static const String _summaryDataKey = 'summary_data';
  static const String _fundHoldingsKey = 'fund_holdings';
  static const String _lastUpdateKey = 'last_update';
  static const String _etfFlowDataKey = 'etf_flow_data';
  static const String _todayEventsKey = 'today_events';
  static const String _cryptoETFTabIndexKey = 'crypto_etf_tab_index';
  static const String _navigationTabIndexKey = 'navigation_tab_index';
  static const String _cefiIndicesKey = 'cefi_indices';

  // Время кэширования в миллисекундах (30 минут)
  static const int _cacheDuration = 30 * 60 * 1000;

  // Проверить, нужно ли обновлять данные
  Future<bool> shouldUpdateData() async {
    final prefs = await SharedPreferences.getInstance();
    final lastUpdate = prefs.getInt(_lastUpdateKey);

    if (lastUpdate == null) {
      return true; // Данных нет, нужно загрузить
    }

    final now = DateTime.now().millisecondsSinceEpoch;
    final timeDiff = now - lastUpdate;

    return timeDiff > _cacheDuration;
  }

  // Сохранить данные Ethereum
  Future<void> saveEthereumData(List<ETFFlowData> data) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonData = data.map((item) => item.toJson()).toList();
    await prefs.setString(_ethereumDataKey, jsonEncode(jsonData));
    await _updateLastUpdateTime();
  }

  // Получить данные Ethereum
  Future<List<ETFFlowData>> getEthereumData() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_ethereumDataKey);

    if (jsonString == null) return [];

    final jsonList = jsonDecode(jsonString) as List;
    return jsonList.map((json) => ETFFlowData.fromJson(json)).toList();
  }

  // Сохранить данные Bitcoin
  Future<void> saveBitcoinData(List<BTCFlowData> data) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonData = data.map((item) => item.toJson()).toList();
    await prefs.setString(_bitcoinDataKey, jsonEncode(jsonData));
    await _updateLastUpdateTime();
  }

  // Получить данные Bitcoin
  Future<List<BTCFlowData>> getBitcoinData() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_bitcoinDataKey);

    if (jsonString == null) return [];

    final jsonList = jsonDecode(jsonString) as List;
    return jsonList.map((json) => BTCFlowData.fromJson(json)).toList();
  }

  // Сохранить сводные данные
  Future<void> saveSummaryData(Map<String, dynamic> data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode(data);
      final saved = await prefs.setString(_summaryDataKey, jsonString);
      debugPrint('LocalStorageService: [SAVE] Summary данные сохранены: $saved, длина: ${jsonString.length}');
      if (data.containsKey('bitcoin')) {
        debugPrint('LocalStorageService: [SAVE] Summary bitcoin totalAssets: ${data['bitcoin']?['totalAssets']}');
      }
      if (data.containsKey('ethereum')) {
        debugPrint('LocalStorageService: [SAVE] Summary ethereum totalAssets: ${data['ethereum']?['totalAssets']}');
      }
      await _updateLastUpdateTime();
    } catch (e) {
      debugPrint('LocalStorageService: [SAVE] Ошибка сохранения Summary данных: $e');
      rethrow;
    }
  }

  // Получить сводные данные
  Future<Map<String, dynamic>?> getSummaryData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_summaryDataKey);

      if (jsonString == null) {
        debugPrint('LocalStorageService: [GET] Summary данные не найдены в кэше');
        return null;
      }

      debugPrint('LocalStorageService: [GET] Summary данные найдены в кэше, длина: ${jsonString.length}');
      final data = jsonDecode(jsonString) as Map<String, dynamic>;
      if (data.containsKey('bitcoin')) {
        debugPrint('LocalStorageService: [GET] Summary bitcoin totalAssets: ${data['bitcoin']?['totalAssets']}');
      }
      if (data.containsKey('ethereum')) {
        debugPrint('LocalStorageService: [GET] Summary ethereum totalAssets: ${data['ethereum']?['totalAssets']}');
      }
      return data;
    } catch (e) {
      debugPrint('LocalStorageService: [GET] Ошибка загрузки Summary данных: $e');
      return null;
    }
  }

  // Сохранить данные фондов
  Future<void> saveFundHoldings(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_fundHoldingsKey, jsonEncode(data));
    await _updateLastUpdateTime();
  }

  // Получить данные фондов
  Future<Map<String, dynamic>?> getFundHoldings() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_fundHoldingsKey);

    if (jsonString == null) return null;

    return jsonDecode(jsonString) as Map<String, dynamic>;
  }

  // Сохранить данные Solana
  Future<void> saveSolanaData(List<ETFFlowData> data) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonData = data.map((item) => item.toJson()).toList();
    await prefs.setString(_solanaDataKey, jsonEncode(jsonData));
    await _updateLastUpdateTime();
  }

  // Получить данные Solana
  Future<List<ETFFlowData>> getSolanaData() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_solanaDataKey);

    if (jsonString == null) return [];

    final jsonList = jsonDecode(jsonString) as List;
    return jsonList.map((json) => ETFFlowData.fromJson(json)).toList();
  }

  // Сохранить данные ETF потоков
  Future<void> saveETFFlowData(List<ETFFlowData> data) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonData = data.map((item) => item.toJson()).toList();
    await prefs.setString(_etfFlowDataKey, jsonEncode(jsonData));
    await _updateLastUpdateTime();
  }

  // Получить данные ETF потоков
  Future<List<ETFFlowData>> getETFFlowData() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_etfFlowDataKey);

    if (jsonString == null) return [];

    final jsonList = jsonDecode(jsonString) as List;
    return jsonList.map((json) => ETFFlowData.fromJson(json)).toList();
  }

  // Сохранить события за сегодня
  Future<void> saveTodayEvents(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_todayEventsKey, jsonEncode(data));
  }

  // Получить события за сегодня
  Future<Map<String, dynamic>?> getTodayEvents() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_todayEventsKey);

    if (jsonString == null) return null;

    return jsonDecode(jsonString) as Map<String, dynamic>;
  }

  // Обновить время последнего обновления
  Future<void> _updateLastUpdateTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_lastUpdateKey, DateTime.now().millisecondsSinceEpoch);
  }

  // Очистить все кэшированные данные
  Future<void> clearAllData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_ethereumDataKey);
    await prefs.remove(_bitcoinDataKey);
    await prefs.remove(_solanaDataKey);
    await prefs.remove(_summaryDataKey);
    await prefs.remove(_fundHoldingsKey);
    await prefs.remove(_etfFlowDataKey);
    await prefs.remove(_todayEventsKey);
    await prefs.remove(_cefiIndicesKey);
    await prefs.remove(_lastUpdateKey);
    // Не очищаем индексы табов при очистке кэша данных
  }

  // Получить время последнего обновления
  Future<DateTime?> getLastUpdateTime() async {
    final prefs = await SharedPreferences.getInstance();
    final timestamp = prefs.getInt(_lastUpdateKey);

    if (timestamp == null) return null;

    return DateTime.fromMillisecondsSinceEpoch(timestamp);
  }

  // Проверить, есть ли данные в кэше
  Future<bool> hasCachedData() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_ethereumDataKey) != null &&
        prefs.getString(_bitcoinDataKey) != null;
  }

  // Сохранить индекс таба Crypto ETF
  Future<void> saveCryptoETFTabIndex(int index) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_cryptoETFTabIndexKey, index);
  }

  // Получить индекс таба Crypto ETF
  Future<int> getCryptoETFTabIndex() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_cryptoETFTabIndexKey) ?? 0; // По умолчанию BTC (0)
  }

  // Сохранить индекс навигационного таба
  Future<void> saveNavigationTabIndex(int index) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_navigationTabIndexKey, index);
  }

  // Получить индекс навигационного таба
  Future<int> getNavigationTabIndex() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_navigationTabIndexKey) ?? 0; // По умолчанию первый таб (ETF Summary)
  }

  // Сохранить данные CEFI индексов
  Future<void> saveCEFIIndices(AllCEFIIndices data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode({
        'btc': data.btc.toJson(),
        'eth': data.eth.toJson(),
        'sol': data.sol.toJson(),
        'composite': data.composite.toJson(),
        'bpf': {
          'bitcoin': data.bpf['bitcoin']?.map((item) => item.toJson()).toList() ?? [],
          'ethereum': data.bpf['ethereum']?.map((item) => item.toJson()).toList() ?? [],
        },
      });
      await prefs.setString(_cefiIndicesKey, jsonString);
      await _updateLastUpdateTime();
      debugPrint('LocalStorageService: [SAVE] CEFI индексы сохранены');
    } catch (e) {
      debugPrint('LocalStorageService: [SAVE] Ошибка сохранения CEFI индексов: $e');
      rethrow;
    }
  }

  // Получить данные CEFI индексов
  Future<AllCEFIIndices?> getCEFIIndices() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_cefiIndicesKey);

      if (jsonString == null) {
        debugPrint('LocalStorageService: [GET] CEFI индексы не найдены в кэше');
        return null;
      }

      debugPrint('LocalStorageService: [GET] CEFI индексы найдены в кэше');
      final data = jsonDecode(jsonString) as Map<String, dynamic>;
      return AllCEFIIndices.fromJson(data);
    } catch (e) {
      debugPrint('LocalStorageService: [GET] Ошибка загрузки CEFI индексов: $e');
      return null;
    }
  }
}
