//
//  ETFWidgetService.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import Foundation

// Сервис для загрузки данных
class ETFWidgetService {
    static let shared = ETFWidgetService()
    
    func fetchETFData() async -> ETFWidgetData? {
        guard let widgetURL = URL(string: "\(APIConfig.baseURL)/api/etf-flow/widget") else {
            return nil
        }
        
        do {
            var request = URLRequest(url: widgetURL)
            request.cachePolicy = .reloadIgnoringLocalCacheData
            request.timeoutInterval = 10.0
            
            let (data, _) = try await URLSession.shared.data(for: request)
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
            
            // Извлекаем данные из ответа API
            let bitcoinData = json?["bitcoin"] as? [String: Any]
            let ethereumData = json?["ethereum"] as? [String: Any]
            let solanaData = json?["solana"] as? [String: Any]
            let overallData = json?["overall"] as? [String: Any]
            let chartData = json?["chart"] as? [String: Any]
            
            // Получаем суммарные активы
            let bitcoinTotalAssets = bitcoinData?["totalAssets"] as? Double ?? 0.0
            let ethereumTotalAssets = ethereumData?["totalAssets"] as? Double ?? 0.0
            let solanaTotalAssets = solanaData?["totalAssets"] as? Double ?? 0.0
            
            // Получаем дневные потоки
            let bitcoinDailyFlow = bitcoinData?["dailyFlow"] as? Double ?? 0.0
            let ethereumDailyFlow = ethereumData?["dailyFlow"] as? Double ?? 0.0
            let solanaDailyFlow = solanaData?["dailyFlow"] as? Double ?? 0.0
            let totalFlow = overallData?["totalFlow"] as? Double ?? 0.0
            
            // Получаем данные для графика
            let combinedDailyFlows = chartData?["combinedDailyFlows"] as? [Double] ?? []
            let bitcoinDailyFlows = chartData?["bitcoinDailyFlows"] as? [Double] ?? []
            let ethereumDailyFlows = chartData?["ethereumDailyFlows"] as? [Double] ?? []
            let solanaDailyFlows = chartData?["solanaDailyFlows"] as? [Double] ?? []
            
            // Пытаемся получить дату данных из API
            var dataDate = Date()
            if let bitcoinDateString = bitcoinData?["latestDate"] as? String {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                if let parsedDate = formatter.date(from: bitcoinDateString) {
                    dataDate = parsedDate
                }
            } else if let ethereumDateString = ethereumData?["latestDate"] as? String {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                if let parsedDate = formatter.date(from: ethereumDateString) {
                    dataDate = parsedDate
                }
            } else if let solanaDateString = solanaData?["latestDate"] as? String {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                if let parsedDate = formatter.date(from: solanaDateString) {
                    dataDate = parsedDate
                }
            }

            // Получаем данные по фондам
            let bitcoinFundFlowsDict = bitcoinData?["fundFlows"] as? [String: Any]
            let ethereumFundFlowsDict = ethereumData?["fundFlows"] as? [String: Any]
            let solanaFundFlowsDict = solanaData?["fundFlows"] as? [String: Any]
            
            // Отладочная информация
            if let btcFunds = bitcoinFundFlowsDict {
                print("📊 BTC Fund Flows: \(btcFunds)")
            }
            if let ethFunds = ethereumFundFlowsDict {
                print("📊 ETH Fund Flows: \(ethFunds)")
            }
            if let solFunds = solanaFundFlowsDict {
                print("📊 SOL Fund Flows: \(solFunds)")
            }
            
            let bitcoinFundFlows = bitcoinFundFlowsDict != nil ? FundFlows(from: bitcoinFundFlowsDict!) : nil
            let ethereumFundFlows = ethereumFundFlowsDict != nil ? FundFlows(from: ethereumFundFlowsDict!) : nil
            let solanaFundFlows = solanaFundFlowsDict != nil ? FundFlows(from: solanaFundFlowsDict!) : nil
            
            // Проверяем топ-фонды
            if let btcFunds = bitcoinFundFlows {
                let top = btcFunds.topFunds(limit: 3)
                print("📊 BTC Top Funds: \(top)")
            }

            return ETFWidgetData(
                totalFlow: totalFlow, // Общий дневной поток
                bitcoinFlow: bitcoinDailyFlow, // Дневной поток BTC
                ethereumFlow: ethereumDailyFlow, // Дневной поток ETH
                solanaFlow: solanaDailyFlow, // Дневной поток SOL
                bitcoinTotalAssets: bitcoinTotalAssets, // Суммарные активы BTC
                ethereumTotalAssets: ethereumTotalAssets, // Суммарные активы ETH
                solanaTotalAssets: solanaTotalAssets, // Суммарные активы SOL
                lastUpdated: Date(),
                dataDate: dataDate,
                isPositive: overallData?["isPositive"] as? Bool ?? true,
                last7DaysTotals: combinedDailyFlows, // дневные потоки для общего графика (10 дней)
                bitcoinDailyFlows: bitcoinDailyFlows, // дневные потоки BTC (10 дней)
                ethereumDailyFlows: ethereumDailyFlows, // дневные потоки ETH (10 дней)
                solanaDailyFlows: solanaDailyFlows, // дневные потоки SOL (10 дней)
                bitcoinFundFlows: bitcoinFundFlows,
                ethereumFundFlows: ethereumFundFlows,
                solanaFundFlows: solanaFundFlows
            )
        } catch {
            print("❌ Widget Error: \(error)")
            print("❌ Error details: \(error.localizedDescription)")
            return nil
        }
    }
}

