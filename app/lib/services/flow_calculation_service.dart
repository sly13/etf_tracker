import '../models/etf_flow_data.dart';

class FlowCalculationService {
  /// Рассчитать изменения за выбранный период
  static Map<String, double> calculateFlowChanges(
    List<ETFFlowData> ethereumData,
    List<BTCFlowData> bitcoinData,
    String period,
  ) {
    // Для периода "день" используем специальную логику
    if (period == 'day') {
      return _calculateDayChanges(ethereumData, bitcoinData);
    }

    final now = DateTime.now();
    DateTime startDate;

    // Определяем начальную дату в зависимости от периода
    switch (period) {
      case 'week':
        startDate = now.subtract(const Duration(days: 7));
        break;
      case 'month':
        startDate = DateTime(now.year, now.month - 1, now.day);
        break;
      case 'quarter':
        startDate = DateTime(now.year, now.month - 3, now.day);
        break;
      case 'half_year':
        startDate = DateTime(now.year, now.month - 6, now.day);
        break;
      case 'year':
        startDate = DateTime(now.year - 1, now.month, now.day);
        break;
      default:
        startDate = now.subtract(const Duration(days: 1));
    }

    // Рассчитываем изменения для Ethereum
    final ethChanges = _calculateEthereumChanges(ethereumData, startDate);

    // Рассчитываем изменения для Bitcoin
    final btcChanges = _calculateBitcoinChanges(bitcoinData, startDate);

    // Объединяем результаты
    final result = <String, double>{};
    result.addAll(ethChanges);
    result.addAll(btcChanges);

    return result;
  }

  /// Рассчитать изменения за последний день (сколько пришло за этот день)
  static Map<String, double> _calculateDayChanges(
    List<ETFFlowData> ethereumData,
    List<BTCFlowData> bitcoinData,
  ) {
    final result = <String, double>{};

    // Рассчитываем изменения для Ethereum (сколько пришло за последний день)
    if (ethereumData.isNotEmpty) {
      final latestEthData =
          ethereumData.first; // Используем first, как в Bitcoin ETF экране
      print(
        '🔍 _calculateDayChanges Debug: latestEthData.date = ${latestEthData.date}',
      );
      print(
        '🔍 _calculateDayChanges Debug: latestEthData.blackrock = ${latestEthData.blackrock}',
      );

      // Добавляем изменения для каждой компании (сколько пришло за этот день)
      if (latestEthData.blackrock != null) {
        result['BlackRock_ETH'] = latestEthData.blackrock!;
      }
      if (latestEthData.fidelity != null) {
        result['Fidelity_ETH'] = latestEthData.fidelity!;
      }
      if (latestEthData.bitwise != null) {
        result['Bitwise_ETH'] = latestEthData.bitwise!;
      }
      if (latestEthData.twentyOneShares != null) {
        result['21Shares_ETH'] = latestEthData.twentyOneShares!;
      }
      if (latestEthData.vanEck != null) {
        result['VanEck_ETH'] = latestEthData.vanEck!;
      }
      if (latestEthData.invesco != null) {
        result['Invesco_ETH'] = latestEthData.invesco!;
      }
      if (latestEthData.franklin != null) {
        result['Franklin Templeton_ETH'] = latestEthData.franklin!;
      }
      if (latestEthData.grayscale != null) {
        result['Grayscale_ETH'] = latestEthData.grayscale!;
      }
      if (latestEthData.grayscaleCrypto != null) {
        result['Grayscale Crypto_ETH'] = latestEthData.grayscaleCrypto!;
      }
    }

    // Рассчитываем изменения для Bitcoin (сколько пришло за последний день)
    if (bitcoinData.isNotEmpty) {
      final latestBtcData =
          bitcoinData.first; // Используем first, как в Bitcoin ETF экране
      print(
        '🔍 _calculateDayChanges Debug: latestBtcData.date = ${latestBtcData.date}',
      );
      print(
        '🔍 _calculateDayChanges Debug: latestBtcData.blackrock = ${latestBtcData.blackrock}',
      );

      // Добавляем изменения для каждой компании (сколько пришло за этот день)
      if (latestBtcData.blackrock != null) {
        result['BlackRock_BTC'] = latestBtcData.blackrock!;
      }
      if (latestBtcData.fidelity != null) {
        result['Fidelity_BTC'] = latestBtcData.fidelity!;
      }
      if (latestBtcData.bitwise != null) {
        result['Bitwise_BTC'] = latestBtcData.bitwise!;
      }
      if (latestBtcData.twentyOneShares != null) {
        result['21Shares_BTC'] = latestBtcData.twentyOneShares!;
      }
      if (latestBtcData.vanEck != null) {
        result['VanEck_BTC'] = latestBtcData.vanEck!;
      }
      if (latestBtcData.invesco != null) {
        result['Invesco_BTC'] = latestBtcData.invesco!;
      }
      if (latestBtcData.franklin != null) {
        result['Franklin Templeton_BTC'] = latestBtcData.franklin!;
      }
      if (latestBtcData.grayscale != null) {
        result['Grayscale_BTC'] = latestBtcData.grayscale!;
      }
      if (latestBtcData.grayscaleBtc != null) {
        result['Grayscale BTC_BTC'] = latestBtcData.grayscaleBtc!;
      }
      if (latestBtcData.valkyrie != null) {
        result['Valkyrie_BTC'] = latestBtcData.valkyrie!;
      }
      if (latestBtcData.wisdomTree != null) {
        result['WisdomTree_BTC'] = latestBtcData.wisdomTree!;
      }
    }

    return result;
  }

