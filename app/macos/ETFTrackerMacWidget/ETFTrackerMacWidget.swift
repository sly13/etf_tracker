//
//  ETFTrackerMacWidget.swift
//  ETFTrackerMacWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import WidgetKit
import SwiftUI

// Модель данных для ETF (потоки за день)
struct ETFMacWidgetData {
    let totalFlow: Double
    let bitcoinFlow: Double
    let ethereumFlow: Double
    let lastUpdated: Date
    let dataDate: Date
    let isPositive: Bool
    
    static let placeholder = ETFMacWidgetData(
        totalFlow: 1250.5,
        bitcoinFlow: 850.2,
        ethereumFlow: 400.3,
        lastUpdated: Date(),
        dataDate: Date(),
        isPositive: true
    )
}

// Сервис для загрузки данных
class ETFMacWidgetService {
    static let shared = ETFMacWidgetService()
    private let baseURL = "https://etf-flow.vadimsemenko.ru"
    
    func fetchETFData() async -> ETFMacWidgetData? {
        guard let url = URL(string: "\(baseURL)/api/etf-flow/summary") else {
            return nil
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
            
            // Извлекаем данные из ответа API
            let bitcoinData = json?["bitcoin"] as? [String: Any]
            let ethereumData = json?["ethereum"] as? [String: Any]
            
            // Получаем потоки (flows) для отображения
            let bitcoinFlow = bitcoinData?["total"] as? Double ?? 0.0
            let ethereumFlow = ethereumData?["total"] as? Double ?? 0.0
            let totalFlow = bitcoinFlow + ethereumFlow
            
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
            }
            
            return ETFMacWidgetData(
                totalFlow: totalFlow,
                bitcoinFlow: bitcoinFlow,
                ethereumFlow: ethereumFlow,
                lastUpdated: Date(),
                dataDate: dataDate,
                isPositive: totalFlow >= 0
            )
        } catch {
            print("Ошибка загрузки данных виджета: \(error)")
            return nil
        }
    }
}

struct MacProvider: TimelineProvider {
    func placeholder(in context: Context) -> MacSimpleEntry {
        MacSimpleEntry(date: Date(), etfData: ETFMacWidgetData.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (MacSimpleEntry) -> ()) {
        let entry = MacSimpleEntry(date: Date(), etfData: ETFMacWidgetData.placeholder)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            var entries: [MacSimpleEntry] = []
            let currentDate = Date()
            
            // Пытаемся загрузить реальные данные
            if let realData = await ETFMacWidgetService.shared.fetchETFData() {
                let entry = MacSimpleEntry(date: currentDate, etfData: realData)
                entries.append(entry)
                
                // Создаем timeline с обновлением каждый час
                let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!))
                completion(timeline)
            } else {
                // Если не удалось загрузить данные, используем placeholder
                let entry = MacSimpleEntry(date: currentDate, etfData: ETFMacWidgetData.placeholder)
                entries.append(entry)
                
                let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!))
                completion(timeline)
            }
        }
    }
}

struct MacSimpleEntry: TimelineEntry {
    let date: Date
    let etfData: ETFMacWidgetData
}

struct ETFTrackerMacWidgetEntryView : View {
    var entry: MacProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            MacSmallWidgetView(entry: entry)
        case .systemMedium:
            MacMediumWidgetView(entry: entry)
        case .systemLarge:
            MacLargeWidgetView(entry: entry)
        default:
            MacSmallWidgetView(entry: entry)
        }
    }
}

// Вид для маленького виджета macOS
struct MacSmallWidgetView: View {
    var entry: MacProvider.Entry
    
    var body: some View {
        VStack(spacing: 12) {
            // Заголовок
            HStack {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .foregroundColor(.blue)
                    .font(.system(size: 16))
                Text("ETF Flow")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
            }
            
            // Основные данные
            VStack(spacing: 8) {
                // Общий поток
                VStack(alignment: .leading, spacing: 4) {
                    Text("Total Flow")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.totalFlow, specifier: "%.1f")M")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
                
                // Индикатор направления
                HStack {
                    Image(systemName: entry.etfData.isPositive ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                        .font(.system(size: 18))
                    
                    Text(entry.etfData.isPositive ? "Inflow" : "Outflow")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                    
                    Spacer()
                }
            }
            
            Spacer()
            
            // Время обновления
            HStack {
                Text("Updated: \(entry.etfData.lastUpdated, style: .time)")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                Spacer()
            }
        }
        .padding(16)
        .background(Color(NSColor.windowBackgroundColor))
    }
}

// Вид для среднего виджета macOS
struct MacMediumWidgetView: View {
    var entry: MacProvider.Entry
    
