import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/cefi_index.dart';
import '../providers/etf_provider.dart';
import '../services/local_storage_service.dart';
import '../utils/card_style_utils.dart';
import 'universal_cefi_index_card.dart';

class CEFIIndexWidget extends StatefulWidget {
  const CEFIIndexWidget({super.key});

  @override
  State<CEFIIndexWidget> createState() => _CEFIIndexWidgetState();
}

class _CEFIIndexWidgetState extends State<CEFIIndexWidget> {
  final LocalStorageService _storageService = LocalStorageService();
  AllCEFIIndices? _cachedData;

  @override
  void initState() {
    super.initState();
    // Загружаем данные из кэша сразу, как TodayFlowsPanel
    _loadFromCacheImmediately();
    // Затем загружаем с сервера через провайдер, если данных нет в кэше
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ETFProvider>();
      // Загружаем только если данных нет в кэше
      if (!provider.isCEFIIndicesLoaded && _cachedData == null) {
        provider.loadCEFIIndices();
      }
    });
  }

  // Загрузить данные из кэша немедленно
  Future<void> _loadFromCacheImmediately() async {
    try {
      final cachedData = await _storageService.getCEFIIndices();
      if (mounted && cachedData != null) {
        // Логирование данных из кэша для отладки
        debugPrint('🔍 CEFI Index Cache Data:');
        debugPrint('  Composite: ${cachedData.composite.index}');
        debugPrint(
          '  Composite current value: ${cachedData.composite.current.value}',
        );
        debugPrint(
          '  Composite current isNaN: ${cachedData.composite.current.value.isNaN}',
        );
        debugPrint(
          '  Composite current isInfinite: ${cachedData.composite.current.value.isInfinite}',
        );
        debugPrint(
          '  Composite history length: ${cachedData.composite.history.length}',
        );
        debugPrint('  BTC current value: ${cachedData.btc.current.value}');
        debugPrint('  ETH current value: ${cachedData.eth.current.value}');
        debugPrint('  SOL current value: ${cachedData.sol.current.value}');

        setState(() {
          _cachedData = cachedData;
        });
      } else {
        debugPrint('🔍 CEFI Index Cache: данные не найдены');
      }
    } catch (e) {
      debugPrint('Ошибка загрузки кэшированных CEFI индексов: $e');
    }
  }

  void _showInfoDialog() {
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
    return Consumer<ETFProvider>(
      builder: (context, provider, child) {
        // Используем данные из провайдера, если они есть, иначе используем кэшированные
        final data = provider.cefiIndices ?? _cachedData;
        // Показываем скелетон если данных нет или идет обновление (когда isLoading и данные уже есть)
        final isLoading =
            provider.isLoading && (data == null || provider.isDataReady);
        final error = provider.error;

        // Показываем скелетон при обновлении или если данных нет
        if (data == null || (provider.isLoading && provider.isDataReady)) {
          return _buildIndexCardWithLoading(
            isLoading: isLoading,
            error: error,
            onRetry: () => provider.loadCEFIIndices(),
          );
        }

        // Показываем данные сразу из кэша или провайдера
        // Только Composite индекс на главной странице
        return UniversalCEFIIndexCard(
          indexData: data.composite,
          title: 'CEFI-Composite',
          icon: Icons.dashboard,
          iconColor: Colors.blue,
          indexType: 'composite',
        );
      },
    );
  }

  // Скелетон для gauge
  Widget _buildGaugeSkeleton({
    required bool isLoading,
    String? error,
    VoidCallback? onRetry,
    required double screenWidth,
    required bool isSmallScreen,
  }) {
    final gaugeHeight = (screenWidth * 0.9).clamp(80.0, 130.0);

    if (error != null) {
      return SizedBox(
        height: gaugeHeight,
        child: Stack(
          children: [
            // Gauge структура (без указателя)
            SfRadialGauge(
              axes: <RadialAxis>[
                RadialAxis(
                  minimum: 0,
                  maximum: 100,
                  // Гарантируем, что диапазон валиден (min != max)
                  interval:
                      20, // Явно задаем интервал для предотвращения проблем
                  showLabels: false,
                  showTicks: false,
                  startAngle: 180,
                  endAngle: 0,
                  axisLineStyle: AxisLineStyle(
                    thickness: isSmallScreen ? 10 : 12,
                    thicknessUnit: GaugeSizeUnit.logicalPixel,
                    color: Colors.transparent,
                  ),
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
                ),
              ],
            ),
            // Ошибка в центре
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline, color: Colors.red, size: 24),
                  const SizedBox(height: 4),
                  Text(
                    'common.error'.tr(),
                    style: TextStyle(color: Colors.red, fontSize: 10),
                  ),
                  const SizedBox(height: 4),
                  TextButton(
                    onPressed: onRetry,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'common.retry'.tr(),
                      style: const TextStyle(fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Скелетон для загрузки
    return SizedBox(
      height: gaugeHeight,
      child: Stack(
        children: [
          // Gauge структура (без указателя)
          SfRadialGauge(
            axes: <RadialAxis>[
              RadialAxis(
                minimum: 0,
                maximum: 100,
                showLabels: false,
                showTicks: false,
                startAngle: 180,
                endAngle: 0,
                axisLineStyle: AxisLineStyle(
                  thickness: isSmallScreen ? 10 : 12,
                  thicknessUnit: GaugeSizeUnit.logicalPixel,
                  color: Colors.transparent,
                ),
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
              ),
            ],
          ),
          // Скелетон в центре
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Скелетон для числа
                Container(
                  width: isSmallScreen ? 30 : 40,
                  height: isSmallScreen ? 20 : 28,
                  decoration: BoxDecoration(
                    color: CardStyleUtils.getSubtitleColor(
                      context,
                    ).withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 6),
                // Скелетон для текста
                Container(
                  width: isSmallScreen ? 60 : 80,
                  height: isSmallScreen ? 10 : 12,
                  decoration: BoxDecoration(
                    color: CardStyleUtils.getSubtitleColor(
                      context,
                    ).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Блок с лоадером или ошибкой
  Widget _buildIndexCardWithLoading({
    required bool isLoading,
    String? error,
    VoidCallback? onRetry,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 400;
    final padding = isSmallScreen ? 12.0 : 16.0;
    final iconSize = isSmallScreen ? 28.0 : 32.0;
    final iconInnerSize = isSmallScreen ? 16.0 : 18.0;
    final titleFontSize = isSmallScreen ? 14.0 : 16.0;
    final spacing = isSmallScreen ? 8.0 : 12.0;

    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: EdgeInsets.all(padding),
      child: Column(
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
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.dashboard,
                  color: Colors.white,
                  size: iconInnerSize,
                ),
              ),
              SizedBox(width: spacing),
              Expanded(
                child: Text(
                  'CEFI-Composite',
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
                  _showInfoDialog();
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
              Icon(
                Icons.arrow_forward_ios,
                size: 14,
                color: CardStyleUtils.getSubtitleColor(context),
              ),
            ],
          ),
          SizedBox(height: spacing),
          // Показываем скелетон gauge или ошибку
          _buildGaugeSkeleton(
            isLoading: isLoading,
            error: error,
            onRetry: onRetry,
            screenWidth: screenWidth,
            isSmallScreen: isSmallScreen,
          ),
        ],
      ),
    );
  }
}
