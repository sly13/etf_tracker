import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import '../widgets/ethereum_flow_card.dart';
import '../widgets/dark_flow_chart.dart';
import '../components/flow_calendar.dart';
import '../utils/adaptive_text_utils.dart';
import '../widgets/premium_chart_overlay.dart';
import '../widgets/single_cefi_index_widget.dart';

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
        return RefreshIndicator(
          onRefresh: () async {
            // await etfProvider.fetchEthereumData();
          },
          child: CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.only(
                    left: AdaptiveTextUtils.getContentPadding(context).left,
                    right: AdaptiveTextUtils.getContentPadding(context).right,
                    top: 28, // Уменьшенный верхний отступ после табов
                  ),
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

                      const SizedBox(height: 20),

                      // CEFI-ETH индекс перед графиком
                      SingleCEFIIndexWidget(
                        indexType: 'eth',
                        title: 'CEFI-ETH',
                        icon: Icons.hexagon,
                        iconColor: Colors.blue,
                      ),
                      const SizedBox(height: 20),

                      // График потоков
                      _buildChartSection(etfProvider.ethereumData),
                      const SizedBox(height: 20),

                      // Список данных по дням
                      FlowCalendar(
                        flowData: etfProvider.ethereumData,
                        title: 'etf.flow_history'.tr(),
                      ),
                      const SizedBox(height: 16), // Небольшой отступ снизу
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // Секция с графиком
  Widget _buildChartSection(List<ETFFlowData> data) {
    return PremiumChartOverlay(
      title: 'premium.charts.title'.tr(),
      description: 'premium.charts.description'.tr(),
      lockedHeight: 200, // Уменьшена высота для заблокированного контента
      child: SizedBox(
        height: 420, // Полная высота для всех пользователей
        child: DarkFlowChart(flowData: data, title: 'etf.ethereum_flows'.tr()),
      ),
    );
  }

  // Удален неиспользуемый метод _buildDataList

  // Удалены неиспользуемые методы
}
