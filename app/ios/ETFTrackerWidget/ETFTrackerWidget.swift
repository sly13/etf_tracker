//
//  ETFTrackerWidget.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import WidgetKit
import SwiftUI

// Функция для форматирования даты в нужном формате
func formatUpdatedDate(_ dataDate: Date, _ lastUpdated: Date) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM.yy"
    
    let timeFormatter = DateFormatter()
    timeFormatter.dateFormat = "HH:mm"
    
    let dateString = dateFormatter.string(from: dataDate)
    let timeString = timeFormatter.string(from: lastUpdated)
    
    return "Updated: \(dateString) \(timeString)"
}

// Модель данных для ETF (потоки за день)
struct ETFWidgetData {
    let totalFlow: Double
    let bitcoinFlow: Double
    let ethereumFlow: Double
    let lastUpdated: Date
    let dataDate: Date
    let isPositive: Bool
    
    static let placeholder = ETFWidgetData(
        totalFlow: 1250.5,
        bitcoinFlow: 850.2,
        ethereumFlow: 400.3,
        lastUpdated: Date(),
        dataDate: Date(),
        isPositive: true
    )
}

// Сервис для загрузки данных
class ETFWidgetService {
    static let shared = ETFWidgetService()
    private let baseURL = "https://api-etf.vadimsemenko.ru"
    
    func fetchETFData() async -> ETFWidgetData? {
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
            
            return ETFWidgetData(
                totalFlow: totalFlow,
                bitcoinFlow: bitcoinFlow, // Используем потоки за день
                ethereumFlow: ethereumFlow, // Используем потоки за день
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

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), etfData: ETFWidgetData.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        // Для снапшота используем тестовые данные
        let entry = SimpleEntry(date: Date(), etfData: ETFWidgetData.placeholder)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            var entries: [SimpleEntry] = []
            let currentDate = Date()
            
            // Пытаемся загрузить реальные данные
            if let realData = await ETFWidgetService.shared.fetchETFData() {
                let entry = SimpleEntry(date: currentDate, etfData: realData)
                entries.append(entry)
                
                // Создаем timeline с обновлением каждый час
                let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!))
                completion(timeline)
            } else {
                // Если не удалось загрузить данные, используем placeholder
                let entry = SimpleEntry(date: currentDate, etfData: ETFWidgetData.placeholder)
                entries.append(entry)
                
                let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!))
                completion(timeline)
            }
        }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let etfData: ETFWidgetData
}

struct ETFTrackerWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// Вид для маленького виджета
struct SmallWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        Link(destination: URL(string: "etfapp://open")!) {
            VStack(spacing: 8) {
            // Заголовок
            HStack {
                Text("ETF Flow")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
            }
            
            // Основные данные
            VStack(spacing: 6) {
                // Bitcoin поток
                HStack {
                    Text("BTC:")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(entry.etfData.bitcoinFlow, specifier: "%.1f")M")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(entry.etfData.bitcoinFlow >= 0 ? .green : .red)
                }
                
                // Ethereum поток
                HStack {
                    Text("ETH:")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(entry.etfData.ethereumFlow, specifier: "%.1f")M")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(entry.etfData.ethereumFlow >= 0 ? .green : .red)
                }
                
                // Общий поток
                HStack {
                    Text("Total:")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(entry.etfData.totalFlow, specifier: "%.1f")M")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
            }
            
            Spacer()
            
            // Индикатор направления
            HStack {
                Image(systemName: entry.etfData.isPositive ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                    .foregroundColor(entry.etfData.isPositive ? .green : .red)
                    .font(.system(size: 16))
                
                Text(entry.etfData.isPositive ? "Inflow" : "Outflow")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(entry.etfData.isPositive ? .green : .red)
                
                Spacer()
                
                // Время обновления
                Text(entry.etfData.lastUpdated, style: .time)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
        }
        .padding(12)
        }
    }
}

// Вид для среднего виджета
struct MediumWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        Link(destination: URL(string: "etfapp://open")!) {
            HStack(spacing: 16) {
            // Левая часть - основная информация
            VStack(alignment: .leading, spacing: 8) {
                // Заголовок
                HStack {
                    Text("ETF Flow Tracker")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.primary)
                    Spacer()
                }
                
                // Общий поток
                VStack(alignment: .leading, spacing: 4) {
                    Text("Total Flow")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(entry.etfData.totalFlow, specifier: "%.1f")M")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
                
                // Индикатор направления
                HStack {
                    Image(systemName: entry.etfData.isPositive ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                        .font(.system(size: 20))
                    
                    Text(entry.etfData.isPositive ? "Inflow" : "Outflow")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
            }
            
            // Правая часть - детали по криптовалютам
            VStack(alignment: .trailing, spacing: 12) {
                // Bitcoin
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Bitcoin")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(entry.etfData.bitcoinFlow, specifier: "%.1f")M")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(entry.etfData.bitcoinFlow >= 0 ? .green : .red)
                }
                
                // Ethereum
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Ethereum")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(entry.etfData.ethereumFlow, specifier: "%.1f")M")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(entry.etfData.ethereumFlow >= 0 ? .green : .red)
                }
                
                // Обновленная дата и время
                Text(formatUpdatedDate(entry.etfData.dataDate, entry.etfData.lastUpdated))
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
        }
        .padding(16)
        }
    }
}

struct ETFTrackerWidget: Widget {
    let kind: String = "ETFTrackerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                ETFTrackerWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                ETFTrackerWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("ETF Flow Tracker")
        .description("Отслеживает потоки Bitcoin и Ethereum ETF")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
    SimpleEntry(date: .now, etfData: ETFWidgetData(
        totalFlow: 980.2,
        bitcoinFlow: 650.1,
        ethereumFlow: 330.1,
        lastUpdated: .now,
        dataDate: .now,
        isPositive: false
    ))
}

#Preview(as: .systemMedium) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
}
