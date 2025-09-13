import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:gal/gal.dart';
import 'package:easy_localization/easy_localization.dart';
import '../config/app_config.dart';

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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1C1C1E) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'screenshot.created'.tr(),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ),
            IconButton(
              onPressed: () => Navigator.of(context).pop(),
              icon: Icon(
                Icons.close,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
                size: 24,
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Показываем изображение
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
                  width: 1,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(file, fit: BoxFit.contain),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'screenshot.ready_to_send'.tr(),
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.grey[300] : Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          // Кнопки действий по центру
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: () async {
                  Navigator.of(context).pop();
                  await Share.shareXFiles([
                    XFile(file.path),
                  ], text: 'ETF Tracker - ${'common.updated'.tr()}');
                },
                icon: const Icon(Icons.share, size: 16),
                label: Text('screenshot.share'.tr()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: () async {
                  await _saveToGallery(file, context);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
                icon: const Icon(Icons.save_alt, size: 16),
                label: Text('screenshot.save_to_gallery'.tr()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Сохранить изображение в галерею
  static Future<void> _saveToGallery(File file, BuildContext context) async {
    try {
      debugPrint('Начинаем сохранение в галерею: ${file.path}');

      // Проверяем, что файл существует
      if (!await file.exists()) {
        throw Exception('Файл не найден: ${file.path}');
      }

      // Проверяем разрешения
      debugPrint('Проверяем разрешения доступа к галерее...');
      if (!await Gal.hasAccess()) {
        debugPrint('Запрашиваем разрешения...');
        await Gal.requestAccess();
      }

      debugPrint('Сохраняем изображение в галерею...');
      // Сохраняем в галерею
      await Gal.putImage(file.path);
      debugPrint('Изображение успешно сохранено в галерею');

      // Показываем уведомление об успехе
      HapticFeedback.lightImpact();

      // Показываем SnackBar с подтверждением
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text('screenshot.saved_to_gallery'.tr()),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    } catch (e) {
      debugPrint('Ошибка сохранения в галерею: $e');
      debugPrint('Тип ошибки: ${e.runtimeType}');

      // Показываем ошибку пользователю
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text('screenshot.save_error'.tr()),
              ],
            ),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    }
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
