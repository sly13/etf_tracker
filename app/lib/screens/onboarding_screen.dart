import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import '../providers/onboarding_provider.dart';
import '../widgets/onboarding_page.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  late PageController _pageController;
  int _currentPage = 0;

  final List<OnboardingPageData> _pages = [
    OnboardingPageData(
      icon: Icons.currency_bitcoin,
      iconColor: Colors.orange,
      title: 'onboarding.welcome.title'.tr(),
      description: 'onboarding.welcome.description'.tr(),
      illustration: OnboardingIllustration.welcome,
      imagePath: 'assets/onboarding/screen_0.png',
      isWelcomeScreen: true,
    ),
    OnboardingPageData(
      icon: Icons.analytics,
      iconColor: Colors.blue,
      title: 'onboarding.analytics.title'.tr(),
      description: 'onboarding.analytics.description'.tr(),
      illustration: OnboardingIllustration.analytics,
      imagePath: 'assets/onboarding/screen_1.png',
    ),
    OnboardingPageData(
      icon: Icons.notifications,
      iconColor: Colors.yellow,
      title: 'onboarding.notifications.title'.tr(),
      description: 'onboarding.notifications.description'.tr(),
      illustration: OnboardingIllustration.notifications,
      imagePath: 'assets/onboarding/screen_2.png',
    ),
    OnboardingPageData(
      icon: Icons.assessment,
      iconColor: Colors.green,
      title: 'onboarding.reports.title'.tr(),
      description: 'onboarding.reports.description'.tr(),
      illustration: OnboardingIllustration.reports,
      imagePath: 'assets/onboarding/screen_3.png',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _completeOnboarding() async {
    final onboardingProvider = Provider.of<OnboardingProvider>(
      context,
      listen: false,
    );
    await onboardingProvider.markOnboardingAsCompleted();

    if (mounted) {
      // После завершения онбординга AppInitializer автоматически покажет paywall
      // так как пользователь еще не премиум
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF1A1A1A),
              const Color(0xFF2D1B69),
              const Color(0xFF000000),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Декоративные элементы фона для всего экрана
            _buildFullScreenBackgroundDecorations(),
            // Основной контент - весь экран как единое целое
            SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: PageView.builder(
                      controller: _pageController,
                      onPageChanged: (index) {
                        setState(() {
                          _currentPage = index;
                        });
                      },
                      itemCount: _pages.length,
                      itemBuilder: (context, index) {
                        return OnboardingPage(
                          data: _pages[index],
                          isLastPage: index == _pages.length - 1,
                          onNext: _nextPage,
                        );
                      },
                    ),
                  ),
                  // Индикаторы страниц
                  _buildPageIndicators(),
                  const SizedBox(height: 20),
                  // Кнопка "Далее"
                  _buildNextButton(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFullScreenBackgroundDecorations() {
    return Stack(
      children: [
        // Большие декоративные круги
        Positioned(
          top: -200,
          right: -200,
          child: Container(
            width: 400,
            height: 400,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [Colors.purple.withOpacity(0.08), Colors.transparent],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: -300,
          left: -300,
          child: Container(
            width: 600,
            height: 600,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [Colors.blue.withOpacity(0.06), Colors.transparent],
              ),
            ),
          ),
        ),
        // Средние декоративные элементы
        Positioned(
          top: 100,
          left: -50,
          child: Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.purple.withOpacity(0.04),
            ),
          ),
        ),
        Positioned(
          bottom: 200,
          right: -100,
          child: Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.blue.withOpacity(0.05),
            ),
          ),
        ),
        // Линии и формы для всего экрана
        Positioned(
          top: 0,
          left: 0,
          child: Container(
            width: 2,
            height: 300,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.purple.withOpacity(0.2), Colors.transparent],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 0,
          right: 0,
          child: Container(
            width: 200,
            height: 2,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [Colors.blue.withOpacity(0.15), Colors.transparent],
              ),
            ),
          ),
        ),
        // Дополнительные декоративные элементы
        Positioned(
          top: 300,
          right: 50,
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.purple.withOpacity(0.03),
            ),
          ),
        ),
        Positioned(
          bottom: 300,
          left: 100,
          child: Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.blue.withOpacity(0.04),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPageIndicators() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        _pages.length,
        (index) => Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: _currentPage == index ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(4),
            color: _currentPage == index
                ? Colors.white
                : Colors.grey.withOpacity(0.3),
          ),
        ),
      ),
    );
  }

  Widget _buildNextButton() {
    final isLastPage = _currentPage == _pages.length - 1;
    final isWelcomeScreen = _pages[_currentPage].isWelcomeScreen;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _nextPage,
          style: ElevatedButton.styleFrom(
            backgroundColor: isWelcomeScreen
                ? Colors.purple[400]
                : const Color(0xFF4A90E2),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
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
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
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
