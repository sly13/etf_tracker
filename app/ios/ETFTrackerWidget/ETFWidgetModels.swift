//
//  ETFWidgetModels.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import WidgetKit
import Foundation

// Данные по фондам за день
struct FundFlows {
    let blackrock: Double
    let fidelity: Double
    let bitwise: Double
    let twentyOneShares: Double
    let vanEck: Double
    let invesco: Double
    let franklin: Double
    let grayscale: Double
    let grayscaleCrypto: Double
    let valkyrie: Double? // Только для BTC
    let wisdomTree: Double? // Только для BTC
    
    // Вспомогательная функция для безопасного преобразования в Double
    private static func toDouble(_ value: Any?) -> Double {
        if let double = value as? Double {
            return double
        }
        if let int = value as? Int {
            return Double(int)
        }
        if let number = value as? NSNumber {
            return number.doubleValue
        }
        if let string = value as? String, let double = Double(string) {
            return double
        }
        return 0.0
    }
    
    init(from dict: [String: Any]) {
        self.blackrock = Self.toDouble(dict["blackrock"])
        self.fidelity = Self.toDouble(dict["fidelity"])
        self.bitwise = Self.toDouble(dict["bitwise"])
        self.twentyOneShares = Self.toDouble(dict["twentyOneShares"])
        self.vanEck = Self.toDouble(dict["vanEck"])
        self.invesco = Self.toDouble(dict["invesco"])
        self.franklin = Self.toDouble(dict["franklin"])
        self.grayscale = Self.toDouble(dict["grayscale"])
        self.grayscaleCrypto = Self.toDouble(dict["grayscaleCrypto"])
        
        let valkyrieValue = Self.toDouble(dict["valkyrie"])
        self.valkyrie = valkyrieValue != 0.0 ? valkyrieValue : nil
        
        let wisdomTreeValue = Self.toDouble(dict["wisdomTree"])
        self.wisdomTree = wisdomTreeValue != 0.0 ? wisdomTreeValue : nil
    }
    
    // Получить топ-3 фонда по притоку
    // Для Solana используются только: bitwise, vanEck, fidelity, twentyOneShares, grayscale
    // Остальные фонды (blackrock, invesco, franklin, grayscaleCrypto, valkyrie, wisdomTree) 
    // не используются для Solana и будут иметь нулевые значения
    func topFunds(limit: Int = 3) -> [(name: String, flow: Double)] {
        var funds: [(name: String, flow: Double)] = []
        
        // Показываем только ненулевые значения (для Solana автоматически отфильтруются неиспользуемые фонды)
        if abs(blackrock) > 0.01 { funds.append(("BlackRock", blackrock)) }
        if abs(fidelity) > 0.01 { funds.append(("Fidelity", fidelity)) }
        if abs(bitwise) > 0.01 { funds.append(("Bitwise", bitwise)) }
        if abs(twentyOneShares) > 0.01 { funds.append(("21Shares", twentyOneShares)) }
        if abs(vanEck) > 0.01 { funds.append(("VanEck", vanEck)) }
        if abs(invesco) > 0.01 { funds.append(("Invesco", invesco)) }
        if abs(franklin) > 0.01 { funds.append(("Franklin", franklin)) }
        if abs(grayscale) > 0.01 { funds.append(("Grayscale", grayscale)) }
        if abs(grayscaleCrypto) > 0.01 { funds.append(("Grayscale Crypto", grayscaleCrypto)) }
        if let valkyrie = valkyrie, abs(valkyrie) > 0.01 { funds.append(("Valkyrie", valkyrie)) }
        if let wisdomTree = wisdomTree, abs(wisdomTree) > 0.01 { funds.append(("WisdomTree", wisdomTree)) }
        
        // Сортируем по абсолютному значению притока (по убыванию)
        return funds.sorted { abs($0.flow) > abs($1.flow) }.prefix(limit).map { $0 }
    }
}

// Модель данных для ETF (потоки за день)
struct ETFWidgetData {
    let totalFlow: Double
    let bitcoinFlow: Double
    let ethereumFlow: Double
    let solanaFlow: Double
    let bitcoinTotalAssets: Double
    let ethereumTotalAssets: Double
    let solanaTotalAssets: Double
    let lastUpdated: Date
    let dataDate: Date
    let isPositive: Bool
    let last7DaysTotals: [Double]
    let bitcoinDailyFlows: [Double]
    let ethereumDailyFlows: [Double]
    let solanaDailyFlows: [Double]
    let bitcoinFundFlows: FundFlows?
    let ethereumFundFlows: FundFlows?
    let solanaFundFlows: FundFlows?
    
    static let placeholder = ETFWidgetData(
        totalFlow: 618.9,
        bitcoinFlow: 477.2,
        ethereumFlow: 141.7,
        solanaFlow: 50.0,
        bitcoinTotalAssets: 61942.9,
        ethereumTotalAssets: 24866.5,
        solanaTotalAssets: 5000.0,
        lastUpdated: Date(),
        dataDate: Date(),
        isPositive: true,
        last7DaysTotals: [618.9, -186.1, -598.9, -587.7, 65.5, 338.9, -754.9, 200.3, -150.2, 500.8],
        bitcoinDailyFlows: [477.2, -40.4, -366.6, -530.9, -104.1, 102.7, -326.4, 150.2, -200.3, 300.4],
        ethereumDailyFlows: [141.7, -145.7, -232.3, -56.8, 169.6, 236.2, -428.5, 100.1, -75.5, 200.4],
        solanaDailyFlows: [50.0, -20.0, -30.0, 10.0, 25.0, -15.0, 40.0, -10.0, 20.0, 30.0],
        bitcoinFundFlows: nil,
        ethereumFundFlows: nil,
        solanaFundFlows: nil
    )
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let etfData: ETFWidgetData
}

