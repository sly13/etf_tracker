import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../config/app_config.dart';
import '../models/etf_flow_data.dart';

class ScreenshotService {
  /// Создать красивый скриншот с данными ETF за последнюю доступную дату
  static Future<void> createDailyETFScreenshot({
    required BuildContext context,
  }) async {
    try {
      // Показываем индикатор загрузки
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      // Получаем текущий язык пользователя
      final locale = Localizations.localeOf(context);
      final languageCode = locale.languageCode;

      // Запрашиваем изображение с бэкенда (последняя доступная дата)
      final imageBytes = await _generateImageFromBackend(languageCode);

      // Закрываем индикатор загрузки
      Navigator.of(context).pop();

      // Сохраняем изображение
      final file = await _saveImageToFile(imageBytes, 'etf_daily_latest.png');

      // Показываем диалог с результатом
      await _showScreenshotDialog(context, file);
    } catch (e) {
      // Закрываем индикатор загрузки если он открыт
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }

      debugPrint('Ошибка создания скриншота: $e');
      _showErrorDialog(context, 'Ошибка создания скриншота: $e');
    }
  }

  /// Запросить изображение с бэкенда (последняя доступная дата)
  static Future<Uint8List> _generateImageFromBackend(
    String languageCode,
  ) async {
    final url = AppConfig.getApiUrl('/image/today?lang=$languageCode');

    final response = await http.get(
      Uri.parse(url),
      headers: {'Accept': 'image/png'},
    );

    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      throw Exception('Ошибка получения изображения: ${response.statusCode}');
    }
  }

  /// Сохранить изображение в файл
  static Future<File> _saveImageToFile(
    Uint8List imageData,
    String fileName,
  ) async {
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/$fileName');
    await file.writeAsBytes(imageData);
    return file;
  }

  /// Показать диалог с результатом
  static Future<void> _showScreenshotDialog(
    BuildContext context,
    File file,
  ) async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Скриншот создан'),
        content: const Text('Изображение сохранено и готово к отправке'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Закрыть'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await Share.shareXFiles([
                XFile(file.path),
              ], text: 'ETF Tracker - Данные за день');
            },
            child: const Text('Поделиться'),
          ),
        ],
      ),
    );
  }

  /// Показать диалог с ошибкой
  static void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ошибка'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
