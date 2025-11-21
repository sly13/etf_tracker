import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/cefi_index.dart';
import '../utils/card_style_utils.dart';
import '../screens/cefi_index_detail_screen.dart';

/// Универсальный виджет карточки CEFI индекса
/// Может использоваться для любого индекса (Composite, BTC, ETH, SOL)
class UniversalCEFIIndexCard extends StatelessWidget {
  final CEFIIndexResponse indexData;
  final String title;
  final IconData icon;
  final Color iconColor;
  final String indexType; // 'btc', 'eth', 'sol', 'composite'
  final bool disableNavigation; // Отключить переход на детальную страницу
  final bool hideArrow; // Скрыть стрелку открытия

  const UniversalCEFIIndexCard({
    super.key,
    required this.indexData,
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.indexType,
    this.disableNavigation = false,
    this.hideArrow = false,
  });

  String _formatNumber(double num) {
    // Если число целое, показываем без дробной части
    if (num == num.roundToDouble()) {
      return num.round().toString();
    }
    // Иначе показываем с 2 знаками после запятой
    return num.toStringAsFixed(2);
  }

  String _getSentimentLabel(double value) {
    if (value >= 80) return 'cefi.sentiment.extreme_greed'.tr();
    if (value >= 60) return 'cefi.sentiment.greed'.tr();
    if (value >= 40) return 'cefi.sentiment.neutral'.tr();
    if (value >= 20) return 'cefi.sentiment.fear'.tr();
    return 'cefi.sentiment.extreme_fear'.tr();
  }

  // Цвета соответствуют зонам индекса
  Color _getSentimentColor(double value) {
    if (value >= 80)
      return const Color(0xFF16a34a); // Extreme Greed - темно-зеленый
    if (value >= 60) return const Color(0xFF22c55e); // Greed - зеленый
    if (value >= 40) return const Color(0xFFeab308); // Neutral - желтый
    if (value >= 20) return const Color(0xFFf97316); // Fear - оранжевый
    return const Color(0xFFdc2626); // Extreme Fear - красный
  }

