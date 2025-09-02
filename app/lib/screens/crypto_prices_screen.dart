import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/crypto_price_provider.dart';
import '../widgets/crypto_price_widget.dart';

class CryptoPricesScreen extends StatefulWidget {
  const CryptoPricesScreen({Key? key}) : super(key: key);

  @override
  State<CryptoPricesScreen> createState() => _CryptoPricesScreenState();
}

class _CryptoPricesScreenState extends State<CryptoPricesScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('crypto.prices'.tr()),
        actions: [
          Consumer<CryptoPriceProvider>(
            builder: (context, cryptoProvider, child) {
              return IconButton(
                onPressed: cryptoProvider.isLoading
                    ? null
                    : () => cryptoProvider.refreshPrices(),
                icon: cryptoProvider.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : const Icon(Icons.refresh),
                tooltip: 'Обновить цены',
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<CryptoPriceProvider>().refreshPrices();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              // Основной виджет с ценами
              const CryptoPriceWidget(
                showRefreshButton:
                    false, // Убираем кнопку, так как она есть в AppBar
                showLastUpdateTime: true,
              ),

              // Дополнительная информация
              _buildAdditionalInfo(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAdditionalInfo() {
    return Consumer<CryptoPriceProvider>(
      builder: (context, cryptoProvider, child) {
        if (!cryptoProvider.hasData) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'crypto.additional_info'.tr(),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              // Статистика
              _buildInfoCard('crypto.statistics'.tr(), [
                _buildInfoRow('Ethereum', cryptoProvider.ethereumPrice),
                _buildInfoRow('Bitcoin', cryptoProvider.bitcoinPrice),
              ]),

              const SizedBox(height: 16),

              // Информация об обновлениях
              _buildInfoCard('crypto.updates'.tr(), [
                _buildInfoRow(
                  'crypto.last_update'.tr(),
                  null,
                  value: Future.value(cryptoProvider.formatLastUpdateTime()),
                ),
                _buildInfoRow(
                  'crypto.needs_update'.tr(),
                  null,
                  value: cryptoProvider.shouldUpdatePrices().then(
                    (value) => value ? 'crypto.yes'.tr() : 'crypto.no'.tr(),
                  ),
                ),
              ]),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, double? price, {Future<String>? value}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, color: Colors.grey)),
          if (price != null)
            Text(
              '\$${price.toStringAsFixed(2)}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            )
          else if (value != null)
            FutureBuilder<String>(
              future: value,
              builder: (context, snapshot) {
                return Text(
                  snapshot.data ?? 'crypto.loading'.tr(),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