  /// Рассчитать изменения для Ethereum ETF
  static Map<String, double> _calculateEthereumChanges(
    List<ETFFlowData> data,
    DateTime startDate,
  ) {
    final changes = <String, double>{};

    // Получаем все уникальные компании из Ethereum данных
    final companies = <String>{};
    for (var item in data) {
      if (item.blackrock != null) companies.add('BlackRock');
      if (item.fidelity != null) companies.add('Fidelity');
      if (item.bitwise != null) companies.add('Bitwise');
      if (item.twentyOneShares != null) companies.add('21Shares');
      if (item.vanEck != null) companies.add('VanEck');
      if (item.invesco != null) companies.add('Invesco');
      if (item.franklin != null) companies.add('Franklin Templeton');
      if (item.grayscale != null) companies.add('Grayscale');
      if (item.grayscaleCrypto != null) companies.add('Grayscale Crypto');
    }

    // Рассчитываем изменения для каждой компании
    for (var company in companies) {
      double totalChange = 0.0;

      for (var item in data) {
        final itemDate = DateTime.tryParse(item.date);
        if (itemDate != null && itemDate.isAfter(startDate)) {
          double? companyValue;

          switch (company) {
            case 'BlackRock':
              companyValue = item.blackrock;
              break;
            case 'Fidelity':
              companyValue = item.fidelity;
              break;
            case 'Bitwise':
              companyValue = item.bitwise;
              break;
            case '21Shares':
              companyValue = item.twentyOneShares;
              break;
            case 'VanEck':
              companyValue = item.vanEck;
              break;
            case 'Invesco':
              companyValue = item.invesco;
              break;
            case 'Franklin Templeton':
              companyValue = item.franklin;
              break;
            case 'Grayscale':
              companyValue = item.grayscale;
              break;
            case 'Grayscale Crypto':
              companyValue = item.grayscaleCrypto;
              break;
          }

          if (companyValue != null) {
            totalChange += companyValue;
          }
        }
      }

      if (totalChange != 0) {
        changes['${company}_ETH'] = totalChange;
      }
    }

    return changes;
  }

  /// Рассчитать изменения для Bitcoin ETF
  static Map<String, double> _calculateBitcoinChanges(
    List<BTCFlowData> data,
    DateTime startDate,
  ) {
    final changes = <String, double>{};

    // Получаем все уникальные компании из Bitcoin данных
    final companies = <String>{};
    for (var item in data) {
      if (item.blackrock != null) companies.add('BlackRock');
      if (item.fidelity != null) companies.add('Fidelity');
      if (item.bitwise != null) companies.add('Bitwise');
      if (item.twentyOneShares != null) companies.add('21Shares');
      if (item.vanEck != null) companies.add('VanEck');
      if (item.invesco != null) companies.add('Invesco');
      if (item.franklin != null) companies.add('Franklin Templeton');
      if (item.grayscale != null) companies.add('Grayscale');
      if (item.grayscaleBtc != null) companies.add('Grayscale BTC');
      if (item.valkyrie != null) companies.add('Valkyrie');
      if (item.wisdomTree != null) companies.add('WisdomTree');
    }

    // Рассчитываем изменения для каждой компании
    for (var company in companies) {
      double totalChange = 0.0;

      for (var item in data) {
        final itemDate = DateTime.tryParse(item.date);
        if (itemDate != null && itemDate.isAfter(startDate)) {
          double? companyValue;

          switch (company) {
            case 'BlackRock':
              companyValue = item.blackrock;
              break;
            case 'Fidelity':
              companyValue = item.fidelity;
              break;
            case 'Bitwise':
              companyValue = item.bitwise;
              break;
            case '21Shares':
              companyValue = item.twentyOneShares;
              break;
            case 'VanEck':
              companyValue = item.vanEck;
              break;
            case 'Invesco':
              companyValue = item.invesco;
              break;
            case 'Franklin Templeton':
              companyValue = item.franklin;
              break;
            case 'Grayscale':
              companyValue = item.grayscale;
              break;
            case 'Grayscale BTC':
              companyValue = item.grayscaleBtc;
              break;
            case 'Valkyrie':
              companyValue = item.valkyrie;
              break;
            case 'WisdomTree':
              companyValue = item.wisdomTree;
              break;
          }

          if (companyValue != null) {
            totalChange += companyValue;
          }
        }
      }

      if (totalChange != 0) {
        changes['${company}_BTC'] = totalChange;
      }
    }

    return changes;
  }

