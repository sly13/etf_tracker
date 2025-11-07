import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import '../widgets/dark_flow_chart.dart';
import '../widgets/solana_flow_card.dart';
import '../components/flow_calendar.dart';
import '../utils/adaptive_text_utils.dart';
import '../widgets/premium_chart_overlay.dart';

class SolanaETFScreen extends StatefulWidget {
  const SolanaETFScreen({super.key});

  @override
  State<SolanaETFScreen> createState() => _SolanaETFScreenState();
}

class _SolanaETFScreenState extends State<SolanaETFScreen> {
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
            await etfProvider.loadSolanaData();
          },
          child: CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.only(
                    left: AdaptiveTextUtils.getContentPadding(context).left,
                    right: AdaptiveTextUtils.getContentPadding(context).right,
                    top: 28, // Уменьшенный верхний отступ после табов
                    bottom: AdaptiveTextUtils.getContentPadding(context).bottom,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (etfProvider.solanaData.isNotEmpty)
                        SolanaFlowCard(
                          flowData: etfProvider.solanaData.first,
                          onTap: () {
                            _scrollController.animateTo(
                              0,
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.easeInOut,
                            );
                          },
                        ),
                      const SizedBox(height: 20),
                      _buildChartSection(etfProvider.solanaData),
                      const SizedBox(height: 20),
                      FlowCalendar(
                        flowData: etfProvider.solanaData,
                        title: 'etf.flow_history'.tr(),
                      ),
                      const SizedBox(height: 100),
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

  Widget _buildChartSection(List<ETFFlowData> data) {
    return PremiumChartOverlay(
      title: 'premium.charts.title'.tr(),
      description: 'premium.charts.description'.tr(),
      lockedHeight: 200,
      child: SizedBox(
        height: 420,
        child: DarkFlowChart(flowData: data, title: 'Solana ETF Flows'),
      ),
    );
  }
}
