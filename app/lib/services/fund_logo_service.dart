import 'package:flutter/material.dart';

class FundLogoService {
  static const Map<String, String> _fundLogos = {
    'blackrock': 'assets/fund_logos/blackrock.jpg',
    'fidelity': 'assets/fund_logos/fidelity.jpg',
    'bitwise': 'assets/fund_logos/bitwise.jpg',
    'twentyOneShares': 'assets/fund_logos/ark.jpg',
    'vanEck': 'assets/fund_logos/vaneck.jpg',
    'invesco': 'assets/fund_logos/invesco.jpg',
    'franklin': 'assets/fund_logos/franklin.jpg',
    'grayscale': 'assets/fund_logos/grayscale.jpg',
    'grayscaleCrypto': 'assets/fund_logos/grayscale-gbtc.jpg',
    'valkyrie': 'assets/fund_logos/valkyrie.jpg',
    'wisdomTree': 'assets/fund_logos/wtree.jpg',
  };

  /// Получить путь к логотипу фонда по ключу
  static String? getLogoPath(String fundKey) {
    return _fundLogos[fundKey];
  }

  /// Получить Image widget для логотипа фонда
  static Widget? getLogoWidget(
    String fundKey, {
    double? width,
    double? height,
    BoxFit fit = BoxFit.contain,
    BorderRadius? borderRadius,
  }) {
    final logoPath = getLogoPath(fundKey);
    if (logoPath == null) return null;

    Widget image = Image.asset(
      logoPath,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        // Fallback на иконку если изображение не загрузилось
        return Icon(
          Icons.account_balance,
          size: width ?? height ?? 24,
          color: Colors.grey[600],
        );
      },
    );

    // Добавляем скругленные углы если указаны
    if (borderRadius != null) {
      image = ClipRRect(borderRadius: borderRadius, child: image);
    }

    return image;
  }

  /// Получить все доступные ключи фондов
  static List<String> getAvailableFundKeys() {
    return _fundLogos.keys.toList();
  }

  /// Проверить, есть ли логотип для фонда
  static bool hasLogo(String fundKey) {
    return _fundLogos.containsKey(fundKey);
  }

  /// Получить название фонда по ключу
  static String getFundName(String fundKey) {
    switch (fundKey) {
      case 'blackrock':
        return 'BlackRock';
      case 'fidelity':
        return 'Fidelity';
      case 'bitwise':
        return 'Bitwise';
      case 'twentyOneShares':
        return '21Shares';
      case 'vanEck':
        return 'VanEck';
      case 'invesco':
        return 'Invesco';
      case 'franklin':
        return 'Franklin Templeton';
      case 'grayscale':
        return 'Grayscale';
      case 'grayscaleCrypto':
        return 'Grayscale Crypto';
      case 'valkyrie':
        return 'Valkyrie';
      case 'wisdomTree':
        return 'WisdomTree';
      default:
        return fundKey;
    }
  }
}
