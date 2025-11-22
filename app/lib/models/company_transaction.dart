class CompanyTransaction {
  final String time;
  final String company;
  final String etf;
  final double amount;
  final String date;

  CompanyTransaction({
    required this.time,
    required this.company,
    required this.etf,
    required this.amount,
    required this.date,
  });

  factory CompanyTransaction.fromJson(Map<String, dynamic> json) {
    return CompanyTransaction(
      time: json['time'] ?? '',
      company: json['company'] ?? '',
      etf: json['etf'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      date: json['date'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'company': company,
      'etf': etf,
      'amount': amount,
      'date': date,
    };
  }
}