    var body: some View {
        HStack(spacing: 20) {
            // Левая часть - основная информация
            VStack(alignment: .leading, spacing: 12) {
                // Заголовок
                HStack {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .foregroundColor(.blue)
                        .font(.system(size: 20))
                    Text("ETF Flow Tracker")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.primary)
                    Spacer()
                }
                
                // Общий поток
                VStack(alignment: .leading, spacing: 6) {
                    Text("Total Flow")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.totalFlow, specifier: "%.1f")M")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
                
                // Индикатор направления
                HStack {
                    Image(systemName: entry.etfData.isPositive ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                        .font(.system(size: 22))
                    
                    Text(entry.etfData.isPositive ? "Inflow" : "Outflow")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
            }
            
            // Правая часть - детали по криптовалютам
            VStack(alignment: .trailing, spacing: 16) {
                // Bitcoin
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Bitcoin")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.bitcoinFlow, specifier: "%.1f")M")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.orange)
                }
                
                // Ethereum
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Ethereum")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.ethereumFlow, specifier: "%.1f")M")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.purple)
                }
                
                // Дата данных
                Text("Data: \(entry.etfData.dataDate, style: .date)")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                
                // Время обновления
                Text("Updated: \(entry.etfData.lastUpdated, style: .time)")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
            }
        }
        .padding(20)
        .background(Color(NSColor.windowBackgroundColor))
    }
}

// Вид для большого виджета macOS
struct MacLargeWidgetView: View {
    var entry: MacProvider.Entry
    
    var body: some View {
        VStack(spacing: 20) {
            // Заголовок
            HStack {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .foregroundColor(.blue)
                    .font(.system(size: 24))
                Text("ETF Flow Tracker")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.primary)
                Spacer()
            }
            
            // Основная информация
            VStack(spacing: 16) {
                // Общий поток
                VStack(alignment: .leading, spacing: 8) {
                    Text("Total Flow")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.totalFlow, specifier: "%.1f")M")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
                
                // Индикатор направления
                HStack {
                    Image(systemName: entry.etfData.isPositive ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                        .font(.system(size: 28))
                    
                    Text(entry.etfData.isPositive ? "Inflow" : "Outflow")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                    
                    Spacer()
                }
            }
            
            // Детали по криптовалютам
            HStack(spacing: 40) {
                // Bitcoin
                VStack(alignment: .leading, spacing: 6) {
                    Text("Bitcoin")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.bitcoinFlow, specifier: "%.1f")M")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.orange)
                }
                
                // Ethereum
                VStack(alignment: .leading, spacing: 6) {
                    Text("Ethereum")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("$\(entry.etfData.ethereumFlow, specifier: "%.1f")M")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.purple)
                }
                
                Spacer()
            }
            
            Spacer()
            
            // Информация о времени
            HStack {
                Text("Data: \(entry.etfData.dataDate, style: .date)")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("Updated: \(entry.etfData.lastUpdated, style: .time)")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
        }
        .padding(24)
        .background(Color(NSColor.windowBackgroundColor))
    }
}

struct ETFTrackerMacWidget: Widget {
    let kind: String = "ETFTrackerMacWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MacProvider()) { entry in
            ETFTrackerMacWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("ETF Flow Tracker")
        .description("Отслеживает потоки Bitcoin и Ethereum ETF")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    ETFTrackerMacWidget()
} timeline: {
    MacSimpleEntry(date: .now, etfData: ETFMacWidgetData.placeholder)
    MacSimpleEntry(date: .now, etfData: ETFMacWidgetData(
        totalFlow: 980.2,
        bitcoinFlow: 650.1,
        ethereumFlow: 330.1,
        lastUpdated: .now,
        dataDate: .now,
        isPositive: false
    ))
}

#Preview(as: .systemMedium) {
    ETFTrackerMacWidget()
} timeline: {
    MacSimpleEntry(date: .now, etfData: ETFMacWidgetData.placeholder)
}

#Preview(as: .systemLarge) {
    ETFTrackerMacWidget()
} timeline: {
    MacSimpleEntry(date: .now, etfData: ETFMacWidgetData.placeholder)
}
