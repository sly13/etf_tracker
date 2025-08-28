class ETF {
  final String id;
  final String name;
  final String ticker;
  final String description;
  final double currentPrice;
  final double changePercent;
  final double volume;
  final String assetClass;
  final double expenseRatio;
  final double totalAssets;
  final DateTime lastUpdated;

  ETF({
    required this.id,
    required this.name,
    required this.ticker,
    required this.description,
    required this.currentPrice,
    required this.changePercent,
    required this.volume,
    required this.assetClass,
    required this.expenseRatio,
    required this.totalAssets,
    required this.lastUpdated,
  });

  factory ETF.fromJson(Map<String, dynamic> json) {
    return ETF(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      ticker: json['ticker'] ?? '',
      description: json['description'] ?? '',
      currentPrice: (json['currentPrice'] ?? 0.0).toDouble(),
      changePercent: (json['changePercent'] ?? 0.0).toDouble(),
      volume: (json['volume'] ?? 0.0).toDouble(),
      assetClass: json['assetClass'] ?? '',
      expenseRatio: (json['expenseRatio'] ?? 0.0).toDouble(),
      totalAssets: (json['totalAssets'] ?? 0.0).toDouble(),
      lastUpdated: DateTime.parse(json['lastUpdated'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ticker': ticker,
      'description': description,
      'currentPrice': currentPrice,
      'changePercent': changePercent,
      'volume': volume,
      'assetClass': assetClass,
      'expenseRatio': expenseRatio,
      'totalAssets': totalAssets,
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }
}

class ETFFlow {
  final String id;
  final String etfId;
  final double flowAmount;
  final DateTime date;
  final String flowType; // 'inflow' or 'outflow'

  ETFFlow({
    required this.id,
    required this.etfId,
    required this.flowAmount,
    required this.date,
    required this.flowType,
  });

  factory ETFFlow.fromJson(Map<String, dynamic> json) {
    return ETFFlow(
      id: json['id'] ?? '',
      etfId: json['etfId'] ?? '',
      flowAmount: (json['flowAmount'] ?? 0.0).toDouble(),
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      flowType: json['flowType'] ?? 'inflow',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'etfId': etfId,
      'flowAmount': flowAmount,
      'date': date.toIso8601String(),
      'flowType': flowType,
    };
  }
}
