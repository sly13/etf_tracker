import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';

class LoadingScreen extends StatelessWidget {
  final String message;
  final bool showProgress;
  final VoidCallback? onRetry;
  final String? error;
  final bool showDetailedProgress;

  const LoadingScreen({
    super.key,
    this.message = 'Загрузка данных...',
    this.showProgress = true,
    this.onRetry,
    this.error,
    this.showDetailedProgress = false,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Логотип приложения
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.trending_up,
                size: 60,
                color: Colors.white,
              ),
            ),

            const SizedBox(height: 40),

            // Название приложения
            Text(
              'ETF Flow Tracker',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),

            const SizedBox(height: 8),

            // Подзаголовок
            Text(
              'Отслеживание потоков криптовалютных ETF',
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(
                  context,
                ).colorScheme.onSurface.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 40),

            // Показываем ошибку если есть
            if (error != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.symmetric(horizontal: 32),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red, size: 32),
                    const SizedBox(height: 8),
                    Text(
                      error!,
                      style: const TextStyle(color: Colors.red, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Индикатор загрузки или кнопка повтора
            if (showProgress && error == null) ...[
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  Theme.of(context).colorScheme.primary,
                ),
              ),

              const SizedBox(height: 24),

              Text(
                message,
                style: TextStyle(
                  fontSize: 16,
                  color: Theme.of(
                    context,
                  ).colorScheme.onSurface.withValues(alpha: 0.8),
                ),
                textAlign: TextAlign.center,
              ),
            ],

            // Кнопка повтора если есть ошибка
            if (error != null && onRetry != null) ...[
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text('common.retry'.tr()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 40),

            // Детальный прогресс загрузки
            if (showDetailedProgress) ...[
              Consumer<ETFProvider>(
                builder: (context, etfProvider, child) {
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Theme.of(
                          context,
                        ).colorScheme.outline.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Column(
                      children: [
                        _buildLoadingItem(
                          'etf.bitcoin'.tr(),
                          Icons.currency_bitcoin,
                          Colors.orange,
                          etfProvider.isBitcoinLoaded,
                        ),
                        const SizedBox(height: 8),
                        _buildLoadingItem(
                          'etf.ethereum'.tr(),
                          Icons.currency_exchange,
                          Colors.blue,
                          etfProvider.isEthereumLoaded,
                        ),
                        const SizedBox(height: 8),
                        _buildLoadingItem(
                          'loading.summary_data'.tr(),
                          Icons.analytics,
                          Colors.green,
                          etfProvider.isSummaryLoaded,
                        ),
                        const SizedBox(height: 8),
                        _buildLoadingItem(
                          'loading.fund_data'.tr(),
                          Icons.account_balance,
                          Colors.purple,
                          etfProvider.isFundHoldingsLoaded,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ] else ...[
              // Статичная информация о загружаемых данных
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Theme.of(
                      context,
                    ).colorScheme.outline.withValues(alpha: 0.2),
                  ),
                ),
                child: Column(
                  children: [
                    _buildLoadingItem(
                      'Bitcoin ETF',
                      Icons.currency_bitcoin,
                      Colors.orange,
                      false,
                    ),
                    const SizedBox(height: 8),
                    _buildLoadingItem(
                      'Ethereum ETF',
                      Icons.currency_exchange,
                      Colors.blue,
                      false,
                    ),
                    const SizedBox(height: 8),
                    _buildLoadingItem(
                      'Данные фондов',
                      Icons.account_balance,
                      Colors.green,
                      false,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingItem(
    String title,
    IconData icon,
    Color color,
    bool isLoaded,
  ) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 20, color: isLoaded ? Colors.green : color),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 14,
            color: isLoaded ? Colors.green : null,
            fontWeight: isLoaded ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        if (isLoaded) ...[
          const SizedBox(width: 4),
          Icon(Icons.check_circle, size: 16, color: Colors.green),
        ],
      ],
    );
  }
}
