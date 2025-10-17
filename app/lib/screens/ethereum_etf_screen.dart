import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import '../widgets/ethereum_flow_card.dart';
import '../widgets/pro_button.dart';
import '../widgets/premium_chart_overlay.dart';
import '../widgets/dark_flow_chart.dart';
import '../components/flow_calendar.dart';

class EthereumETFScreen extends StatefulWidget {
  const EthereumETFScreen({super.key});

  @override
  State<EthereumETFScreen> createState() => _EthereumETFScreenState();
}

class _EthereumETFScreenState extends State<EthereumETFScreen> {
  // Удалены неиспользуемые поля
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ETFProvider>(
      builder: (context, etfProvider, child) {
        return Scaffold(
          appBar: AppBar(
            title: Text('etf.ethereum'.tr()),
            backgroundColor: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF0A0A0A)
                : Theme.of(context).colorScheme.primary,
            foregroundColor: Colors.white,
            automaticallyImplyLeading: false, // Скрываем кнопку "назад"
            actions: [
              // Блок Pro
              const ProButton(),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              // await etfProvider.fetchEthereumData();
            },
            child: CustomScrollView(
              controller: _scrollController,
              slivers: [
                // Content
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Карточка с последними данными
                        if (etfProvider.ethereumData.isNotEmpty)
                          EthereumFlowCard(
                            flowData: etfProvider.ethereumData.first,
                            onTap: () {
                              _scrollController.animateTo(
                                0,
                                duration: const Duration(milliseconds: 500),
                                curve: Curves.easeInOut,
                              );
                            },
                          ),

                        const SizedBox(height: 24),

                        // График потоков
                        _buildChartSection(etfProvider.ethereumData),
                        const SizedBox(height: 24),

                        // Список данных по дням
                        FlowCalendar(
                          flowData: etfProvider.ethereumData,
                          title: 'etf.flow_history'.tr(),
                        ),

                        // Добавляем дополнительное пространство для лучшего UX при pull-to-refresh
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Секция с графиком
  Widget _buildChartSection(List<ETFFlowData> data) {
    return PremiumChartOverlay(
      title: 'premium.ethereum_charts_title'.tr(),
      description: 'premium.ethereum_charts_desc'.tr(),
      lockedHeight: 200, // Высота для заблокированного контента
      child: SizedBox(
        height: 420, // Полная высота для разблокированного контента
        child: DarkFlowChart(flowData: data, title: 'etf.ethereum_flows'.tr()),
      ),
    );
  }

  // Удален неиспользуемый метод _buildDataList

  // Удалены неиспользуемые методы
}
