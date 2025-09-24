import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../utils/platform_utils.dart';

class AdaptiveOnboardingPage extends StatelessWidget {
  final OnboardingPageData data;
  final bool isLastPage;
  final VoidCallback onNext;

  const AdaptiveOnboardingPage({
    super.key,
    required this.data,
    required this.isLastPage,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final sizes = PlatformUtils.adaptiveSizes;

    if (PlatformUtils.isMacOS) {
      return _buildMacOSLayout(context, sizes);
    } else {
      return _buildMobileLayout(context, sizes);
    }
  }

  Widget _buildMacOSLayout(BuildContext context, Map<String, double> sizes) {
    return Container(
      padding: EdgeInsets.all(sizes['padding']!),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Заголовок для macOS
          Text(
            data.title,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: sizes['cardSpacing']!),

          // Описание для macOS
          Text(
            data.description,
            style: TextStyle(
              fontSize: sizes['fontSize']! + 2,
              color: Colors.white70,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: sizes['cardSpacing']! * 2),

          // Иллюстрация для macOS
          _buildMacOSIllustration(),
          SizedBox(height: sizes['cardSpacing']! * 2),

          // Кнопка для macOS
          _buildMacOSButton(sizes),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context, Map<String, double> sizes) {
    return Container(
      padding: EdgeInsets.all(sizes['padding']!),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Иконка для мобильных
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: data.iconColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(sizes['borderRadius']!),
            ),
            child: Icon(
              data.icon,
              size: sizes['iconSize']! * 2,
              color: data.iconColor,
            ),
          ),
          SizedBox(height: sizes['cardSpacing']! * 2),

          // Заголовок для мобильных
          Text(
            data.title,
            style: TextStyle(
              fontSize: sizes['fontSize']! + 6,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: sizes['cardSpacing']!),

          // Описание для мобильных
          Text(
            data.description,
            style: TextStyle(
              fontSize: sizes['fontSize']!,
              color: Colors.white70,
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: sizes['cardSpacing']! * 2),

          // Иллюстрация для мобильных
          _buildMobileIllustration(),
        ],
      ),
    );
  }

  Widget _buildMacOSIllustration() {
    return Container(
      width: 400,
      height: 300,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.withOpacity(0.1),
            Colors.purple.withOpacity(0.1),
          ],
        ),
      ),
      child: _buildIllustrationContent(),
    );
  }

  Widget _buildMobileIllustration() {
    return Container(
      width: 280,
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.withOpacity(0.1),
            Colors.purple.withOpacity(0.1),
          ],
        ),
      ),
      child: _buildIllustrationContent(),
    );
  }

  Widget _buildIllustrationContent() {
    switch (data.illustration) {
      case OnboardingIllustration.welcome:
        return _buildWelcomeIllustration();
      case OnboardingIllustration.analytics:
        return _buildAnalyticsIllustration();
      case OnboardingIllustration.notifications:
        return _buildNotificationsIllustration();
      case OnboardingIllustration.reports:
        return _buildReportsIllustration();
      default:
        return _buildDefaultIllustration();
    }
  }

  Widget _buildWelcomeIllustration() {
    return CustomPaint(
      painter: WelcomeIllustrationPainter(),
      size: Size.infinite,
    );
  }

  Widget _buildAnalyticsIllustration() {
    return CustomPaint(
      painter: AnalyticsIllustrationPainter(),
      size: Size.infinite,
    );
  }

  Widget _buildNotificationsIllustration() {
    return CustomPaint(
      painter: NotificationsIllustrationPainter(),
      size: Size.infinite,
    );
  }

  Widget _buildReportsIllustration() {
    return CustomPaint(
      painter: ReportsIllustrationPainter(),
      size: Size.infinite,
    );
  }

  Widget _buildDefaultIllustration() {
    return Icon(data.icon, size: 80, color: data.iconColor.withOpacity(0.3));
  }

  Widget _buildMacOSButton(Map<String, double> sizes) {
    final isWelcomeScreen = data.isWelcomeScreen;

    return Container(
      width: 300,
      height: sizes['buttonHeight']! + 8,
      child: ElevatedButton(
        onPressed: onNext,
        style: ElevatedButton.styleFrom(
          backgroundColor: isWelcomeScreen
              ? Colors.purple[400]
              : const Color(0xFF4A90E2),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(sizes['borderRadius']! + 4),
          ),
          elevation: 8,
          shadowColor: isWelcomeScreen
              ? Colors.purple.withOpacity(0.3)
              : Colors.blue.withOpacity(0.3),
        ),
        child: Text(
          isWelcomeScreen
              ? 'common.start'.tr()
              : (isLastPage ? 'common.done'.tr() : 'common.next'.tr()),
          style: TextStyle(
            fontSize: sizes['fontSize']! + 2,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}

// Данные для страницы онбординга
class OnboardingPageData {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String description;
  final OnboardingIllustration illustration;
  final bool isWelcomeScreen;
  final String? imagePath;

  OnboardingPageData({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.description,
    required this.illustration,
    this.isWelcomeScreen = false,
    this.imagePath,
  });
}

// Типы иллюстраций
enum OnboardingIllustration {
  welcome,
  notifications,
  speed,
  analytics,
  reports,
}

// Кастомные художники для иллюстраций
class WelcomeIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.orange.withOpacity(0.8)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(size.width * 0.1, size.height * 0.8);
    path.lineTo(size.width * 0.3, size.height * 0.6);
    path.lineTo(size.width * 0.5, size.height * 0.4);
    path.lineTo(size.width * 0.7, size.height * 0.2);
    path.lineTo(size.width * 0.9, size.height * 0.1);

    canvas.drawPath(path, paint);

    // Стрелка вверх
    final arrowPaint = Paint()
      ..color = Colors.green.withOpacity(0.8)
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke;

    canvas.drawLine(
      Offset(size.width * 0.85, size.height * 0.15),
      Offset(size.width * 0.9, size.height * 0.1),
      arrowPaint,
    );
    canvas.drawLine(
      Offset(size.width * 0.85, size.height * 0.15),
      Offset(size.width * 0.8, size.height * 0.1),
      arrowPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class AnalyticsIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue.withOpacity(0.8)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    // График аналитики
    final path = Path();
    path.moveTo(size.width * 0.1, size.height * 0.7);
    path.lineTo(size.width * 0.3, size.height * 0.5);
    path.lineTo(size.width * 0.5, size.height * 0.3);
    path.lineTo(size.width * 0.7, size.height * 0.4);
    path.lineTo(size.width * 0.9, size.height * 0.2);

    canvas.drawPath(path, paint);

    // Точки данных
    final dotPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.fill;

    canvas.drawCircle(Offset(size.width * 0.3, size.height * 0.5), 4, dotPaint);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.3), 4, dotPaint);
    canvas.drawCircle(Offset(size.width * 0.7, size.height * 0.4), 4, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class NotificationsIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.yellow.withOpacity(0.8)
      ..style = PaintingStyle.fill;

    // Уведомления
    canvas.drawCircle(Offset(size.width * 0.3, size.height * 0.3), 20, paint);
    canvas.drawCircle(Offset(size.width * 0.7, size.height * 0.4), 15, paint);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.6), 18, paint);

    // Волны
    final wavePaint = Paint()
      ..color = Colors.yellow.withOpacity(0.3)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(
      Offset(size.width * 0.3, size.height * 0.3),
      30,
      wavePaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.7, size.height * 0.4),
      25,
      wavePaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ReportsIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.green.withOpacity(0.8)
      ..style = PaintingStyle.fill;

    // Столбцы диаграммы
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.2, size.height * 0.4, 20, size.height * 0.4),
      paint,
    );
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.4, size.height * 0.2, 20, size.height * 0.6),
      paint,
    );
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.6, size.height * 0.3, 20, size.height * 0.5),
      paint,
    );
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.8, size.height * 0.1, 20, size.height * 0.7),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}