  /// Получить изменения для BTC и ETH отдельно
  static Map<String, Map<String, double>> getSeparateChanges(
    List<ETFFlowData> ethereumData,
    List<BTCFlowData> bitcoinData,
    String period,
  ) {
    final changes = calculateFlowChanges(ethereumData, bitcoinData, period);

    // Отладочная информация
    print('🔍 getSeparateChanges Debug: period=$period, changes=$changes');
    print(
      '🔍 getSeparateChanges Debug: BlackRock_BTC = ${changes['BlackRock_BTC']}',
    );

    // Группируем по компаниям и типам (BTC/ETH)
    final companyChanges = <String, Map<String, double>>{};

    for (var entry in changes.entries) {
      final key = entry.key;
      final value = entry.value;

      // Извлекаем название компании и тип
      String companyName;
      String type;

      if (key.endsWith('_BTC')) {
        companyName = key.replaceAll('_BTC', '');
        type = 'BTC';

        // Специальная обработка для Grayscale BTC - отдельная запись
        if (companyName == 'Grayscale BTC') {
          companyName = 'Grayscale BTC';
        }
      } else if (key.endsWith('_ETH')) {
        companyName = key.replaceAll('_ETH', '');
        type = 'ETH';

        // Специальная обработка для Grayscale Crypto - объединяем с основным Grayscale
        if (companyName == 'Grayscale Crypto') {
          companyName = 'Grayscale';
        }
      } else {
        continue; // Пропускаем неизвестные форматы
      }

      if (!companyChanges.containsKey(companyName)) {
        companyChanges[companyName] = {'BTC': 0.0, 'ETH': 0.0, 'SOL': 0.0};
      }

      companyChanges[companyName]![type] = value;
    }

    // Отладочная информация
    print('🔍 getSeparateChanges Result: $companyChanges');

    return companyChanges;
  }

  /// Получить общие изменения для всех компаний (для обратной совместимости)
  static Map<String, double> getTotalChanges(
    List<ETFFlowData> ethereumData,
    List<BTCFlowData> bitcoinData,
    String period,
  ) {
    final separateChanges = getSeparateChanges(
      ethereumData,
      bitcoinData,
      period,
    );

    // Суммируем BTC и ETH для каждой компании
    final companyTotals = <String, double>{};

    for (var entry in separateChanges.entries) {
      final companyName = entry.key;
      final changes = entry.value;

      final totalChange = (changes['BTC'] ?? 0.0) + (changes['ETH'] ?? 0.0);
      if (totalChange != 0) {
        companyTotals[companyName] = totalChange;
      }
    }

    return companyTotals;
  }

