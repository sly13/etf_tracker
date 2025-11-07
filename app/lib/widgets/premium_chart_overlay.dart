import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../screens/subscription_selection_screen.dart';
import '../providers/subscription_provider.dart';
import 'package:provider/provider.dart';
import '../utils/card_style_utils.dart';

class PremiumChartOverlay extends StatelessWidget {
  final Widget child;
  final String title;
  final String description;
  final VoidCallback? onSubscribe;
  final double? lockedHeight;

  const PremiumChartOverlay({
    super.key,
    required this.child,
    required this.title,
    required this.description,
    this.onSubscribe,
    this.lockedHeight,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<SubscriptionProvider>(
      builder: (context, subscriptionProvider, child) {
        // Используем быстрый доступ к статусу
        final isPremium = subscriptionProvider.isPremiumFast;

        print('🔧 PremiumChartOverlay: isPremium = $isPremium');
        print('🔧 PremiumChartOverlay: title = $title');
        print(
          '🔧 PremiumChartOverlay: subscriptionProvider.isPremium = ${subscriptionProvider.isPremium}',
        );

        if (isPremium) {
          // Если премиум - показываем обычный контент
          print('🔧 PremiumChartOverlay: Показываем разблокированный контент');
          return this.child;
        }

        // Если не премиум - показываем заблокированный контент
        print('🔧 PremiumChartOverlay: Показываем заблокированный контент');
        if (lockedHeight != null) {
          // Если указана фиксированная высота, используем её с обрезкой переполнения
          return ClipRect(
            child: SizedBox(
              height: lockedHeight,
              child: _buildLockedContent(context, isCompact: true),
            ),
          );
        }
        // Иначе блок адаптируется под содержимое
        return _buildLockedContent(context, isCompact: false);
      },
    );
  }

  Widget _buildLockedContent(BuildContext context, {required bool isCompact}) {
    // Уменьшаем размеры для компактного режима
    final iconSize = isCompact ? 44.0 : 60.0;
    final iconInnerSize = isCompact ? 20.0 : 28.0;
    final titleFontSize = isCompact ? 18.0 : 24.0;
    final descriptionFontSize = isCompact ? 13.0 : 16.0;
    // Отступы между элементами
    final iconToTitleSpacing = isCompact ? 16.0 : 20.0; // Между иконкой и заголовком
    final titleToDescSpacing = isCompact ? 8.0 : 12.0; // Между заголовком и описанием
    final descToButtonSpacing = isCompact ? 16.0 : 20.0; // Между описанием и кнопкой
    final buttonPadding = isCompact
        ? const EdgeInsets.symmetric(horizontal: 18, vertical: 10)
        : const EdgeInsets.symmetric(horizontal: 24, vertical: 14);
    final cardPadding = isCompact
        ? const EdgeInsets.all(16)
        : CardStyleUtils.getCardPadding(context);

    return Container(
      width: double.infinity,
      decoration: CardStyleUtils.getCardDecoration(context),
      child: isCompact
          ? SingleChildScrollView(
              child: Padding(
                padding: cardPadding,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: _buildContentChildren(
                    context,
                    iconSize,
                    iconInnerSize,
                    titleFontSize,
                    descriptionFontSize,
                    iconToTitleSpacing,
                    titleToDescSpacing,
                    descToButtonSpacing,
                    buttonPadding,
                    isCompact,
                  ),
                ),
              ),
            )
          : Padding(
              padding: cardPadding,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: _buildContentChildren(
                  context,
                  iconSize,
                  iconInnerSize,
                  titleFontSize,
                  descriptionFontSize,
                  iconToTitleSpacing,
                  titleToDescSpacing,
                  descToButtonSpacing,
                  buttonPadding,
                  isCompact,
                ),
              ),
            ),
    );
  }

  List<Widget> _buildContentChildren(
    BuildContext context,
    double iconSize,
    double iconInnerSize,
    double titleFontSize,
    double descriptionFontSize,
    double iconToTitleSpacing,
    double titleToDescSpacing,
    double descToButtonSpacing,
    EdgeInsets buttonPadding,
    bool isCompact,
  ) {
    return [
      // Иконка замка в круге
      Container(
        width: iconSize,
        height: iconSize,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: Theme.of(context).colorScheme.primary,
            width: 1.5,
          ),
          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        ),
        child: Icon(
          Icons.lock,
          size: iconInnerSize,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),

      SizedBox(height: iconToTitleSpacing),

      // Заголовок
      Text(
        title,
        style: TextStyle(
          fontSize: titleFontSize,
          fontWeight: FontWeight.bold,
          color: CardStyleUtils.getTitleColor(context),
        ),
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),

      SizedBox(height: titleToDescSpacing),

      // Описание
      Text(
        description,
        style: TextStyle(
          fontSize: descriptionFontSize,
          color: CardStyleUtils.getSubtitleColor(context),
        ),
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),

      SizedBox(height: descToButtonSpacing),

      // Кнопка подписки
      ElevatedButton.icon(
        onPressed:
            onSubscribe ??
            () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SubscriptionSelectionScreen(),
                ),
              );
            },
        icon: Icon(Icons.star, size: isCompact ? 14 : 18),
        label: Text(
          'premium.unlock'.tr(),
          style: TextStyle(
            fontSize: isCompact ? 13 : 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
          padding: buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
          elevation: 0,
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      ),
    ];
  }
}
