import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/etf_flow_data.dart';

class ETFService {
  static const String baseUrl = 'http://localhost:3000';

  // Получить данные Ethereum ETF потоков
  Future<List<ETFFlowData>> getEthereumData() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/etf-flow/eth'));

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        throw Exception(
          'Ошибка загрузки Ethereum данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить данные Bitcoin ETF потоков
  Future<List<ETFFlowData>> getBitcoinData() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/etf-flow/bitcoin'));

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((json) => ETFFlowData.fromJson(json)).toList();
      } else {
        throw Exception(
          'Ошибка загрузки Bitcoin данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Ошибка сети: $e');
    }
  }

  // Получить суммарные данные ETF потоков
  Future<Map<String, dynamic>> getSummaryData() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/etf-flow/summary'));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception(
          'Ошибка загрузки суммарных данных: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Ошибка сети: $e');
    }
  }
}