  void _showInfoDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          title: Text(
            'cefi.dialog.title'.tr(),
            style: TextStyle(
              color: CardStyleUtils.getTitleColor(context),
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          content: Text(
            'cefi.dialog.description'.tr(),
            style: TextStyle(
              color: CardStyleUtils.getSubtitleColor(context),
              fontSize: 14,
              height: 1.5,
            ),
            textAlign: TextAlign.left,
          ),
          contentPadding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
          actions: [
            Center(
              child: TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(
                  'common.ok'.tr(),
                  style: TextStyle(
                    color: CardStyleUtils.getTitleColor(context),
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
          actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    // Проверка на валидность данных
    final rawValue = indexData.current.value;

    debugPrint('🔍 Universal CEFI Index Card for $title:');
    debugPrint('  Raw value: $rawValue');
    debugPrint('  isNaN: ${rawValue.isNaN}');
    debugPrint('  isInfinite: ${rawValue.isInfinite}');

    // Если значение некорректное, используем значение по умолчанию 10
    final value = (rawValue.isNaN ||
            rawValue.isInfinite ||
            rawValue < 0 ||
            rawValue > 100)
        ? 10.0
        : rawValue.clamp(0.0, 100.0);

    // Дополнительная проверка для gauge: гарантируем, что значение в допустимом диапазоне
    // Syncfusion требует, чтобы значение было строго в пределах (minimum, maximum)
    // Если значение равно 0 или 100, используем безопасные значения внутри диапазона
    final safeValue = value == 0.0 
        ? 0.5  // Если значение 0, используем 0.5 для безопасного отображения
        : (value == 100.0 ? 99.5 : value); // Если значение 100, используем 99.5

    debugPrint('  Clamped value: $value');
    debugPrint('  Safe value for gauge: $safeValue');

    // Адаптивные размеры в зависимости от размера экрана
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 400;
    final padding = isSmallScreen ? 12.0 : 16.0;
    final iconSize = isSmallScreen ? 28.0 : 32.0;
    final iconInnerSize = isSmallScreen ? 16.0 : 18.0;
    final titleFontSize = isSmallScreen ? 14.0 : 16.0;
    final valueFontSize = isSmallScreen ? 20.0 : 24.0;
    final spacing = isSmallScreen ? 8.0 : 12.0;

    return InkWell(
      onTap: disableNavigation
          ? null
          : () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) =>
                      CEFIIndexDetailScreen(indexType: indexType),
                ),
              );
            },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: CardStyleUtils.getCardDecoration(context),
        padding: EdgeInsets.all(padding),
        child: LayoutBuilder(
          builder: (context, constraints) {
            // Вычисляем адаптивную высоту gauge на основе ширины карточки
            final cardWidth = constraints.maxWidth;
            final gaugeHeight = (cardWidth * 0.9).clamp(80.0, 130.0);

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: iconSize,
                      height: iconSize,
                      decoration: BoxDecoration(
                        color: iconColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        icon,
                        color: Colors.white,
                        size: iconInnerSize,
                      ),
                    ),
                    SizedBox(width: spacing),
                    Expanded(
                      child: Text(
                        title,
                        style: TextStyle(
                          fontSize: titleFontSize,
                          fontWeight: FontWeight.w600,
                          color: CardStyleUtils.getTitleColor(context),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        _showInfoDialog(context);
                      },
                      behavior: HitTestBehavior.opaque,
                      child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: Icon(
                          Icons.info_outline,
                          size: 18,
                          color: CardStyleUtils.getSubtitleColor(context),
                        ),
                      ),
                    ),
                    if (!hideArrow)
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: CardStyleUtils.getSubtitleColor(context),
                      ),
                  ],
                ),
                SizedBox(height: spacing),
                // Gauge с белым кружком-индикатором
                SizedBox(
                  height: gaugeHeight,
                  child: Stack(
                    children: [
                      SfRadialGauge(
                        axes: <RadialAxis>[
                          RadialAxis(
                            minimum: 0,
                            maximum: 100,
                            // Гарантируем, что диапазон валиден (min != max)
                            interval: 20, // Явно задаем интервал для предотвращения проблем
                            showLabels: false,
                            showTicks: false,
                            startAngle: 180,
                            endAngle: 0,
                            axisLineStyle: AxisLineStyle(
                              thickness: isSmallScreen ? 10 : 12,
                              thicknessUnit: GaugeSizeUnit.logicalPixel,
                              color: Colors.transparent,
                            ),
                            // Гарантируем, что ranges не пустой
                            ranges: <GaugeRange>[
                              GaugeRange(
                                startValue: 0,
                                endValue: 20,
                                color: const Color(0xFFdc2626),
                                startWidth: isSmallScreen ? 10 : 12,
                                endWidth: isSmallScreen ? 10 : 12,
                                sizeUnit: GaugeSizeUnit.logicalPixel,
                              ),
                              GaugeRange(
                                startValue: 20,
                                endValue: 40,
                                color: const Color(0xFFf97316),
                                startWidth: isSmallScreen ? 10 : 12,
                                endWidth: isSmallScreen ? 10 : 12,
                                sizeUnit: GaugeSizeUnit.logicalPixel,
                              ),
                              GaugeRange(
                                startValue: 40,
                                endValue: 60,
                                color: const Color(0xFFeab308),
                                startWidth: isSmallScreen ? 10 : 12,
                                endWidth: isSmallScreen ? 10 : 12,
                                sizeUnit: GaugeSizeUnit.logicalPixel,
                              ),
                              GaugeRange(
                                startValue: 60,
                                endValue: 80,
                                color: const Color(0xFF22c55e),
                                startWidth: isSmallScreen ? 10 : 12,
                                endWidth: isSmallScreen ? 10 : 12,
                                sizeUnit: GaugeSizeUnit.logicalPixel,
                              ),
                              GaugeRange(
                                startValue: 80,
                                endValue: 100,
                                color: const Color(0xFF16a34a),
                                startWidth: isSmallScreen ? 10 : 12,
                                endWidth: isSmallScreen ? 10 : 12,
                                sizeUnit: GaugeSizeUnit.logicalPixel,
                              ),
                            ],
                            // Гарантируем, что pointers не пустой и значение валидно
                            // Значение должно быть строго в пределах (0, 100)
                            pointers: safeValue > 0 &&
                                    safeValue < 100 &&
                                    !safeValue.isNaN &&
                                    !safeValue.isInfinite
                                ? <GaugePointer>[
                                    // Белый кружок-индикатор вместо стрелки
                                    MarkerPointer(
                                      value: safeValue,
                                      markerType: MarkerType.circle,
                                      markerHeight: isSmallScreen ? 12 : 14,
                                      markerWidth: isSmallScreen ? 12 : 14,
                                      color: Colors.white,
                                      enableAnimation: true,
                                      animationDuration: 1000,
                                      animationType: AnimationType.ease,
                                    ),
                                  ]
                                : <GaugePointer>[], // Пустой список, если значение некорректно
                          ),
                        ],
                      ),
                      // Значение и текст состояния в центре
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _formatNumber(value),
                              style: TextStyle(
                                fontSize: valueFontSize + 4,
                                fontWeight: FontWeight.bold,
                                color: _getSentimentColor(value),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _getSentimentLabel(value),
                              style: TextStyle(
                                fontSize: isSmallScreen ? 10 : 12,
                                fontWeight: FontWeight.w500,
                                color: _getSentimentColor(value),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: spacing),
              ],
            );
          },
        ),
      ),
    );
  }
}

