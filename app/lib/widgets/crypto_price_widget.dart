import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/crypto_price_provider.dart';

class CryptoPriceWidget extends StatefulWidget {
  final bool showRefreshButton;
  final bool showLastUpdateTime;
  final EdgeInsets? padding;
  final double? borderRadius;

  const CryptoPriceWidget({
    Key? key,
    this.showRefreshButton = true,
    this.showLastUpdateTime = true,
    this.padding,
    this.borderRadius,
  }) : super(key: key);

  @override
  State<CryptoPriceWidget> createState() => _CryptoPriceWidgetState();
}

class _CryptoPriceWidgetState extends State<CryptoPriceWidget> {
  @override
  void initState() {
    super.initState();
    // Инициализируем провайдер при создании виджета
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CryptoPriceProvider>().initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CryptoPriceProvider>(
      builder: (context, cryptoProvider, child) {
        return Card(
          margin: widget.padding ?? const EdgeInsets.all(16.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(widget.borderRadius ?? 12.0),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Заголовок с кнопкой обновления
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'crypto.prices'.tr(),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (widget.showRefreshButton)
                      IconButton(
                        onPressed: cryptoProvider.isLoading
                            ? null
                            : () => cryptoProvider.refreshPrices(),
                        icon: cryptoProvider.isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.refresh),
                        tooltip: 'etf.refresh'.tr(),
                      ),
                  ],
                ),

                const SizedBox(height: 16),

                // Содержимое
                if (cryptoProvider.hasError)
                  _buildErrorWidget(cryptoProvider)
                else if (cryptoProvider.isLoading && !cryptoProvider.hasData)
                  _buildLoadingWidget()
                else
                  _buildPriceContent(cryptoProvider),

                // Время последнего обновления
                if (widget.showLastUpdateTime && cryptoProvider.hasData)
                  _buildLastUpdateTime(cryptoProvider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorWidget(CryptoPriceProvider provider) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.red),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              provider.error ?? 'common.error'.tr(),
              style: const TextStyle(color: Colors.red),
            ),
          ),
          TextButton(
            onPressed: () => provider.loadPrices(),
            child: Text('common.retry'.tr()),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingWidget() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(20.0),
        child: CircularProgressIndicator(),
      ),
    );
  }

  Widget _buildPriceContent(CryptoPriceProvider provider) {
    return Column(
      children: [
        // Ethereum цена
        _buildPriceRow(
          'Ethereum (ETH)',
          provider.ethereumPrice,
          Colors.blue,
          Icons.currency_bitcoin,
        ),

        const SizedBox(height: 12),

        // Bitcoin цена
        _buildPriceRow(
          'Bitcoin (BTC)',
          provider.bitcoinPrice,
          Colors.orange,
          Icons.currency_bitcoin,
        ),
      ],
    );
  }

  Widget _buildPriceRow(
    String title,
    double? price,
    Color color,
    IconData icon,
  ) {
    return Consumer<CryptoPriceProvider>(
      builder: (context, cryptoProvider, child) {
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      cryptoProvider.formatPrice(price),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLastUpdateTime(CryptoPriceProvider provider) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(
            'Обновлено: ${provider.formatLastUpdateTime()}',
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}

// Компактный виджет для отображения только цен
class CompactCryptoPriceWidget extends StatelessWidget {
  const CompactCryptoPriceWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<CryptoPriceProvider>(
      builder: (context, cryptoProvider, child) {
        if (cryptoProvider.hasError) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 12.0,
            ),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.red.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, color: Colors.red, size: 16),
                const SizedBox(width: 8),
                Text(
                  'Ошибка загрузки цен',
                  style: TextStyle(fontSize: 12, color: Colors.red),
                ),
              ],
            ),
          );
        }

        if (!cryptoProvider.hasData) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 12.0,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).brightness == Brightness.dark
                  ? const Color(0xFF2A2A2A)
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.grey.shade700
                    : Colors.grey.shade300,
                width: 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Загрузка цен...',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.grey.shade400
                        : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          );
        }

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF2A2A2A)
                : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.grey.shade700
                  : Colors.grey.shade300,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Ethereum
              Expanded(
                child: _buildCompactPriceItem(
                  'ETH',
                  cryptoProvider.ethereumPrice,
                  Colors.blue,
                ),
              ),

              const SizedBox(width: 12),

              // Bitcoin
              Expanded(
                child: _buildCompactPriceItem(
                  'BTC',
                  cryptoProvider.bitcoinPrice,
                  Colors.orange,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCompactPriceItem(String symbol, double? price, Color color) {
    // Выбираем иконку в зависимости от символа
    IconData icon;
    if (symbol == 'ETH') {
      icon = Icons.currency_exchange; // Иконка для Ethereum
    } else {
      icon = Icons.currency_bitcoin; // Иконка для Bitcoin
    }

    // Форматируем цену красиво с разделителями тысяч
    String formattedPrice;
    if (price != null) {
      // Добавляем разделители тысяч
      String priceStr = price.toStringAsFixed(0);
      final RegExp reg = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
      priceStr = priceStr.replaceAllMapped(
        reg,
        (Match match) => '${match[1]},',
      );
      formattedPrice = '\$$priceStr';
    } else {
      formattedPrice = 'N/A';
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 8),
          Text(
            formattedPrice,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
