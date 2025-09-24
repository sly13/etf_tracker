import 'package:flutter/material.dart';
import '../screens/onboarding_screen.dart';

class OnboardingPage extends StatelessWidget {
  final OnboardingPageData data;
  final bool isLastPage;
  final VoidCallback onNext;

  const OnboardingPage({
    super.key,
    required this.data,
    required this.isLastPage,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Иллюстрация
            _buildIllustration(),
            const SizedBox(height: 40),

            // Заголовок
            _buildTitle(),
            const SizedBox(height: 16),

            // Описание
            _buildDescription(),
          ],
        ),
      ),
    );
  }

  Widget _buildIcon() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: data.iconColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Icon(data.icon, color: Colors.white, size: 40),
    );
  }

  Widget _buildTitle() {
    return Text(
      data.title,
      style: const TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildDescription() {
    return Text(
      data.description,
      style: TextStyle(
        fontSize: 16,
        color: Colors.grey[300],
        height: 1.5,
        fontWeight: FontWeight.w400,
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildIllustration() {
    // Если есть изображение, показываем его без рамок
    if (data.imagePath != null) {
      return Image.asset(data.imagePath!, fit: BoxFit.contain);
    }

    // Иначе показываем кастомные иллюстрации
    switch (data.illustration) {
      case OnboardingIllustration.welcome:
        return _buildWelcomeIllustration();
      case OnboardingIllustration.notifications:
        return _buildNotificationsIllustration();
      case OnboardingIllustration.speed:
        return _buildSpeedIllustration();
      case OnboardingIllustration.analytics:
        return _buildAnalyticsIllustration();
      case OnboardingIllustration.reports:
        return _buildReportsIllustration();
    }
  }

  Widget _buildWelcomeIllustration() {
    return Image.asset('assets/onboarding/screen_0.png', fit: BoxFit.contain);
  }

  Widget _buildNotificationsIllustration() {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF4A90E2), Color(0xFF7B68EE)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Телефон
          Positioned(
            left: 20,
            top: 20,
            child: Container(
              width: 120,
              height: 160,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!, width: 2),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  // Уведомление в телефоне
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.notifications,
                          color: Colors.blue[600],
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 8,
                                width: double.infinity,
                                color: Colors.grey[300],
                              ),
                              const SizedBox(height: 4),
                              Container(
                                height: 6,
                                width: 60,
                                color: Colors.grey[300],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Telegram иконка
          Positioned(
            right: 30,
            top: 60,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: Colors.blue[600],
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.send, color: Colors.white, size: 30),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeedIllustration() {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFff6b6b), Color(0xFFffa726)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // График
          Positioned(
            left: 20,
            top: 20,
            right: 20,
            bottom: 20,
            child: CustomPaint(
              painter: SpeedChartPainter(),
              size: const Size(double.infinity, 160),
            ),
          ),
          // Маленький график в углу
          Positioned(
            top: 20,
            left: 20,
            child: Container(
              width: 40,
              height: 30,
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(6),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(height: 2, width: 20, color: Colors.blue[300]),
                  const SizedBox(height: 2),
                  Container(height: 2, width: 15, color: Colors.blue[300]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticsIllustration() {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF667eea), Color(0xFF764ba2)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.purple.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Лупа с диаграммой
          Positioned(
            left: 40,
            top: 40,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(40),
                border: Border.all(color: Colors.blue[200]!, width: 2),
              ),
              child: Stack(
                children: [
                  // Ручка лупы
                  Positioned(
                    bottom: -10,
                    right: -10,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: Colors.blue[600],
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  // Круговая диаграмма внутри лупы
                  Center(
                    child: CustomPaint(
                      painter: PieChartPainter(),
                      size: const Size(50, 50),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Столбчатая диаграмма
          Positioned(
            right: 30,
            top: 60,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  width: 20,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.blue[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 20,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.blue[400],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 20,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.blue[500],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          ),
          // Документ в углу
          Positioned(
            top: 20,
            left: 20,
            child: Container(
              width: 30,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(height: 2, width: 20, color: Colors.blue[300]),
                  const SizedBox(height: 2),
                  Container(height: 2, width: 15, color: Colors.blue[300]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReportsIllustration() {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF56ab2f), Color(0xFFa8e6cf)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Основной документ отчета
          Positioned(
            left: 30,
            top: 30,
            child: Container(
              width: 120,
              height: 140,
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green[200]!, width: 2),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 10),
                  // Заголовок отчета
                  Container(height: 8, width: 80, color: Colors.green[300]),
                  const SizedBox(height: 8),
                  // Строки данных
                  Container(height: 4, width: 100, color: Colors.green[200]),
                  const SizedBox(height: 4),
                  Container(height: 4, width: 90, color: Colors.green[200]),
                  const SizedBox(height: 4),
                  Container(height: 4, width: 95, color: Colors.green[200]),
                  const SizedBox(height: 8),
                  // График в отчете
                  Container(
                    height: 40,
                    width: 100,
                    decoration: BoxDecoration(
                      color: Colors.green[100],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: CustomPaint(
                      painter: ReportChartPainter(),
                      size: const Size(100, 40),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Маленькие документы вокруг
          Positioned(
            top: 20,
            right: 20,
            child: Container(
              width: 40,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.green[100],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(height: 2, width: 25, color: Colors.green[300]),
                  const SizedBox(height: 2),
                  Container(height: 2, width: 20, color: Colors.green[300]),
                  const SizedBox(height: 2),
                  Container(height: 2, width: 15, color: Colors.green[300]),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 20,
            right: 40,
            child: Container(
              width: 35,
              height: 45,
              decoration: BoxDecoration(
                color: Colors.green[100],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(height: 2, width: 20, color: Colors.green[300]),
                  const SizedBox(height: 2),
                  Container(height: 2, width: 18, color: Colors.green[300]),
                ],
              ),
            ),
          ),
          // Иконка принтера
          Positioned(
            bottom: 30,
            left: 20,
            child: Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: Colors.green[400],
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Icon(Icons.print, color: Colors.white, size: 16),
            ),
          ),
        ],
      ),
    );
  }
}

// Кастомный painter для графика скорости
class SpeedChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.purple[400]!
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(0, size.height * 0.8);
    path.lineTo(size.width * 0.2, size.height * 0.6);
    path.lineTo(size.width * 0.4, size.height * 0.4);
    path.lineTo(size.width * 0.6, size.height * 0.3);
    path.lineTo(size.width * 0.8, size.height * 0.2);
    path.lineTo(size.width, size.height * 0.1);

    canvas.drawPath(path, paint);

    // Стрелка в конце
    final arrowPaint = Paint()
      ..color = Colors.purple[400]!
      ..style = PaintingStyle.fill;

    final arrowPath = Path();
    arrowPath.moveTo(size.width - 10, size.height * 0.1);
    arrowPath.lineTo(size.width - 20, size.height * 0.05);
    arrowPath.lineTo(size.width - 20, size.height * 0.15);
    arrowPath.close();

    canvas.drawPath(arrowPath, arrowPaint);

    // Фоновая линия
    final backgroundPaint = Paint()
      ..color = Colors.purple[200]!
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final backgroundPath = Path();
    backgroundPath.moveTo(0, size.height * 0.7);
    backgroundPath.lineTo(size.width * 0.3, size.height * 0.5);
    backgroundPath.lineTo(size.width * 0.6, size.height * 0.4);
    backgroundPath.lineTo(size.width * 0.9, size.height * 0.3);

    canvas.drawPath(backgroundPath, backgroundPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Кастомный painter для Crypto Flow иллюстрации
class CryptoFlowIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width < size.height ? size.width : size.height) * 0.3;

    // Создаем современную крипто-иконку с потоками
    final paint1 = Paint()
      ..color =
          Colors.orange[400]! // Bitcoin цвет
      ..style = PaintingStyle.fill;

    final paint2 = Paint()
      ..color =
          Colors.blue[400]! // Ethereum цвет
      ..style = PaintingStyle.fill;

    final paint3 = Paint()
      ..color =
          Colors.purple[400]! // Акцентный цвет
      ..style = PaintingStyle.fill;

    // Основной круг (Bitcoin)
    canvas.drawCircle(center, radius, paint1);

    // Внутренний круг (Ethereum)
    canvas.drawCircle(center, radius * 0.7, paint2);

    // Центральная точка
    canvas.drawCircle(center, radius * 0.3, paint3);

    // Потоки данных вокруг иконки
    final flowPaint = Paint()
      ..color = Colors.grey[300]!
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    // Верхний поток
    final topFlow = Path();
    topFlow.moveTo(center.dx - radius * 0.8, center.dy - radius * 1.6);
    topFlow.quadraticBezierTo(
      center.dx - radius * 0.4,
      center.dy - radius * 2.0,
      center.dx + radius * 0.4,
      center.dy - radius * 2.0,
    );
    topFlow.quadraticBezierTo(
      center.dx + radius * 0.8,
      center.dy - radius * 1.6,
      center.dx + radius * 1.2,
      center.dy - radius * 1.2,
    );
    canvas.drawPath(topFlow, flowPaint);

    // Нижний поток
    final bottomFlow = Path();
    bottomFlow.moveTo(center.dx - 40, center.dy + 80);
    bottomFlow.quadraticBezierTo(
      center.dx - 20,
      center.dy + 100,
      center.dx + 20,
      center.dy + 100,
    );
    bottomFlow.quadraticBezierTo(
      center.dx + 40,
      center.dy + 80,
      center.dx + 60,
      center.dy + 60,
    );
    canvas.drawPath(bottomFlow, flowPaint);

    // Левый поток
    final leftFlow = Path();
    leftFlow.moveTo(center.dx - 80, center.dy - 40);
    leftFlow.quadraticBezierTo(
      center.dx - 100,
      center.dy - 20,
      center.dx - 100,
      center.dy + 20,
    );
    leftFlow.quadraticBezierTo(
      center.dx - 80,
      center.dy + 40,
      center.dx - 60,
      center.dy + 60,
    );
    canvas.drawPath(leftFlow, flowPaint);

    // Правый поток
    final rightFlow = Path();
    rightFlow.moveTo(center.dx + 80, center.dy - 40);
    rightFlow.quadraticBezierTo(
      center.dx + 100,
      center.dy - 20,
      center.dx + 100,
      center.dy + 20,
    );
    rightFlow.quadraticBezierTo(
      center.dx + 80,
      center.dy + 40,
      center.dx + 60,
      center.dy + 60,
    );
    canvas.drawPath(rightFlow, flowPaint);

    // Добавляем стрелки на концах потоков
    final arrowPaint = Paint()
      ..color = Colors.purple[400]!
      ..style = PaintingStyle.fill;

    // Стрелка вверху справа
    final topArrow = Path();
    topArrow.moveTo(center.dx + 60, center.dy - 60);
    topArrow.lineTo(center.dx + 50, center.dy - 70);
    topArrow.lineTo(center.dx + 70, center.dy - 70);
    topArrow.close();
    canvas.drawPath(topArrow, arrowPaint);

    // Стрелка внизу справа
    final bottomArrow = Path();
    bottomArrow.moveTo(center.dx + 60, center.dy + 60);
    bottomArrow.lineTo(center.dx + 50, center.dy + 70);
    bottomArrow.lineTo(center.dx + 70, center.dy + 70);
    bottomArrow.close();
    canvas.drawPath(bottomArrow, arrowPaint);

    // Стрелка слева внизу
    final leftArrow = Path();
    leftArrow.moveTo(center.dx - 60, center.dy + 60);
    leftArrow.lineTo(center.dx - 70, center.dy + 50);
    leftArrow.lineTo(center.dx - 70, center.dy + 70);
    leftArrow.close();
    canvas.drawPath(leftArrow, arrowPaint);

    // Стрелка справа внизу
    final rightArrow = Path();
    rightArrow.moveTo(center.dx + 60, center.dy + 60);
    rightArrow.lineTo(center.dx + 70, center.dy + 50);
    rightArrow.lineTo(center.dx + 70, center.dy + 70);
    rightArrow.close();
    canvas.drawPath(rightArrow, arrowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Кастомный painter для круговой диаграммы
class PieChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final paint = Paint()..style = PaintingStyle.fill;

    // Основная часть (светло-синяя)
    paint.color = Colors.blue[200]!;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -1.57, // -90 градусов
      4.71, // 270 градусов
      true,
      paint,
    );

    // Выделенная часть (темно-синяя)
    paint.color = Colors.blue[600]!;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -1.57, // -90 градусов
      1.57, // 90 градусов
      true,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Кастомный painter для графика в отчетах
class ReportChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.green[400]!
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(0, size.height * 0.8);
    path.lineTo(size.width * 0.2, size.height * 0.6);
    path.lineTo(size.width * 0.4, size.height * 0.4);
    path.lineTo(size.width * 0.6, size.height * 0.3);
    path.lineTo(size.width * 0.8, size.height * 0.2);
    path.lineTo(size.width, size.height * 0.1);

    canvas.drawPath(path, paint);

    // Точки на графике
    final pointPaint = Paint()
      ..color = Colors.green[600]!
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(size.width * 0.2, size.height * 0.6),
      2,
      pointPaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.4, size.height * 0.4),
      2,
      pointPaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.6, size.height * 0.3),
      2,
      pointPaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.8, size.height * 0.2),
      2,
      pointPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
