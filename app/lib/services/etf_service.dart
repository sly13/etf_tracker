import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../models/etf_flow_data.dart';
import '../config/app_config.dart';

class ETFService {
  static const Duration _timeout = Duration(seconds: 10);

  // Получить данные Ethereum ETF потоков
  Future<List<ETFFlowData>> getEthereumData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/eth');

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
          'Ошибка загрузки Ethereum данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Сервер не отвечает. Проверьте, запущен ли бэкенд.');
      }
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить данные Bitcoin ETF потоков
  Future<List<BTCFlowData>> getBitcoinData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/bitcoin');

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
        return jsonData.map((json) => BTCFlowData.fromJson(json)).toList();
      } else {
        throw Exception(
          'Ошибка загрузки Bitcoin данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Сервер не отвечает. Проверьте, запущен ли бэкенд.');
      }
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить суммарные данные ETF потоков
  Future<Map<String, dynamic>> getSummaryData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/summary');

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
          'Ошибка загрузки суммарных данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Сервер не отвечает. Проверьте, запущен ли бэкенд.');
      }
      throw Exception('Ошибка сети: $e');
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
}
