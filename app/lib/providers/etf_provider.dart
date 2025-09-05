import 'package:flutter/foundation.dart';
import '../models/etf_flow_data.dart';
import '../services/etf_service.dart';
import '../services/local_storage_service.dart';
import '../services/analytics_service.dart';

class ETFProvider with ChangeNotifier {
  final ETFService _etfService = ETFService();
  final LocalStorageService _storageService = LocalStorageService();

  List<ETFFlowData> _ethereumData = [];
  List<BTCFlowData> _bitcoinData = [];
  List<ETFFlowData> _etfFlowData = [];
  Map<String, dynamic>? _fundHoldings;
  Map<String, dynamic>? _summaryData;
  bool _isLoading = false;
  bool _isInitializing = false;
  bool _isEthereumLoaded = false;
  bool _isBitcoinLoaded = false;
  bool _isSummaryLoaded = false;
  bool _isFundHoldingsLoaded = false;
  String? _error;
  String _currentTab = 'ethereum'; // 'ethereum' или 'bitcoin'
  int _navigationTabIndex = 0; // Индекс текущего таба в навигации
  DateTime? _lastDataUpdate; // Время последнего обновления данных

  // Getters
  List<ETFFlowData> get ethereumData => _ethereumData;
  List<BTCFlowData> get bitcoinData => _bitcoinData;
  List<ETFFlowData> get etfFlowData => _etfFlowData;
  Map<String, dynamic>? get fundHoldings => _fundHoldings;
  List<BaseETFFlowData> get currentData =>
      _currentTab == 'ethereum' ? _ethereumData : _bitcoinData;
  Map<String, dynamic>? get summaryData => _summaryData;
  bool get isLoading => _isLoading;
  bool get isInitializing => _isInitializing;
  bool get isEthereumLoaded => _isEthereumLoaded;
  bool get isBitcoinLoaded => _isBitcoinLoaded;
  bool get isSummaryLoaded => _isSummaryLoaded;
  bool get isFundHoldingsLoaded => _isFundHoldingsLoaded;
  String? get error => _error;
  String get currentTab => _currentTab;
  int get navigationTabIndex => _navigationTabIndex;
  DateTime? get lastDataUpdate => _lastDataUpdate;

  // Проверка готовности основных данных
  bool get isDataReady => _isEthereumLoaded && _isBitcoinLoaded;

  // Переключить таб
  void switchTab(String tab) {
    _currentTab = tab;
    notifyListeners();
  }

  // Переключить навигационный таб
  void switchNavigationTab(int tabIndex) {
    _navigationTabIndex = tabIndex;
    notifyListeners();
  }

