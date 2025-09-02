import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';

class DetailedInfoScreen extends StatefulWidget {
  const DetailedInfoScreen({super.key});

  @override
  State<DetailedInfoScreen> createState() => _DetailedInfoScreenState();
}

class _DetailedInfoScreenState extends State<DetailedInfoScreen> {
  @override
  void initState() {
    super.initState();
    // Убираем автоматическую загрузку данных, так как они уже загружаются при инициализации приложения
    // WidgetsBinding.instance.addPostFrameCallback((_) {
    //   context.read<ETFProvider>().loadAllData();
    // });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('detailed_info.title'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().loadAllData();
            },
          ),
        ],
      ),
      body: Consumer<ETFProvider>(
        builder: (context, etfProvider, child) {
          // Показываем ошибку только если она есть
          if (etfProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Ошибка: ${etfProvider.error}',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      etfProvider.clearError();
                      etfProvider.loadAllData();
                    },
                    child: Text('common.retry'.tr()),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.loadAllData(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Заголовок
                  _buildHeader(),
                  const SizedBox(height: 24),

                  // Карточки навигации
                  _buildNavigationCards(context),
                  const SizedBox(height: 24),

                  // Дополнительная информация
                  _buildAdditionalInfo(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Заголовок экрана
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.analytics,
              color: Theme.of(context).colorScheme.primary,
              size: 32,
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Text(
                'Детальная информация по ETF',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          'Выберите тип ETF для просмотра подробной информации о потоках, графиках и истории данных',
          style: TextStyle(fontSize: 16, color: Colors.grey[600], height: 1.4),
        ),
      ],
    );
  }

  // Карточки навигации
  Widget _buildNavigationCards(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'detailed_info.choose_etf'.tr(),
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(
              child: _buildNavigationCard(
                context,
                'etf.ethereum'.tr(),
                'detailed_info.ethereum_etf_info'.tr(),
                Icons.currency_exchange,
                Colors.blue,
                () => Navigator.pushNamed(context, '/ethereum-etf'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildNavigationCard(
                context,
                'etf.bitcoin'.tr(),
                'detailed_info.bitcoin_etf_info'.tr(),
                Icons.currency_bitcoin,
                Colors.orange,
                () => Navigator.pushNamed(context, '/bitcoin-etf'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Карточка навигации
  Widget _buildNavigationCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(
              colors: [color.withOpacity(0.05), color.withOpacity(0.1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: color.withOpacity(0.3), width: 2),
                ),
                child: Icon(icon, color: color, size: 40),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  height: 1.3,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'common.open'.tr(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Дополнительная информация
  Widget _buildAdditionalInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'detailed_info.what_you_find'.tr(),
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),

        _buildInfoItem(
          Icons.show_chart,
          'detailed_info.flow_charts'.tr(),
          'detailed_info.flow_charts_desc'.tr(),
          Colors.green,
        ),
        const SizedBox(height: 12),

        _buildInfoItem(
          Icons.history,
          'detailed_info.data_history'.tr(),
          'detailed_info.data_history_desc'.tr(),
          Colors.blue,
        ),
        const SizedBox(height: 12),

        _buildInfoItem(
          Icons.analytics,
          'detailed_info.analytics'.tr(),
          'detailed_info.analytics_desc'.tr(),
          Colors.orange,
        ),
      ],
    );
  }

  // Элемент информации
  Widget _buildInfoItem(
    IconData icon,
    String title,
    String description,
    Color color,
  ) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
