/// Утилита для преобразования названия компании в fundKey
class FundKeyMapper {
  /// Преобразовать название компании в fundKey для API
  static String companyNameToFundKey(String companyName) {
    switch (companyName) {
      case 'BlackRock':
        return 'blackrock';
      case 'Fidelity':
        return 'fidelity';
      case 'Bitwise':
        return 'bitwise';
      case '21Shares':
        return 'twentyOneShares';
      case 'VanEck':
        return 'vanEck';
      case 'Invesco':
        return 'invesco';
      case 'Franklin Templeton':
        return 'franklin';
      case 'Grayscale':
        return 'grayscale';
      case 'Grayscale BTC':
        return 'grayscale';
      case 'Grayscale Crypto':
        return 'grayscaleCrypto';
      case 'Valkyrie':
        return 'valkyrie';
      case 'WisdomTree':
        return 'wisdomTree';
      default:
        // Пытаемся преобразовать в lowercase с заменой пробелов
        return companyName.toLowerCase().replaceAll(' ', '');
    }
  }
}