  /// Получить данные из последнего дня для каждой компании
  static Map<String, Map<String, double>> getLastDayHoldings(
    List<ETFFlowData> ethereumData,
    List<BTCFlowData> bitcoinData,
  ) {
    final result = <String, Map<String, double>>{};

    // Получаем данные из последнего дня для Ethereum
    if (ethereumData.isNotEmpty) {
      final latestEthData = ethereumData.last;

      if (latestEthData.blackrock != null) {
        result['BlackRock'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['BlackRock']!['ETH'] = latestEthData.blackrock!;
      }
      if (latestEthData.fidelity != null) {
        result['Fidelity'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Fidelity']!['ETH'] = latestEthData.fidelity!;
      }
      if (latestEthData.bitwise != null) {
        result['Bitwise'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Bitwise']!['ETH'] = latestEthData.bitwise!;
      }
      if (latestEthData.twentyOneShares != null) {
        result['21Shares'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['21Shares']!['ETH'] = latestEthData.twentyOneShares!;
      }
      if (latestEthData.vanEck != null) {
        result['VanEck'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['VanEck']!['ETH'] = latestEthData.vanEck!;
      }
      if (latestEthData.invesco != null) {
        result['Invesco'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Invesco']!['ETH'] = latestEthData.invesco!;
      }
      if (latestEthData.franklin != null) {
        result['Franklin Templeton'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Franklin Templeton']!['ETH'] = latestEthData.franklin!;
      }
      if (latestEthData.grayscale != null) {
        result['Grayscale'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Grayscale']!['ETH'] = latestEthData.grayscale!;
      }
      if (latestEthData.grayscaleCrypto != null) {
        result['Grayscale'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Grayscale']!['ETH'] = latestEthData.grayscaleCrypto!;
      }
    }

    // Получаем данные из последнего дня для Bitcoin
    if (bitcoinData.isNotEmpty) {
      final latestBtcData = bitcoinData.last;

      if (latestBtcData.blackrock != null) {
        result['BlackRock'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['BlackRock']!['BTC'] = latestBtcData.blackrock!;
      }
      if (latestBtcData.fidelity != null) {
        result['Fidelity'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Fidelity']!['BTC'] = latestBtcData.fidelity!;
      }
      if (latestBtcData.bitwise != null) {
        result['Bitwise'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Bitwise']!['BTC'] = latestBtcData.bitwise!;
      }
      if (latestBtcData.twentyOneShares != null) {
        result['21Shares'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['21Shares']!['BTC'] = latestBtcData.twentyOneShares!;
      }
      if (latestBtcData.vanEck != null) {
        result['VanEck'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['VanEck']!['BTC'] = latestBtcData.vanEck!;
      }
      if (latestBtcData.invesco != null) {
        result['Invesco'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Invesco']!['BTC'] = latestBtcData.invesco!;
      }
      if (latestBtcData.franklin != null) {
        result['Franklin Templeton'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Franklin Templeton']!['BTC'] = latestBtcData.franklin!;
      }
      if (latestBtcData.grayscale != null) {
        result['Grayscale'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Grayscale']!['BTC'] = latestBtcData.grayscale!;
      }
      if (latestBtcData.grayscaleBtc != null) {
        result['Grayscale BTC'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Grayscale BTC']!['BTC'] = latestBtcData.grayscaleBtc!;
      }
      if (latestBtcData.valkyrie != null) {
        result['Valkyrie'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['Valkyrie']!['BTC'] = latestBtcData.valkyrie!;
      }
      if (latestBtcData.wisdomTree != null) {
        result['WisdomTree'] ??= {'BTC': 0.0, 'ETH': 0.0};
        result['WisdomTree']!['BTC'] = latestBtcData.wisdomTree!;
      }
    }

    return result;
  }

  /// Получить общие суммы владений за весь период (сумма всех дней)
  static Map<String, Map<String, double>> getTotalHoldings(
    List<ETFFlowData> ethereumData,
    List<BTCFlowData> bitcoinData,
    List<ETFFlowData> solanaData,
  ) {
    final result = <String, Map<String, double>>{};

    // Суммируем все Ethereum данные
    for (var ethData in ethereumData) {
      if (ethData.blackrock != null) {
        result['BlackRock'] ??= {'ETH': 0.0};
        result['BlackRock']!['ETH'] =
            (result['BlackRock']!['ETH'] ?? 0.0) + ethData.blackrock!;
      }
      if (ethData.fidelity != null) {
        result['Fidelity'] ??= {'ETH': 0.0};
        result['Fidelity']!['ETH'] =
            (result['Fidelity']!['ETH'] ?? 0.0) + ethData.fidelity!;
      }
      if (ethData.bitwise != null) {
        result['Bitwise'] ??= {'ETH': 0.0};
        result['Bitwise']!['ETH'] =
            (result['Bitwise']!['ETH'] ?? 0.0) + ethData.bitwise!;
      }
      if (ethData.twentyOneShares != null) {
        result['21Shares'] ??= {'ETH': 0.0};
        result['21Shares']!['ETH'] =
            (result['21Shares']!['ETH'] ?? 0.0) + ethData.twentyOneShares!;
      }
      if (ethData.vanEck != null) {
        result['VanEck'] ??= {'ETH': 0.0};
        result['VanEck']!['ETH'] =
            (result['VanEck']!['ETH'] ?? 0.0) + ethData.vanEck!;
      }
      if (ethData.invesco != null) {
        result['Invesco'] ??= {'ETH': 0.0};
        result['Invesco']!['ETH'] =
            (result['Invesco']!['ETH'] ?? 0.0) + ethData.invesco!;
      }
      if (ethData.franklin != null) {
        result['Franklin Templeton'] ??= {'ETH': 0.0};
        result['Franklin Templeton']!['ETH'] =
            (result['Franklin Templeton']!['ETH'] ?? 0.0) + ethData.franklin!;
      }
      if (ethData.grayscale != null) {
        result['Grayscale'] ??= {'ETH': 0.0};
        result['Grayscale']!['ETH'] =
            (result['Grayscale']!['ETH'] ?? 0.0) + ethData.grayscale!;
      }
      if (ethData.grayscaleCrypto != null) {
        result['Grayscale'] ??= {'ETH': 0.0};
        result['Grayscale']!['ETH'] =
            (result['Grayscale']!['ETH'] ?? 0.0) + ethData.grayscaleCrypto!;
      }
    }

    // Суммируем все Bitcoin данные
    for (var btcData in bitcoinData) {
      if (btcData.blackrock != null) {
        result['BlackRock'] ??= {'BTC': 0.0};
        result['BlackRock']!['BTC'] =
            (result['BlackRock']!['BTC'] ?? 0.0) + btcData.blackrock!;
      }
      if (btcData.fidelity != null) {
        result['Fidelity'] ??= {'BTC': 0.0};
        result['Fidelity']!['BTC'] =
            (result['Fidelity']!['BTC'] ?? 0.0) + btcData.fidelity!;
      }
      if (btcData.bitwise != null) {
        result['Bitwise'] ??= {'BTC': 0.0};
        result['Bitwise']!['BTC'] =
            (result['Bitwise']!['BTC'] ?? 0.0) + btcData.bitwise!;
      }
      if (btcData.twentyOneShares != null) {
        result['21Shares'] ??= {'BTC': 0.0};
        result['21Shares']!['BTC'] =
            (result['21Shares']!['BTC'] ?? 0.0) + btcData.twentyOneShares!;
      }
      if (btcData.vanEck != null) {
        result['VanEck'] ??= {'BTC': 0.0};
        result['VanEck']!['BTC'] =
            (result['VanEck']!['BTC'] ?? 0.0) + btcData.vanEck!;
      }
      if (btcData.invesco != null) {
        result['Invesco'] ??= {'BTC': 0.0};
        result['Invesco']!['BTC'] =
            (result['Invesco']!['BTC'] ?? 0.0) + btcData.invesco!;
      }
      if (btcData.franklin != null) {
        result['Franklin Templeton'] ??= {'BTC': 0.0};
        result['Franklin Templeton']!['BTC'] =
            (result['Franklin Templeton']!['BTC'] ?? 0.0) + btcData.franklin!;
      }
      if (btcData.grayscale != null) {
        result['Grayscale'] ??= {'BTC': 0.0};
        result['Grayscale']!['BTC'] =
            (result['Grayscale']!['BTC'] ?? 0.0) + btcData.grayscale!;
      }
      if (btcData.grayscaleBtc != null) {
        result['Grayscale BTC'] ??= {'BTC': 0.0};
        result['Grayscale BTC']!['BTC'] =
            (result['Grayscale BTC']!['BTC'] ?? 0.0) + btcData.grayscaleBtc!;
      }
      if (btcData.valkyrie != null) {
        result['Valkyrie'] ??= {'BTC': 0.0};
        result['Valkyrie']!['BTC'] =
            (result['Valkyrie']!['BTC'] ?? 0.0) + btcData.valkyrie!;
      }
      if (btcData.wisdomTree != null) {
        result['WisdomTree'] ??= {'BTC': 0.0};
        result['WisdomTree']!['BTC'] =
            (result['WisdomTree']!['BTC'] ?? 0.0) + btcData.wisdomTree!;
      }
    }

    // Суммируем все Solana данные
    for (var solData in solanaData) {
      if (solData.bitwise != null) {
        result['Bitwise'] ??= {'BTC': 0.0, 'ETH': 0.0, 'SOL': 0.0};
        result['Bitwise']!['SOL'] =
            (result['Bitwise']!['SOL'] ?? 0.0) + solData.bitwise!;
      }
      if (solData.grayscale != null) {
        result['Grayscale'] ??= {'BTC': 0.0, 'ETH': 0.0, 'SOL': 0.0};
        result['Grayscale']!['SOL'] =
            (result['Grayscale']!['SOL'] ?? 0.0) + solData.grayscale!;
      }
    }

    // Инициализируем SOL для всех компаний, если его еще нет
    for (var entry in result.entries) {
      if (!entry.value.containsKey('SOL')) {
        entry.value['SOL'] = 0.0;
      }
    }

    return result;
  }
}
