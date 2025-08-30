class ETFFlowData {
  final String date;
  final double? blackrock;
  final double? fidelity;
  final double? bitwise;
  final double? twentyOneShares;
  final double? vanEck;
  final double? invesco;
  final double? franklin;
  final double? grayscale;
  final double? grayscaleCrypto;
  final double? valkyrie;
  final double? wisdomTree;
  final double? total;

  ETFFlowData({
    required this.date,
    this.blackrock,
    this.fidelity,
    this.bitwise,
    this.twentyOneShares,
    this.vanEck,
    this.invesco,
    this.franklin,
    this.grayscale,
    this.grayscaleCrypto,
    this.valkyrie,
    this.wisdomTree,
    this.total,
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
      'grayscaleCrypto': grayscaleCrypto,
      'valkyrie': valkyrie,
      'wisdomTree': wisdomTree,
      'total': total,
    };
  }

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
      case 'grayscaleCrypto':
        return 'Grayscale Crypto';
      case 'valkyrie':
        return 'Valkyrie';
      case 'wisdomTree':
        return 'WisdomTree';
      default:
        return key;
    }
  }

  // Получить все компании с данными
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
      MapEntry('valkyrie', valkyrie),
      MapEntry('wisdomTree', wisdomTree),
    ];
  }
}
