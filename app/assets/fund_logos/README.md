# Логотипы фондов ETF

## Описание

Эта папка содержит логотипы всех поддерживаемых фондов ETF для приложения ETF Tracker.

## Список фондов

### Bitcoin ETF

- **BlackRock (IBIT)** - `blackrock.jpg`
- **Fidelity (FBTC)** - `fidelity.jpg`
- **Bitwise (BITB)** - `bitwise.jpg`
- **21Shares (ARKB)** - `ark.jpg`
- **VanEck (HODL)** - `vaneck.jpg`
- **Invesco (BTCO)** - `invesco.jpg`
- **Franklin Templeton (EZBC)** - `franklin.jpg`
- **Grayscale (GBTC)** - `grayscale.jpg`
- **Valkyrie (BRRR)** - `valkyrie.jpg`
- **WisdomTree (BTCW)** - `wtree.jpg`

### Ethereum ETF

- **Grayscale Crypto (ETH)** - `grayscale-gbtc.jpg`

## Использование

### В коде Flutter

```dart
import '../services/fund_logo_service.dart';

// Получить логотип фонда
Widget logo = FundLogoService.getLogoWidget(
  'blackrock',
  width: 40,
  height: 40,
  borderRadius: BorderRadius.circular(8),
);

// Проверить наличие логотипа
bool hasLogo = FundLogoService.hasLogo('blackrock');

// Получить название фонда
String name = FundLogoService.getFundName('blackrock');
```

### Ключи фондов

- `blackrock` - BlackRock
- `fidelity` - Fidelity
- `bitwise` - Bitwise
- `twentyOneShares` - 21Shares
- `vanEck` - VanEck
- `invesco` - Invesco
- `franklin` - Franklin Templeton
- `grayscale` - Grayscale
- `grayscaleCrypto` - Grayscale Crypto
- `valkyrie` - Valkyrie
- `wisdomTree` - WisdomTree

## Требования к изображениям

- **Формат**: JPG/PNG
- **Размер**: Рекомендуется 200x200px или больше
- **Качество**: Высокое, без сжатия
- **Стиль**: Логотип на прозрачном или белом фоне

## Обновление

При добавлении новых фондов:

1. Добавить изображение в эту папку
2. Обновить `FundLogoService` в `app/lib/services/fund_logo_service.dart`
3. Добавить ключ фонда в маппинг
4. Обновить методы определения фонда в виджетах
