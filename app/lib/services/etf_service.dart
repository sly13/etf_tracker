import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:easy_localization/easy_localization.dart';
import '../models/etf_flow_data.dart';
import '../models/cefi_index.dart';
import '../config/app_config.dart';

class ETFService {
  static const Duration _timeout = Duration(seconds: 10);

  // Получить данные Ethereum ETF потоков
  Future<List<ETFFlowData>> getEthereumData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/eth');
      print('🔧 ETFService: Request to URL: $url');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        throw Exception(
          '${'errors.ethereum_load_error'.tr()}: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить данные Bitcoin ETF потоков
  Future<List<BTCFlowData>> getBitcoinData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/bitcoin');
      print('🔧 ETFService: Bitcoin request to URL: $url');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        print(
          '🔧 ETFService: Bitcoin data received: ${jsonData.length} records',
        );
        return jsonData.map((json) => BTCFlowData.fromJson(json)).toList();
      } else {
        print(
          '🔧 ETFService: Bitcoin request failed with status: ${response.statusCode}',
        );
        print('🔧 ETFService: Response body: ${response.body}');
        throw Exception(
          '${'errors.bitcoin_load_error'.tr()}: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('🔧 ETFService: Bitcoin request error: $e');
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить данные Solana ETF потоков
  Future<List<ETFFlowData>> getSolanaData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/solana');
      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () => throw TimeoutException('errors.timeout'.tr()),
          );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        // Маппим в ETFFlowData, лишние поля будут null
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        throw Exception(
          'Ошибка загрузки данных Solana ETF: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить суммарные данные ETF потоков
  Future<Map<String, dynamic>> getSummaryData() async {
    try {
      final url = AppConfig.getApiUrl('/summary');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        throw Exception(
          '${'errors.summary_load_error'.tr()}: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить общие данные ETF потоков
  Future<List<ETFFlowData>> getETFFlowData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow');

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
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        throw Exception(
          'Ошибка загрузки данных ETF потоков: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Сервер не отвечает. Проверьте, запущен ли бэкенд.');
      }
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить данные о владении фондами
  Future<Map<String, dynamic>> getFundHoldings() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/holdings');

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
        return data;
      } else {
        throw Exception(
          'Ошибка загрузки данных о владении фондами: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Сервер не отвечает. Проверьте, запущен ли бэкенд.');
      }
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить последние N событий притоков/оттоков за сегодня
  Future<Map<String, dynamic>> getTodayEvents({int limit = 5}) async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/events/today?limit=$limit');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        throw Exception(
          'Ошибка загрузки событий за сегодня: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить все события притоков/оттоков с пагинацией
  Future<Map<String, dynamic>> getAllEvents({int page = 1, int limit = 20}) async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/events?page=$page&limit=$limit');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        throw Exception(
          'Ошибка загрузки событий: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить транзакции для конкретной компании
  Future<List<Map<String, dynamic>>> getCompanyTransactions(
    String companyName, {
    int limit = 50,
  }) async {
    try {
      // Получаем все события и фильтруем по компании на клиенте
      // В будущем можно добавить фильтрацию на бэкенде
      final allEvents = await getAllEvents(limit: limit);
      final events = allEvents['events'] as List<dynamic>? ?? [];
      
      // Фильтруем события по названию компании
      final companyTransactions = events
          .where((event) {
            final eventCompany = event['company'] as String? ?? '';
            return eventCompany == companyName;
          })
          .map((event) => event as Map<String, dynamic>)
          .toList();

      return companyTransactions;
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить детали фонда по ключу
  Future<Map<String, dynamic>> getFundDetails(
    String fundKey, {
    String? language,
  }) async {
    try {
      final langParam = language != null ? '?lang=$language' : '';
      final url = AppConfig.getApiUrl('/funds/$fundKey$langParam');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        throw Exception(
          'Ошибка загрузки данных фонда: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить все CEFI индексы
  Future<AllCEFIIndices> getAllCEFIIndices({int? limit}) async {
    try {
      final queryParam = limit != null ? '?limit=$limit' : '';
      final url = AppConfig.getApiUrl('/cefi/all$queryParam');
      print('🔧 ETFService: CEFI indices request to URL: $url');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        return AllCEFIIndices.fromJson(jsonData);
      } else {
        throw Exception(
          'Ошибка загрузки CEFI индексов: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить данные индекса по типу
  Future<CEFIIndexResponse> getCEFIIndex(String indexType) async {
    try {
      final url = AppConfig.getApiUrl('/cefi/$indexType');
      print('🔧 ETFService: CEFI index request to URL: $url');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        return CEFIIndexResponse.fromJson(jsonData);
      } else {
        throw Exception(
          'Ошибка загрузки CEFI индекса: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }

  // Получить данные графика индекса
  Future<IndexChartResponse> getIndexChart(
    String indexType, {
    String timeRange = 'all',
  }) async {
    try {
      final url = AppConfig.getApiUrl(
        '/cefi/chart/$indexType?timeRange=$timeRange',
      );
      print('🔧 ETFService: Index chart request to URL: $url');

      final response = await http
          .get(Uri.parse(url))
          .timeout(
            _timeout,
            onTimeout: () {
              throw TimeoutException('errors.timeout'.tr());
            },
          );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        return IndexChartResponse.fromJson(jsonData);
      } else {
        throw Exception(
          'Ошибка загрузки графика индекса: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('errors.server_unavailable'.tr());
      }
      throw Exception('${'errors.network_error'.tr()}: $e');
    }
  }
}
