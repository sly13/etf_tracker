class CEFIIndexData {
  final String date;
  final double value;
  final double change;
  final double changePercent;

  CEFIIndexData({
    required this.date,
    required this.value,
    required this.change,
    required this.changePercent,
  });

  factory CEFIIndexData.fromJson(Map<String, dynamic> json) {
    return CEFIIndexData(
      date: json['date'] as String,
      value: (json['value'] as num).toDouble(),
      change: (json['change'] as num).toDouble(),
      changePercent: (json['changePercent'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'value': value,
      'change': change,
      'changePercent': changePercent,
    };
  }
}

class CEFIIndexResponse {
  final String index;
  final CEFIIndexData current;
  final List<CEFIIndexData> history;
  final Map<String, dynamic> metadata;

  CEFIIndexResponse({
    required this.index,
    required this.current,
    required this.history,
    required this.metadata,
  });

  factory CEFIIndexResponse.fromJson(Map<String, dynamic> json) {
    return CEFIIndexResponse(
      index: json['index'] as String,
      current: CEFIIndexData.fromJson(json['current'] as Map<String, dynamic>),
      history: (json['history'] as List<dynamic>)
          .map((item) => CEFIIndexData.fromJson(item as Map<String, dynamic>))
          .toList(),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'index': index,
      'current': current.toJson(),
      'history': history.map((item) => item.toJson()).toList(),
      'metadata': metadata,
    };
  }
}

class BPFData {
  final String date;
  final double percentage;
  final int positiveFunds;
  final int totalFunds;

  BPFData({
    required this.date,
    required this.percentage,
    required this.positiveFunds,
    required this.totalFunds,
  });

  factory BPFData.fromJson(Map<String, dynamic> json) {
    return BPFData(
      date: json['date'] as String,
      percentage: (json['percentage'] as num).toDouble(),
      positiveFunds: json['positiveFunds'] as int,
      totalFunds: json['totalFunds'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'percentage': percentage,
      'positiveFunds': positiveFunds,
      'totalFunds': totalFunds,
    };
  }
}

class AllCEFIIndices {
  final CEFIIndexResponse btc;
  final CEFIIndexResponse eth;
  final CEFIIndexResponse sol;
  final CEFIIndexResponse composite;
  final Map<String, List<BPFData>> bpf;

  AllCEFIIndices({
    required this.btc,
    required this.eth,
    required this.sol,
    required this.composite,
    required this.bpf,
  });

  factory AllCEFIIndices.fromJson(Map<String, dynamic> json) {
    return AllCEFIIndices(
      btc: CEFIIndexResponse.fromJson(json['btc'] as Map<String, dynamic>),
      eth: CEFIIndexResponse.fromJson(json['eth'] as Map<String, dynamic>),
      sol: CEFIIndexResponse.fromJson(json['sol'] as Map<String, dynamic>),
      composite: CEFIIndexResponse.fromJson(
        json['composite'] as Map<String, dynamic>,
      ),
      bpf: {
        'bitcoin': (json['bpf']['bitcoin'] as List<dynamic>)
            .map((item) => BPFData.fromJson(item as Map<String, dynamic>))
            .toList(),
        'ethereum': (json['bpf']['ethereum'] as List<dynamic>)
            .map((item) => BPFData.fromJson(item as Map<String, dynamic>))
            .toList(),
      },
    );
  }
}

class ChartDataPoint {
  final String date;
  final double indexValue;
  final double btcPrice;
  final double btcVolume;
  final Map<String, dynamic>? flows;

  ChartDataPoint({
    required this.date,
    required this.indexValue,
    required this.btcPrice,
    required this.btcVolume,
    this.flows,
  });

  factory ChartDataPoint.fromJson(Map<String, dynamic> json) {
    return ChartDataPoint(
      date: json['date'] as String,
      indexValue: (json['indexValue'] as num).toDouble(),
      btcPrice: (json['btcPrice'] as num).toDouble(),
      btcVolume: (json['btcVolume'] as num).toDouble(),
      flows: json['flows'] as Map<String, dynamic>?,
    );
  }
}

class IndexChartResponse {
  final String index;
  final List<ChartDataPoint> data;
  final Map<String, dynamic> current;

  IndexChartResponse({
    required this.index,
    required this.data,
    required this.current,
  });

  factory IndexChartResponse.fromJson(Map<String, dynamic> json) {
    return IndexChartResponse(
      index: json['index'] as String,
      data: (json['data'] as List<dynamic>)
          .map((item) => ChartDataPoint.fromJson(item as Map<String, dynamic>))
          .toList(),
      current: json['current'] as Map<String, dynamic>,
    );
  }
}

