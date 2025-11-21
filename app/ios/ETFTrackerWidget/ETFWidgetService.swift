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
            
            // Пытаемся получить время последнего обновления из API
            var lastUpdated = Date()
            if let lastUpdatedString = overallData?["lastUpdated"] as? String {
                let iso8601Formatter = ISO8601DateFormatter()
                iso8601Formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                if let parsedDate = iso8601Formatter.date(from: lastUpdatedString) {
                    lastUpdated = parsedDate
                } else {
                    // Пробуем без fractional seconds
                    iso8601Formatter.formatOptions = [.withInternetDateTime]
                    if let parsedDate = iso8601Formatter.date(from: lastUpdatedString) {
                        lastUpdated = parsedDate
                    }
                }
            }
            
            // Получаем дату данных из API (latestDate из bitcoin, ethereum или solana)
            // Это дата, когда были зафиксированы потоки ETF, а не дата получения данных
            var dataDate: Date? = nil
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            dateFormatter.timeZone = TimeZone(identifier: "UTC")
            dateFormatter.locale = Locale(identifier: "en_US_POSIX")
            
            // Берем самую свежую дату из всех типов ETF
            let dates: [String?] = [
                bitcoinData?["latestDate"] as? String,
                ethereumData?["latestDate"] as? String,
                solanaData?["latestDate"] as? String
            ]
            
            for dateString in dates.compactMap({ $0 }) {
                if let parsedDate = dateFormatter.date(from: dateString) {
                    // Берем самую свежую дату
                    if dataDate == nil || parsedDate > dataDate! {
                        dataDate = parsedDate
                    }
                }
            }
            
            // Если не удалось получить дату из API, используем текущую дату
            let finalDataDate = dataDate ?? Date()

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
                lastUpdated: lastUpdated, // Время последнего обновления из API
                dataDate: finalDataDate, // Дата данных ETF (когда были зафиксированы потоки)
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

