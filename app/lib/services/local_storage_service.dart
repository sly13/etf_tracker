import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/etf_flow_data.dart';

class LocalStorageService {
  static const String _ethereumDataKey = 'ethereum_data';
  static const String _bitcoinDataKey = 'bitcoin_data';
  static const String _summaryDataKey = 'summary_data';
  static const String _fundHoldingsKey = 'fund_holdings';
  static const String _lastUpdateKey = 'last_update';
  static const String _etfFlowDataKey = 'etf_flow_data';

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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_summaryDataKey, jsonEncode(data));
    await _updateLastUpdateTime();
  }

  // Получить сводные данные
  Future<Map<String, dynamic>?> getSummaryData() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_summaryDataKey);

    if (jsonString == null) return null;

    return jsonDecode(jsonString) as Map<String, dynamic>;
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
    await prefs.remove(_summaryDataKey);
    await prefs.remove(_fundHoldingsKey);
    await prefs.remove(_etfFlowDataKey);
    await prefs.remove(_lastUpdateKey);
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
}
