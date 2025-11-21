import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/etf_flow_data.dart';
import '../models/cefi_index.dart';
import '../services/etf_service.dart';
import '../services/local_storage_service.dart';
import '../services/analytics_service.dart';

class ETFProvider with ChangeNotifier {
  final ETFService _etfService = ETFService();
  final LocalStorageService _storageService = LocalStorageService();

  List<ETFFlowData> _ethereumData = [];
  List<BTCFlowData> _bitcoinData = [];
  List<ETFFlowData> _solanaData = [];
  List<ETFFlowData> _etfFlowData = [];
  Map<String, dynamic>? _fundHoldings;
  Map<String, dynamic>? _summaryData;
  bool _isLoading = false;
  bool _isInitializing = false;
  bool _isEthereumLoaded = false;
  bool _isBitcoinLoaded = false;
  bool _isSolanaLoaded = false;
  bool _isSummaryLoaded = false;
  bool _isFundHoldingsLoaded = false;
  bool _isCEFIIndicesLoaded = false;
  AllCEFIIndices? _cefiIndices;
  String? _error;
  String _currentTab = 'ethereum'; // 'ethereum' или 'bitcoin'
  int _navigationTabIndex = 0; // Индекс текущего таба в навигации
  int _cryptoETFTabIndex = 0; // Индекс текущего таба в CryptoETFTabsScreen (0=BTC, 1=ETH, 2=SOL)
  DateTime? _lastDataUpdate; // Время последнего обновления данных

  // Конструктор - загружаем данные из кэша сразу
  ETFProvider() {
    // Загружаем данные из кэша немедленно при создании провайдера
    _loadFromCacheImmediately();
  }