  // Загрузить данные из кэша
  Future<void> loadFromCache() async {
    try {
      _setLoading(true);
      _clearError();

      // Загружаем все данные из кэша параллельно
      final results = await Future.wait([
        _storageService.getEthereumData(),
        _storageService.getBitcoinData(),
        _storageService.getSummaryData(),
        _storageService.getFundHoldings(),
        _storageService.getETFFlowData(),
      ]);

      _ethereumData = results[0] as List<ETFFlowData>;
      _bitcoinData = results[1] as List<BTCFlowData>;
      _summaryData = results[2] as Map<String, dynamic>?;
      _fundHoldings = results[3] as Map<String, dynamic>?;
      _etfFlowData = results[4] as List<ETFFlowData>;

      // Устанавливаем флаги загрузки
      _isEthereumLoaded = _ethereumData.isNotEmpty;
      _isBitcoinLoaded = _bitcoinData.isNotEmpty;
      _isSummaryLoaded = _summaryData != null;
      _isFundHoldingsLoaded = _fundHoldings != null;

      notifyListeners();
    } catch (e) {
      _setError('Ошибка загрузки кэшированных данных: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Загрузить данные Ethereum
  Future<void> loadEthereumData() async {
    try {
      _setLoading(true);
      _clearError();

      debugPrint('ETFProvider: Загружаем Ethereum данные');
      _ethereumData = await _etfService.getEthereumData();
      await _storageService.saveEthereumData(_ethereumData);
      _isEthereumLoaded = true;
      
      // Логируем успешную загрузку данных
      AnalyticsService.logDataRefresh(
        dataType: 'ethereum_etf_flows',
        success: true,
      );
      
      debugPrint(
        'ETFProvider: Ethereum данные загружены: ${_ethereumData.length} записей',
      );
      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки Ethereum: $e');
      
      // Логируем ошибку загрузки данных
      AnalyticsService.logDataRefresh(
        dataType: 'ethereum_etf_flows',
        success: false,
        errorMessage: e.toString(),
      );
      
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

      debugPrint('ETFProvider: Загружаем Bitcoin данные');
      _bitcoinData = await _etfService.getBitcoinData();
      await _storageService.saveBitcoinData(_bitcoinData);
      _isBitcoinLoaded = true;
      
      // Логируем успешную загрузку данных
      AnalyticsService.logDataRefresh(
        dataType: 'bitcoin_etf_flows',
        success: true,
      );
      
      debugPrint(
        'ETFProvider: Bitcoin данные загружены: ${_bitcoinData.length} записей',
      );
      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки Bitcoin: $e');
      
      // Логируем ошибку загрузки данных
      AnalyticsService.logDataRefresh(
        dataType: 'bitcoin_etf_flows',
        success: false,
        errorMessage: e.toString(),
      );
      
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

      debugPrint('ETFProvider: Загружаем сводные данные');
      _summaryData = await _etfService.getSummaryData();
      await _storageService.saveSummaryData(_summaryData!);
      _isSummaryLoaded = true;
      debugPrint('ETFProvider: Сводные данные загружены');
      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки сводных данных: $e');
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Инициализация данных при старте приложения
  Future<void> initializeData() async {
    try {
      _isInitializing = true;
      _clearError();
      notifyListeners();

      debugPrint('ETFProvider: Начинаем инициализацию данных');

      // При старте приложения всегда загружаем новые данные с сервера
      debugPrint('ETFProvider: Загружаем свежие данные с сервера при старте');
      try {
        await _loadAllDataFromServer();
      } catch (e) {
        debugPrint(
          'ETFProvider: Ошибка загрузки с сервера, загружаем из кэша: $e',
        );
        // Если загрузка с сервера не удалась, загружаем из кэша
        await loadFromCache();
      }

      debugPrint(
        'ETFProvider: Инициализация завершена. Ethereum: $_isEthereumLoaded, Bitcoin: $_isBitcoinLoaded',
      );
    } catch (e) {
      debugPrint('ETFProvider: Ошибка инициализации: $e');
      _setError(e.toString());
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  // Загрузить все данные с сервера
  Future<void> _loadAllDataFromServer() async {
    try {
      debugPrint('ETFProvider: Начинаем загрузку данных с сервера');

      // Загружаем все основные данные параллельно без установки loading
      final results = await Future.wait([
        _etfService.getEthereumData(),
        _etfService.getBitcoinData(),
        _etfService.getSummaryData(),
        _etfService.getFundHoldings(),
      ]);

      debugPrint('ETFProvider: Данные получены с сервера');
      debugPrint(
        'ETFProvider: Ethereum данных: ${(results[0] as List).length}',
      );
      debugPrint('ETFProvider: Bitcoin данных: ${(results[1] as List).length}');

      // Сохраняем данные
      _ethereumData = results[0] as List<ETFFlowData>;
      _bitcoinData = results[1] as List<BTCFlowData>;
      _summaryData = results[2] as Map<String, dynamic>;
      _fundHoldings = results[3] as Map<String, dynamic>;

      // Сохраняем в кэш
      await Future.wait([
        _storageService.saveEthereumData(_ethereumData),
        _storageService.saveBitcoinData(_bitcoinData),
        _storageService.saveSummaryData(_summaryData!),
        _storageService.saveFundHoldings(_fundHoldings!),
      ]);

      // Устанавливаем флаги готовности
      _isEthereumLoaded = _ethereumData.isNotEmpty;
      _isBitcoinLoaded = _bitcoinData.isNotEmpty;
      _isSummaryLoaded = _summaryData != null;
      _isFundHoldingsLoaded = _fundHoldings != null;

      // Обновляем время последнего обновления данных
      _lastDataUpdate = DateTime.now();

      debugPrint(
        'ETFProvider: Флаги установлены - Ethereum: $_isEthereumLoaded, Bitcoin: $_isBitcoinLoaded',
      );

      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки с сервера: $e');
      _setError(e.toString());
    }
  }

  // Загрузить все данные (принудительное обновление)
  Future<void> loadAllData() async {
    await _loadAllDataFromServer();
  }

  // Загрузить данные ETF потоков
  Future<void> loadETFFlowData() async {
    try {
      _setLoading(true);
      _clearError();

      _etfFlowData = await _etfService.getETFFlowData();
      await _storageService.saveETFFlowData(_etfFlowData);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Загрузить данные о владении фондами
  Future<void> loadFundHoldings() async {
    try {
      _setLoading(true);
      _clearError();

      _fundHoldings = await _etfService.getFundHoldings();
      await _storageService.saveFundHoldings(_fundHoldings!);
      _isFundHoldingsLoaded = true;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
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

  // Сбросить состояние загрузки (для повторной инициализации)
  void resetLoadingState() {
    _isEthereumLoaded = false;
    _isBitcoinLoaded = false;
    _isSummaryLoaded = false;
    _isFundHoldingsLoaded = false;
    _isInitializing = false;
    _isLoading = false;
    _error = null;
    notifyListeners();
  }

  // Очистить кэш
  Future<void> clearCache() async {
    await _storageService.clearAllData();
    resetLoadingState();
  }

  // Получить время последнего обновления
  Future<DateTime?> getLastUpdateTime() async {
    return await _storageService.getLastUpdateTime();
  }

  // Проверить и загрузить данные с учетом кэша
  Future<void> checkAndLoadData() async {
    try {
      debugPrint('ETFProvider: Проверяем актуальность данных');

      final hasCachedData = await _storageService.hasCachedData();
      if (!hasCachedData) {
        debugPrint('ETFProvider: Кэша нет, загружаем с сервера');
        await _loadAllDataFromServer();
        return;
      }

      final shouldUpdate = await _storageService.shouldUpdateData();
      if (shouldUpdate) {
        debugPrint('ETFProvider: Данные устарели, загружаем с сервера');
        await _loadAllDataFromServer();
      } else {
        debugPrint('ETFProvider: Данные актуальны, загружаем из кэша');
        await loadFromCache();
      }
    } catch (e) {
      debugPrint('ETFProvider: Ошибка при проверке данных: $e');
      _setError(e.toString());
    }
  }

  // Принудительное обновление всех данных с сервера
  Future<void> forceRefreshAllData() async {
    try {
      _setLoading(true);
      _clearError();
      debugPrint('ETFProvider: Принудительное обновление всех данных');

      await _loadAllDataFromServer();

      debugPrint('ETFProvider: Принудительное обновление завершено');
    } catch (e) {
      debugPrint('ETFProvider: Ошибка принудительного обновления: $e');
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }
}
