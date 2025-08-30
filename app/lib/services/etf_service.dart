import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/etf_flow_data.dart';
import '../config/app_config.dart';

class ETFService {
  // Получить данные Ethereum ETF потоков
  Future<List<ETFFlowData>> getEthereumData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/eth');
      print('🔗 Запрос к: $url');

      final response = await http.get(Uri.parse(url));
      print(
        '📡 Ответ: ${response.statusCode} - ${response.body.length} символов',
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        print('✅ Получено ${jsonData.length} записей Ethereum');
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        print('❌ Ошибка HTTP: ${response.statusCode}');
        print('📄 Тело ответа: ${response.body}');
        throw Exception(
          'Ошибка загрузки Ethereum данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('💥 Исключение: $e');
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить данные Bitcoin ETF потоков
  Future<List<ETFFlowData>> getBitcoinData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/bitcoin');
      print('🔗 Запрос к: $url');

      final response = await http.get(Uri.parse(url));
      print(
        '📡 Ответ: ${response.statusCode} - ${response.body.length} символов',
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        print('✅ Получено ${jsonData.length} записей Bitcoin');
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        print('❌ Ошибка HTTP: ${response.statusCode}');
        print('📄 Тело ответа: ${response.body}');
        throw Exception(
          'Ошибка загрузки Bitcoin данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('💥 Исключение: $e');
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить суммарные данные ETF потоков
  Future<Map<String, dynamic>> getSummaryData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/summary');
      print('🔗 Запрос к: $url');

      final response = await http.get(Uri.parse(url));
      print(
        '📡 Ответ: ${response.statusCode} - ${response.body.length} символов',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Получены суммарные данные');
        return data;
      } else {
        print('❌ Ошибка HTTP: ${response.statusCode}');
        print('📄 Тело ответа: ${response.body}');
        throw Exception(
          'Ошибка загрузки суммарных данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('💥 Исключение: $e');
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить общие данные ETF потоков
  Future<List<ETFFlowData>> getETFFlowData() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow');
      print('🔗 Запрос к: $url');

      final response = await http.get(Uri.parse(url));
      print(
        '📡 Ответ: ${response.statusCode} - ${response.body.length} символов',
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        print('✅ Получено ${jsonData.length} общих записей ETF');
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        print('❌ Ошибка HTTP: ${response.statusCode}');
        print('📄 Тело ответа: ${response.body}');
        throw Exception(
          'Ошибка загрузки данных ETF потоков: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('💥 Исключение: $e');
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить данные о владении фондами
  Future<Map<String, dynamic>> getFundHoldings() async {
    try {
      final url = AppConfig.getApiUrl('/etf-flow/holdings');
      print('🔗 Запрос к: $url');

      final response = await http.get(Uri.parse(url));
      print(
        '📡 Ответ: ${response.statusCode} - ${response.body.length} символов',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Получены данные о владении фондами');
        return data;
      } else {
        print('❌ Ошибка HTTP: ${response.statusCode}');
        print('📄 Тело ответа: ${response.body}');
        throw Exception(
          'Ошибка загрузки данных о владении фондами: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('💥 Исключение: $e');
      throw Exception('Ошибка сети: $e');
    }
  }
}
