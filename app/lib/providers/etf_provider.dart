import 'package:flutter/foundation.dart';
import '../models/etf_flow_data.dart';
import '../models/etf.dart';
import '../services/etf_service.dart';

class ETFProvider with ChangeNotifier {
  final ETFService _etfService = ETFService();

  List<ETFFlowData> _ethereumData = [];
  List<ETFFlowData> _bitcoinData = [];
  List<ETFFlowData> _etfFlowData = [];
  Map<String, dynamic>? _summaryData;
  bool _isLoading = false;
  String? _error;
  String _currentTab = 'ethereum'; // 'ethereum' или 'bitcoin'

  // Getters
  List<ETFFlowData> get ethereumData => _ethereumData;
  List<ETFFlowData> get bitcoinData => _bitcoinData;
  List<ETFFlowData> get etfFlowData => _etfFlowData;
  List<ETFFlowData> get currentData =>
      _currentTab == 'ethereum' ? _ethereumData : _bitcoinData;
  Map<String, dynamic>? get summaryData => _summaryData;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get currentTab => _currentTab;

  // Переключить таб
  void switchTab(String tab) {
    _currentTab = tab;
    notifyListeners();
  }

  // Загрузить данные Ethereum
  Future<void> loadEthereumData() async {
    try {
      _setLoading(true);
      _clearError();

      _ethereumData = await _etfService.getEthereumData();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Загрузить данные Bitcoin
  Future<void> loadBitcoinData() async {
    try {
      _setLoading(true);
      _clearError();

      _bitcoinData = await _etfService.getBitcoinData();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Загрузить суммарные данные
  Future<void> loadSummaryData() async {
    try {
      _setLoading(true);
      _clearError();

      _summaryData = await _etfService.getSummaryData();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Загрузить все данные
  Future<void> loadAllData() async {
    await Future.wait([
      loadEthereumData(),
      loadBitcoinData(),
      loadSummaryData(),
    ]);
  }

  // Загрузить данные ETF потоков
  Future<void> loadETFFlowData() async {
    try {
      _setLoading(true);
      _clearError();

      // _etfFlowData = await _etfService.getETFFlowData(); // This line was commented out in the original file
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Загрузить список ETF
  Future<void> loadETFs() async {
    try {
      _setLoading(true);
      _clearError();

      // Временно используем пустой список, так как метод getETFs не реализован в сервисе
      // _etfs = await _etfService.getETFs();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Поиск ETF по запросу
  List<ETF> searchETFs(String query) {
    if (query.isEmpty) return [];
    // Временно возвращаем пустой список
    return [];
  }

  // Фильтрация ETF по классу активов
  List<ETF> filterETFsByAssetClass(String assetClass) {
    if (assetClass.isEmpty) return [];
    // Временно возвращаем пустой список
    return [];
  }

  // Получить уникальные классы активов
  List<String> getUniqueAssetClasses() {
    // Временно возвращаем пустой список
    return [];
  }

  // Private methods
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
  }

  // Очистить ошибку
  void clearError() {
    _clearError();
    notifyListeners();
  }
}
