class FundDetail {
  final int id;
  final String fundKey;
  final String name;
  final String? description;
  final String? logoUrl;
  final String? ticker;
  final String? fundType;
  final double? feePercentage;
  final DateTime? launchDate;
  final String? status;
  final String btcHoldings;
  final String ethHoldings;
  final String totalAssets;
  final DateTime createdAt;
  final DateTime updatedAt;

  FundDetail({
    required this.id,
    required this.fundKey,
    required this.name,
    this.description,
    this.logoUrl,
    this.ticker,
    this.fundType,
    this.feePercentage,
    this.launchDate,
    this.status,
    required this.btcHoldings,
    required this.ethHoldings,
    required this.totalAssets,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FundDetail.fromJson(Map<String, dynamic> json) {
    return FundDetail(
      id: json['id'] ?? 0,
      fundKey: json['fundKey'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      logoUrl: json['logoUrl'],
      ticker: json['ticker'],
      fundType: json['fundType'],
      feePercentage: json['feePercentage']?.toDouble(),
      launchDate: json['launchDate'] != null
          ? DateTime.parse(json['launchDate'])
          : null,
      status: json['status'],
      btcHoldings: json['btcHoldings']?.toString() ?? '0',
      ethHoldings: json['ethHoldings']?.toString() ?? '0',
      totalAssets: json['totalAssets']?.toString() ?? '0',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fundKey': fundKey,
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'ticker': ticker,
      'fundType': fundType,
      'feePercentage': feePercentage,
      'launchDate': launchDate?.toIso8601String(),
      'status': status,
      'btcHoldings': btcHoldings,
      'ethHoldings': ethHoldings,
      'totalAssets': totalAssets,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Получить количество дней с даты запуска
  int getDaysSinceLaunch() {
    if (launchDate == null) return 0;
    final now = DateTime.now();
    return now.difference(launchDate!).inDays;
  }

  // Преобразовать строку в число для форматирования
  double _parseBigIntString(String value) {
    try {
      return double.parse(value);
    } catch (e) {
      return 0.0;
    }
  }

  double get btcHoldingsValue => _parseBigIntString(btcHoldings);
  double get ethHoldingsValue => _parseBigIntString(ethHoldings);
  double get totalAssetsValue => _parseBigIntString(totalAssets);
}