  // Getters
  List<ETFFlowData> get ethereumData => _ethereumData;
  List<BTCFlowData> get bitcoinData => _bitcoinData;
  List<ETFFlowData> get solanaData => _solanaData;
  List<ETFFlowData> get etfFlowData => _etfFlowData;
  Map<String, dynamic>? get fundHoldings => _fundHoldings;
  List<BaseETFFlowData> get currentData =>
      _currentTab == 'ethereum' ? _ethereumData : _bitcoinData;
  Map<String, dynamic>? get summaryData => _summaryData;
  bool get isLoading => _isLoading;
  bool get isInitializing => _isInitializing;
  bool get isEthereumLoaded => _isEthereumLoaded;
  bool get isBitcoinLoaded => _isBitcoinLoaded;
  bool get isSolanaLoaded => _isSolanaLoaded;
  bool get isSummaryLoaded => _isSummaryLoaded;
  bool get isFundHoldingsLoaded => _isFundHoldingsLoaded;
  bool get isCEFIIndicesLoaded => _isCEFIIndicesLoaded;
  AllCEFIIndices? get cefiIndices => _cefiIndices;
  String? get error => _error;
  String get currentTab => _currentTab;
  int get navigationTabIndex => _navigationTabIndex;
  int get cryptoETFTabIndex => _cryptoETFTabIndex;
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
    _storageService.saveNavigationTabIndex(tabIndex);
    notifyListeners();
  }

  // Переключить таб в CryptoETFTabsScreen
  void switchCryptoETFTab(int tabIndex) {
    _cryptoETFTabIndex = tabIndex;
    _storageService.saveCryptoETFTabIndex(tabIndex);
    notifyListeners();
  }

  // Установить навигацию на Crypto ETF экран с нужным табом
  void navigateToCryptoETF(int tabIndex) {
    _navigationTabIndex = 1; // CryptoETFTabsScreen находится на индексе 1
    _cryptoETFTabIndex = tabIndex;
    _storageService.saveNavigationTabIndex(_navigationTabIndex);
    _storageService.saveCryptoETFTabIndex(tabIndex);
    notifyListeners();
  }

  // Загрузить данные из кэша немедленно (вызывается в конструкторе)
  void _loadFromCacheImmediately() {
    // Загружаем данные из кэша асинхронно, но сразу при создании провайдера
    // Запускаем без await, чтобы не блокировать конструктор
    _loadCacheData();
  }

  // Вспомогательный метод для загрузки данных из кэша
  Future<void> _loadCacheData() async {
    try {
      _clearError();

      debugPrint('ETFProvider: [CACHE] Начинаем загрузку данных из кэша');

      // Загружаем все данные из кэша параллельно
      final results = await Future.wait([
        _storageService.getEthereumData(),
        _storageService.getBitcoinData(),
        _storageService.getSolanaData(),
        _storageService.getSummaryData(),
        _storageService.getFundHoldings(),
        _storageService.getETFFlowData(),
        _storageService.getCEFIIndices(),
        _storageService.getLastUpdateTime(),
      ]);

      _ethereumData = results[0] as List<ETFFlowData>;
      _bitcoinData = results[1] as List<BTCFlowData>;
      _solanaData = results[2] as List<ETFFlowData>;
      _summaryData = results[3] as Map<String, dynamic>?;
      _fundHoldings = results[4] as Map<String, dynamic>?;
      _etfFlowData = results[5] as List<ETFFlowData>;
      _cefiIndices = results[6] as AllCEFIIndices?;
      _lastDataUpdate = results[7] as DateTime?;

      // Устанавливаем флаги загрузки
      _isEthereumLoaded = _ethereumData.isNotEmpty;
      _isBitcoinLoaded = _bitcoinData.isNotEmpty;
      _isSolanaLoaded = _solanaData.isNotEmpty;
      _isSummaryLoaded = _summaryData != null;
      _isFundHoldingsLoaded = _fundHoldings != null;
      _isCEFIIndicesLoaded = _cefiIndices != null;

      debugPrint('ETFProvider: [CACHE] Данные из кэша загружены');
      debugPrint('ETFProvider: [CACHE] Ethereum: ${_ethereumData.length}, Bitcoin: ${_bitcoinData.length}, Solana: ${_solanaData.length}');
      debugPrint('ETFProvider: [CACHE] Summary: $_isSummaryLoaded, CEFI: $_isCEFIIndicesLoaded');
      debugPrint('ETFProvider: [CACHE] Summary данные: ${_summaryData != null ? "есть (${_summaryData!.keys})" : "нет"}');
      if (_summaryData != null) {
        debugPrint('ETFProvider: [CACHE] Summary bitcoin: ${_summaryData!['bitcoin']?['totalAssets'] ?? "null"}');
        debugPrint('ETFProvider: [CACHE] Summary ethereum: ${_summaryData!['ethereum']?['totalAssets'] ?? "null"}');
      }
      if (_cefiIndices != null) {
        debugPrint('ETFProvider: [CACHE] CEFI Composite value: ${_cefiIndices!.composite.current.value}');
      }

      notifyListeners();
    } catch (e, stackTrace) {
      debugPrint('ETFProvider: [CACHE] Ошибка загрузки кэшированных данных: $e');
      debugPrint('ETFProvider: [CACHE] StackTrace: $stackTrace');
      _setError('Ошибка загрузки кэшированных данных: ${e.toString()}');
    }
  }

  // Загрузить данные из кэша
  Future<void> loadFromCache() async {
    try {
      _clearError();

      debugPrint('ETFProvider: Загружаем данные из кэша');

      // Загружаем все данные из кэша параллельно
      final results = await Future.wait([
        _storageService.getEthereumData(),
        _storageService.getBitcoinData(),
        _storageService.getSolanaData(),
        _storageService.getSummaryData(),
        _storageService.getFundHoldings(),
        _storageService.getETFFlowData(),
        _storageService.getCEFIIndices(),
        _storageService.getLastUpdateTime(),
      ]);

      _ethereumData = results[0] as List<ETFFlowData>;
      _bitcoinData = results[1] as List<BTCFlowData>;
      _solanaData = results[2] as List<ETFFlowData>;
      _summaryData = results[3] as Map<String, dynamic>?;
      _fundHoldings = results[4] as Map<String, dynamic>?;
      _etfFlowData = results[5] as List<ETFFlowData>;
      _cefiIndices = results[6] as AllCEFIIndices?;
      _lastDataUpdate = results[7] as DateTime?;

      // Устанавливаем флаги загрузки
      _isEthereumLoaded = _ethereumData.isNotEmpty;
      _isBitcoinLoaded = _bitcoinData.isNotEmpty;
      _isSolanaLoaded = _solanaData.isNotEmpty;
      _isSummaryLoaded = _summaryData != null;
      _isFundHoldingsLoaded = _fundHoldings != null;
      _isCEFIIndicesLoaded = _cefiIndices != null;

      debugPrint('ETFProvider: Данные из кэша загружены. Summary: $_isSummaryLoaded, CEFI: $_isCEFIIndicesLoaded');

      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки кэшированных данных: $e');
      _setError('Ошибка загрузки кэшированных данных: ${e.toString()}');
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

  // Загрузить данные Solana
  Future<void> loadSolanaData() async {
    try {
      _setLoading(true);
      _clearError();

      debugPrint('ETFProvider: Загружаем Solana данные');
      _solanaData = await _etfService.getSolanaData();
      _isSolanaLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки Solana: $e');
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

      // При перезагрузке всегда показываем главную страницу (ETF Summary)
      _navigationTabIndex = 0;
      // Но сохраняем индекс таба в Crypto ETF экране (BTC/ETH/SOL)
      _cryptoETFTabIndex = await _storageService.getCryptoETFTabIndex();
      debugPrint('ETFProvider: Установлен главный экран, Crypto ETF таб: $_cryptoETFTabIndex');

      // Данные из кэша уже загружены в конструкторе через _loadFromCacheImmediately()
      // Ждем немного, чтобы дать время загрузке из кэша завершиться
      // Если данные еще не загружены, загружаем их еще раз
      await Future.delayed(const Duration(milliseconds: 100));
      
      if (!_isSummaryLoaded) {
        debugPrint('ETFProvider: [INIT] Данные из кэша еще не загружены, загружаем сейчас');
        await loadFromCache();
      } else {
        debugPrint('ETFProvider: [INIT] Данные из кэша уже загружены, Summary: $_isSummaryLoaded');
        if (_summaryData != null) {
          debugPrint('ETFProvider: [INIT] Summary данные есть: ${_summaryData!.keys}');
        }
      }

      // Затем обновляем данные с сервера в фоне
      debugPrint('ETFProvider: Обновляем данные с сервера в фоне');
      _isInitializing = false;
      notifyListeners();

      // Обновление в фоне без блокировки UI
      Future.microtask(() async {
        try {
          await _loadAllDataFromServer();
          debugPrint('ETFProvider: Данные обновлены с сервера');
        } catch (e) {
          debugPrint('ETFProvider: Ошибка обновления с сервера: $e');
          // Не показываем ошибку пользователю, просто используем кэшированные данные
        }
      });

      debugPrint(
        'ETFProvider: Инициализация завершена. Ethereum: $_isEthereumLoaded, Bitcoin: $_isBitcoinLoaded, Summary: $_isSummaryLoaded',
      );
    } catch (e) {
      debugPrint('ETFProvider: Ошибка инициализации: $e');
      _setError(e.toString());
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
        _etfService.getSolanaData(),
        _etfService.getSummaryData(),
        _etfService.getFundHoldings(),
        _etfService.getAllCEFIIndices(limit: 30),
      ]);

      debugPrint('ETFProvider: Данные получены с сервера');
      debugPrint(
        'ETFProvider: Ethereum данных: ${(results[0] as List).length}',
      );
      debugPrint('ETFProvider: Bitcoin данных: ${(results[1] as List).length}');

      // Сохраняем данные
      _ethereumData = results[0] as List<ETFFlowData>;
      _bitcoinData = results[1] as List<BTCFlowData>;
      _solanaData = results[2] as List<ETFFlowData>;
      _summaryData = results[3] as Map<String, dynamic>;
      _fundHoldings = results[4] as Map<String, dynamic>;
      _cefiIndices = results[5] as AllCEFIIndices;

      // Обновляем lastUpdated на текущее локальное время пользователя
      if (_summaryData != null && _summaryData!['overall'] != null) {
        _summaryData!['overall']['lastUpdated'] = DateTime.now().toIso8601String();
      }

      // Сохраняем в кэш
      debugPrint('ETFProvider: [SERVER] Сохраняем данные в кэш');
      await Future.wait([
        _storageService.saveEthereumData(_ethereumData),
        _storageService.saveBitcoinData(_bitcoinData),
        _storageService.saveSolanaData(_solanaData),
        _storageService.saveSummaryData(_summaryData!),
        _storageService.saveFundHoldings(_fundHoldings!),
        _storageService.saveCEFIIndices(_cefiIndices!),
      ]);
      debugPrint('ETFProvider: [SERVER] Данные сохранены в кэш');

      // Устанавливаем флаги готовности
      _isEthereumLoaded = _ethereumData.isNotEmpty;
      _isBitcoinLoaded = _bitcoinData.isNotEmpty;
      _isSolanaLoaded = _solanaData.isNotEmpty;
      _isSummaryLoaded = _summaryData != null;
      _isFundHoldingsLoaded = _fundHoldings != null;
      _isCEFIIndicesLoaded = _cefiIndices != null;

      // Обновляем время последнего обновления данных для триггера анимации
      _lastDataUpdate = DateTime.now();

      debugPrint(
        'ETFProvider: [SERVER] Флаги установлены - Ethereum: $_isEthereumLoaded, Bitcoin: $_isBitcoinLoaded, Solana: $_isSolanaLoaded, Summary: $_isSummaryLoaded',
      );
      if (_summaryData != null) {
        debugPrint('ETFProvider: [SERVER] Summary bitcoin: ${_summaryData!['bitcoin']?['totalAssets'] ?? "null"}');
        debugPrint('ETFProvider: [SERVER] Summary ethereum: ${_summaryData!['ethereum']?['totalAssets'] ?? "null"}');
      }

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

  // Загрузить данные CEFI индексов
  Future<void> loadCEFIIndices() async {
    try {
      _setLoading(true);
      _clearError();

      debugPrint('ETFProvider: Загружаем CEFI индексы');
      _cefiIndices = await _etfService.getAllCEFIIndices(limit: 30);
      await _storageService.saveCEFIIndices(_cefiIndices!);
      _isCEFIIndicesLoaded = true;

      debugPrint('ETFProvider: CEFI индексы загружены');
      notifyListeners();
    } catch (e) {
      debugPrint('ETFProvider: Ошибка загрузки CEFI индексов: $e');
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Сбросить состояние загрузки (для повторной инициализации)
  void resetLoadingState() {
    _isEthereumLoaded = false;
    _isBitcoinLoaded = false;
    _isSummaryLoaded = false;
    _isFundHoldingsLoaded = false;
    _isCEFIIndicesLoaded = false;
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
