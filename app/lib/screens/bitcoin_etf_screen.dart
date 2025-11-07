import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import '../widgets/dark_flow_chart.dart';
import '../widgets/bitcoin_flow_card.dart';
import '../components/flow_calendar.dart';
import '../utils/haptic_feedback.dart';
import '../utils/adaptive_text_utils.dart';
import '../widgets/premium_chart_overlay.dart';

class BitcoinETFScreen extends StatefulWidget {
  const BitcoinETFScreen({super.key});

  @override
  State<BitcoinETFScreen> createState() => _BitcoinETFScreenState();
}

class _BitcoinETFScreenState extends State<BitcoinETFScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Data is loaded only during app initialization, not here
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ETFProvider>(
      builder: (context, etfProvider, child) {
        // Показываем ошибку только если она есть
        if (etfProvider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${'common.error'.tr()}: ${etfProvider.error}',
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    etfProvider.clearError();
                    etfProvider.loadBitcoinData();
                  },
                  child: Text('common.retry'.tr()),
                ),
              ],
            ),
          );
        }

        if (etfProvider.bitcoinData.isEmpty) {
          return Center(
            child: Text(
              'common.no_data'.tr(),
              style: const TextStyle(fontSize: 18),
            ),
          );
        }

        // Показываем индикатор загрузки во время обновления данных
        if (etfProvider.isLoading && etfProvider.isBitcoinLoaded) {
          return Stack(
            children: [
              // Основной контент
              RefreshIndicator(
                onRefresh: () async {
                  // Вибрация при начале обновления
                  HapticUtils.lightImpact();
                  try {
                    await etfProvider.loadBitcoinData();
                    // Автоматически скроллим вниз после обновления
                    if (_scrollController.hasClients) {
                      _scrollController.animateTo(
                        _scrollController.position.maxScrollExtent,
                        duration: Duration(milliseconds: 500),
                        curve: Curves.easeOut,
                      );
                    }
                    // Вибрация при успешном обновлении
                    HapticUtils.notificationSuccess();
                  } catch (e) {
                    // Вибрация при ошибке
                    HapticUtils.notificationError();
                    rethrow;
                  }
                },
                color: Theme.of(context).colorScheme.primary,
                backgroundColor: Theme.of(context).brightness == Brightness.dark
                    ? const Color(0xFF1C1C1E)
                    : Colors.white,
                strokeWidth: 2.5,
                displacement: 40.0,
                child: SingleChildScrollView(
                  controller: _scrollController,
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.only(
                    left: AdaptiveTextUtils.getContentPadding(context).left,
                    right: AdaptiveTextUtils.getContentPadding(context).right,
                    top: 28, // Уменьшенный верхний отступ после табов
                    bottom: AdaptiveTextUtils.getContentPadding(context).bottom,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Заголовок и общая статистика
                      BitcoinFlowCard(
                        flowData: etfProvider.bitcoinData.first,
                        onTap: () {
                          // Можно добавить дополнительную логику при нажатии
                        },
                      ),
                      const SizedBox(height: 20),

                      // График потоков
                      _buildChartSection(etfProvider.bitcoinData),
                      const SizedBox(height: 20),

                      // Календарь с данными
                      FlowCalendar(
                        flowData: etfProvider.bitcoinData,
                        title: 'etf.flow_history'.tr(),
                      ),

                      // Добавляем дополнительное пространство для лучшего UX при pull-to-refresh
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
              // Индикатор загрузки поверх контента
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: SizedBox(
                  width: double.infinity,
                  height: 3,
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 300),
                    width: double.infinity,
                    height: 3,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,
                      borderRadius: BorderRadius.circular(1.5),
                    ),
                  ),
                ),
              ),
            ],
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            // Вибрация при начале обновления
            HapticUtils.lightImpact();

            try {
              await etfProvider.loadBitcoinData();
              // Автоматически скроллим вниз после обновления
              if (_scrollController.hasClients) {
                _scrollController.animateTo(
                  _scrollController.position.maxScrollExtent,
                  duration: Duration(milliseconds: 500),
                  curve: Curves.easeOut,
                );
              }
              // Вибрация при успешном обновлении
              HapticUtils.notificationSuccess();
            } catch (e) {
              // Вибрация при ошибке
              HapticUtils.notificationError();
              rethrow;
            }
          },
          color: Theme.of(context).colorScheme.primary,
          backgroundColor: Theme.of(context).brightness == Brightness.dark
              ? const Color(0xFF1C1C1E)
              : Colors.grey[50],
          strokeWidth: 2.5,
          displacement: 40.0,
          child: SingleChildScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.only(
              left: AdaptiveTextUtils.getContentPadding(context).left,
              right: AdaptiveTextUtils.getContentPadding(context).right,
              top: 28, // Уменьшенный верхний отступ после табов
              bottom: AdaptiveTextUtils.getContentPadding(context).bottom,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Заголовок и общая статистика
                BitcoinFlowCard(
                  flowData: etfProvider.bitcoinData.first,
                  onTap: () {
                    // Можно добавить дополнительную логику при нажатии
                  },
                ),
                const SizedBox(height: 20),

                // График потоков
                _buildChartSection(etfProvider.bitcoinData),
                const SizedBox(height: 20),

                // Календарь с данными
                FlowCalendar(
                  flowData: etfProvider.bitcoinData,
                  title: 'etf.flow_history'.tr(),
                ),

                // Добавляем дополнительное пространство для лучшего UX при pull-to-refresh
                const SizedBox(height: 100),
              ],
            ),
          ),
        );
      },
    );
  }

  // Секция с графиком
  Widget _buildChartSection(List<BTCFlowData> data) {
    return PremiumChartOverlay(
      title: 'premium.charts.title'.tr(),
      description: 'premium.charts.description'.tr(),
      lockedHeight: 200, // Уменьшена высота для заблокированного контента
      child: SizedBox(
        height: 420, // Полная высота для всех пользователей
        child: DarkFlowChart(flowData: data, title: 'etf.bitcoin_flows'.tr()),
      ),
    );
  }
}
