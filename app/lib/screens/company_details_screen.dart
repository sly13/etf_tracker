import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:intl/intl.dart';
import '../services/etf_service.dart';
import '../models/company_transaction.dart';
import '../models/fund_detail.dart';
import '../utils/card_style_utils.dart';
import '../utils/adaptive_text_utils.dart';
import '../utils/haptic_feedback.dart';
import '../utils/fund_key_mapper.dart';

class CompanyDetailsScreen extends StatefulWidget {
  final String companyName;
  final double? btcValue;
  final double? ethValue;
  final double? solValue;
  final Map<String, double> separateFlowChanges;

  const CompanyDetailsScreen({
    super.key,
    required this.companyName,
    this.btcValue,
    this.ethValue,
    this.solValue,
    required this.separateFlowChanges,
  });

  @override
  State<CompanyDetailsScreen> createState() => _CompanyDetailsScreenState();
}

class _CompanyDetailsScreenState extends State<CompanyDetailsScreen> {
  final ETFService _etfService = ETFService();
  FundDetail? _fundDetail;
  List<CompanyTransaction> _transactions = [];
  bool _isLoadingFund = true;
  bool _isLoadingTransactions = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Используем addPostFrameCallback, чтобы context был доступен
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadFundDetails(),
      _loadTransactions(),
    ]);
  }

  Future<void> _loadFundDetails() async {
    setState(() {
      _isLoadingFund = true;
      _error = null;
    });

    try {
      final fundKey = FundKeyMapper.companyNameToFundKey(widget.companyName);
      // Получаем язык из EasyLocalization
      final language = context.locale.languageCode;
      
      final fundData = await _etfService.getFundDetails(
        fundKey,
        language: language,
      );
      
      final fundDetail = FundDetail.fromJson(fundData);

      setState(() {
        _fundDetail = fundDetail;
        _isLoadingFund = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoadingFund = false;
      });
    }
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoadingTransactions = true;
    });

    try {
      final transactionsData =
          await _etfService.getCompanyTransactions(widget.companyName);
      final transactions = transactionsData
          .map((json) => CompanyTransaction.fromJson(json))
          .toList();

      setState(() {
        _transactions = transactions;
        _isLoadingTransactions = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingTransactions = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF000000) : Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: CardStyleUtils.getTitleColor(context),
          ),
          onPressed: () {
            HapticUtils.lightImpact();
            Navigator.pop(context);
          },
        ),
        title: Text(
          _fundDetail?.name ?? widget.companyName,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: CardStyleUtils.getTitleColor(context),
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: Theme.of(context).colorScheme.primary,
          backgroundColor: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          strokeWidth: 2.5,
          displacement: 40.0,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: AdaptiveTextUtils.getContentPadding(context),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Заголовок фонда с описанием
                if (_isLoadingFund)
                  _buildLoadingCard()
                else if (_fundDetail != null)
                  _buildFundHeader(_fundDetail!)
                else
                  _buildErrorCard(),

                const SizedBox(height: 16),

                // Карточки с владениями
                if (_fundDetail != null) _buildHoldingsCards(_fundDetail!),

                const SizedBox(height: 16),

                // Детальная информация
                if (_fundDetail != null) _buildFundDetails(_fundDetail!),

                const SizedBox(height: 16),

                // Заголовок транзакций
                Text(
                  'company_details.recent_transactions'.tr(),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: CardStyleUtils.getTitleColor(context),
                  ),
                ),
                const SizedBox(height: 12),

                // Список транзакций
                _buildTransactionsList(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingCard() {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  Widget _buildErrorCard() {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        children: [
          Text(
            'common.error'.tr(),
            style: TextStyle(
              color: Colors.red,
              fontSize: 16,
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(
                color: CardStyleUtils.getSubtitleColor(context),
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadFundDetails,
            child: Text('common.retry'.tr()),
          ),
        ],
      ),
    );
  }

  Widget _buildFundHeader(FundDetail fund) {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (fund.logoUrl != null)
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    color: CardStyleUtils.getNestedCardColor(context),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      fund.logoUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Icon(
                          Icons.account_balance,
                          color: CardStyleUtils.getSubtitleColor(context),
                        );
                      },
                    ),
                  ),
                ),
              if (fund.logoUrl != null) const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fund.name,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: CardStyleUtils.getTitleColor(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${fund.fundType ?? 'ETF'} ${'company_details.fund'.tr()}',
                      style: TextStyle(
                        fontSize: 16,
                        color: CardStyleUtils.getSubtitleColor(context),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (fund.description != null && fund.description!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              fund.description!,
              style: TextStyle(
                fontSize: 15,
                color: CardStyleUtils.getSubtitleColor(context),
                height: 1.5,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHoldingsCards(FundDetail fund) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildHoldingCard(
                'BTC',
                fund.btcHoldingsValue,
                'company_details.btc_holdings'.tr(),
                'company_details.total_btc_assets'.tr(),
                Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildHoldingCard(
                'ETH',
                fund.ethHoldingsValue,
                'company_details.eth_holdings'.tr(),
                'company_details.total_eth_assets'.tr(),
                Colors.blue,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        _buildHoldingCard(
          'TOTAL',
          fund.totalAssetsValue,
          'company_details.total_assets'.tr(),
          'company_details.total_holdings'.tr(),
          Colors.green,
        ),
      ],
    );
  }

  Widget _buildHoldingCard(
    String asset,
    double value,
    String title,
    String subtitle,
    Color color,
  ) {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: CardStyleUtils.getSubtitleColor(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _formatBigIntValue(value),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              color: CardStyleUtils.getSubtitleColor(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFundDetails(FundDetail fund) {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'company_details.detailed_info'.tr(),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: CardStyleUtils.getTitleColor(context),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildKeyMetrics(fund),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildHistoricalData(fund),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKeyMetrics(FundDetail fund) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'company_details.key_metrics'.tr(),
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: CardStyleUtils.getTitleColor(context),
          ),
        ),
        const SizedBox(height: 12),
        _buildDetailRow(
          'company_details.ticker'.tr(),
          fund.ticker ?? fund.fundKey.toUpperCase(),
        ),
        _buildDetailRow(
          'company_details.fund_type'.tr(),
          fund.fundType ?? 'ETF',
        ),
        _buildDetailRow(
          'company_details.category'.tr(),
          'company_details.cryptocurrency'.tr(),
        ),
        _buildDetailRow(
          'company_details.commission'.tr(),
          fund.feePercentage != null
              ? '${fund.feePercentage}%'
              : '0.25%',
        ),
      ],
    );
  }

  Widget _buildHistoricalData(FundDetail fund) {
    final daysSinceLaunch = fund.getDaysSinceLaunch();
    final launchDateStr = fund.launchDate != null
        ? DateFormat('dd.MM.yyyy').format(fund.launchDate!)
        : '11.01.2024';
    final lastUpdateStr = DateFormat('dd.MM.yyyy').format(fund.updatedAt);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'company_details.historical_data'.tr(),
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: CardStyleUtils.getTitleColor(context),
          ),
        ),
        const SizedBox(height: 12),
        _buildDetailRow(
          'company_details.launch_date'.tr(),
          launchDateStr,
        ),
        _buildDetailRow(
          'company_details.days_count'.tr(),
          daysSinceLaunch.toString(),
        ),
        _buildDetailRow(
          'company_details.last_update'.tr(),
          lastUpdateStr,
        ),
        _buildDetailRow(
          'company_details.status'.tr(),
          fund.status == 'active'
              ? 'company_details.active'.tr()
              : fund.status ?? 'company_details.active'.tr(),
          isStatus: true,
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: CardStyleUtils.getSubtitleColor(context),
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isStatus && value.contains('Активный')
                  ? Colors.green
                  : CardStyleUtils.getTitleColor(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionsList() {
    if (_isLoadingTransactions) {
      return Container(
        padding: const EdgeInsets.all(40),
        child: Center(
          child: CircularProgressIndicator(
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
      );
    }

    if (_transactions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(40),
        child: Center(
          child: Text(
            'company_details.no_transactions'.tr(),
            style: TextStyle(
              color: CardStyleUtils.getSubtitleColor(context),
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        children: _transactions.asMap().entries.map((entry) {
          final index = entry.key;
          final transaction = entry.value;
          return Column(
            children: [
              _buildTransactionItem(transaction),
              if (index < _transactions.length - 1) ...[
                const SizedBox(height: 12),
                Divider(
                  height: 1,
                  thickness: 1,
                  color: CardStyleUtils.getDividerColor(context),
                ),
                const SizedBox(height: 12),
              ],
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTransactionItem(CompanyTransaction transaction) {
    final isPositive = transaction.amount > 0;
    final dateTime = DateTime.tryParse(transaction.time);
    final formattedDate = dateTime != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(dateTime)
        : transaction.date;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                transaction.etf,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: CardStyleUtils.getTitleColor(context),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                formattedDate,
                style: TextStyle(
                  fontSize: 12,
                  color: CardStyleUtils.getSubtitleColor(context),
                ),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${isPositive ? '+' : ''}${_formatValue(transaction.amount)}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isPositive ? Colors.green : Colors.red,
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _formatValue(double value) {
    final absValue = value.abs();
    final prefix = value < 0 ? '\$-' : '\$';

    if (absValue >= 1000) {
      return '$prefix${(absValue / 1000).toStringAsFixed(1)}B';
    } else {
      return '$prefix${absValue.toStringAsFixed(1)}M';
    }
  }

  String _formatBigIntValue(double value) {
    if (value >= 1000000000) {
      return '\$${(value / 1000000000).toStringAsFixed(1)}B';
    } else if (value >= 1000000) {
      return '\$${(value / 1000000).toStringAsFixed(1)}M';
    } else if (value >= 1000) {
      return '\$${(value / 1000).toStringAsFixed(1)}K';
    }
    return '\$${value.toStringAsFixed(1)}';
  }
}
