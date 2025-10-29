// Базовая модель для ETF данных
abstract class BaseETFFlowData {
  final String date;
  final double? blackrock;
  final double? fidelity;
  final double? bitwise;
  final double? twentyOneShares;
  final double? vanEck;
  final double? invesco;
  final double? franklin;
  final double? grayscale;
  final double? total;

  BaseETFFlowData({
    required this.date,
    this.blackrock,
    this.fidelity,
    this.bitwise,
    this.twentyOneShares,
    this.vanEck,
    this.invesco,
    this.franklin,
    this.grayscale,
    this.total,
  });

  // Получить название компании по ключу
  static String getCompanyName(String key) {
    switch (key) {
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
      default:
        return key;
    }
  }
}

// Универсальная агрегированная запись для суммарного календаря
class CombinedFlowData extends BaseETFFlowData {
  final Map<String, double> companies; // ключи как в моделях
  final Map<String, Map<String, double>>
  companiesByAsset; // bitcoin/ethereum/solana -> {company: amount}

  CombinedFlowData({
    required super.date,
    required this.companies,
    required this.companiesByAsset,
    double? total,
  }) : super(total: total);
}

// Модель для Ethereum ETF данных
class ETFFlowData extends BaseETFFlowData {
  final double? grayscaleCrypto;

  ETFFlowData({
    required super.date,
    super.blackrock,
    super.fidelity,
    super.bitwise,
    super.twentyOneShares,
    super.vanEck,
    super.invesco,
    super.franklin,
    super.grayscale,
    this.grayscaleCrypto,
    super.total,
  });

  factory ETFFlowData.fromJson(Map<String, dynamic> json) {
    return ETFFlowData(
      date: json['date'] ?? '',
      blackrock: json['blackrock']?.toDouble(),
      fidelity: json['fidelity']?.toDouble(),
      bitwise: json['bitwise']?.toDouble(),
      twentyOneShares: json['twentyOneShares']?.toDouble(),
      vanEck: json['vanEck']?.toDouble(),
      invesco: json['invesco']?.toDouble(),
      franklin: json['franklin']?.toDouble(),
      grayscale: json['grayscale']?.toDouble(),
      grayscaleCrypto: json['grayscaleCrypto']?.toDouble(),
      total: json['total']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'blackrock': blackrock,
      'fidelity': fidelity,
      'bitwise': bitwise,
      'twentyOneShares': twentyOneShares,
      'vanEck': vanEck,
      'invesco': invesco,
      'franklin': franklin,
      'grayscale': grayscale,
      'grayscaleCrypto': grayscaleCrypto,
      'total': total,
    };
  }

  // Получить название компании по ключу (Ethereum специфичные)
  static String getCompanyName(String key) {
    switch (key) {
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
      default:
        return key;
    }
  }

  // Получить все компании с данными (только Ethereum фонды)
  List<MapEntry<String, double?>> getCompanies() {
    return [
      MapEntry('blackrock', blackrock),
      MapEntry('fidelity', fidelity),
      MapEntry('bitwise', bitwise),
      MapEntry('twentyOneShares', twentyOneShares),
      MapEntry('vanEck', vanEck),
      MapEntry('invesco', invesco),
      MapEntry('franklin', franklin),
      MapEntry('grayscale', grayscale),
      MapEntry('grayscaleCrypto', grayscaleCrypto),
    ];
  }
}

// Модель для Bitcoin ETF данных
class BTCFlowData extends BaseETFFlowData {
  final double? grayscaleBtc;
  final double? valkyrie;
  final double? wisdomTree;

  BTCFlowData({
    required super.date,
    super.blackrock,
    super.fidelity,
    super.bitwise,
    super.twentyOneShares,
    super.vanEck,
    super.invesco,
    super.franklin,
    super.grayscale,
    this.grayscaleBtc,
    this.valkyrie,
    this.wisdomTree,
    super.total,
  });

  factory BTCFlowData.fromJson(Map<String, dynamic> json) {
    return BTCFlowData(
      date: json['date'] ?? '',
      blackrock: json['blackrock']?.toDouble(),
      fidelity: json['fidelity']?.toDouble(),
      bitwise: json['bitwise']?.toDouble(),
      twentyOneShares: json['twentyOneShares']?.toDouble(),
      vanEck: json['vanEck']?.toDouble(),
      invesco: json['invesco']?.toDouble(),
      franklin: json['franklin']?.toDouble(),
      grayscale: json['grayscale']?.toDouble(),
      grayscaleBtc: json['grayscaleBtc']?.toDouble(),
      valkyrie: json['valkyrie']?.toDouble(),
      wisdomTree: json['wisdomTree']?.toDouble(),
      total: json['total']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'blackrock': blackrock,
      'fidelity': fidelity,
      'bitwise': bitwise,
      'twentyOneShares': twentyOneShares,
      'vanEck': vanEck,
      'invesco': invesco,
      'franklin': franklin,
      'grayscale': grayscale,
      'grayscaleBtc': grayscaleBtc,
      'valkyrie': valkyrie,
      'wisdomTree': wisdomTree,
      'total': total,
    };
  }

  // Получить название компании по ключу (Bitcoin специфичные)
  static String getCompanyName(String key) {
    switch (key) {
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
      case 'grayscaleBtc':
        return 'Grayscale BTC';
      case 'valkyrie':
        return 'Valkyrie';
      case 'wisdomTree':
        return 'WisdomTree';
      default:
        return key;
    }
  }

  // Получить все компании с данными (все Bitcoin фонды)
  List<MapEntry<String, double?>> getCompanies() {
    return [
      MapEntry('blackrock', blackrock),
      MapEntry('fidelity', fidelity),
      MapEntry('bitwise', bitwise),
      MapEntry('twentyOneShares', twentyOneShares),
      MapEntry('vanEck', vanEck),
      MapEntry('invesco', invesco),
      MapEntry('franklin', franklin),
      MapEntry('grayscale', grayscale),
      MapEntry('grayscaleBtc', grayscaleBtc),
      MapEntry('valkyrie', valkyrie),
      MapEntry('wisdomTree', wisdomTree),
    ];
  }
}
