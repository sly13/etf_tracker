//
//  ETFTrackerWidget.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import WidgetKit
import SwiftUI

struct APIConfig {
    static var baseURL: String {
        #if DEBUG
        return "http://localhost:3066"
        #else
        return "https://api-etf.vadimsemenko.ru"
        #endif
    }
}

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
    let bitcoinTotalAssets: Double
    let ethereumTotalAssets: Double
    let lastUpdated: Date
    let dataDate: Date
    let isPositive: Bool
    let last7DaysTotals: [Double]
    
    static let placeholder = ETFWidgetData(
        totalFlow: -365.5,
        bitcoinFlow: -201.3,
        ethereumFlow: -164.2,
        bitcoinTotalAssets: 3520548397122.5,
        ethereumTotalAssets: 3520548382366.1,
        lastUpdated: Date(),
        dataDate: Date(),
        isPositive: false,
        last7DaysTotals: [120, -80, 60, -30, 150, 40, -20]
    )
}

// Сервис для загрузки данных
class ETFWidgetService {
    static let shared = ETFWidgetService()
    
    func fetchETFData() async -> ETFWidgetData? {
        guard let summaryURL = URL(string: "\(APIConfig.baseURL)/api/etf-flow/summary"),
              let last7URL = URL(string: "\(APIConfig.baseURL)/api/etf-flow/last7") else {
            return nil
        }
        
        do {
            async let summaryTask: (Data, URLResponse) = URLSession.shared.data(from: summaryURL)
            async let last7Task: (Data, URLResponse) = URLSession.shared.data(from: last7URL)

            let (summaryData, _) = try await summaryTask
            let json = try JSONSerialization.jsonObject(with: summaryData) as? [String: Any]
            
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
            
            // Считываем последние 7 дней для мини-графика из нового эндпоинта
            let (last7Data, _) = try await last7Task
            let last7Json = try JSONSerialization.jsonObject(with: last7Data) as? [String: Any]
            
            // Извлекаем данные из новой структуры
            let ethData = last7Json?["ethereum"] as? [String: Any]
            let btcData = last7Json?["bitcoin"] as? [String: Any]
            let chartData = last7Json?["chart"] as? [String: Any]
            
            // Получаем суммарные активы и дневные потоки
            let ethereumTotalAssets = ethData?["totalAssets"] as? Double ?? 0.0
            let bitcoinTotalAssets = btcData?["totalAssets"] as? Double ?? 0.0
            let ethereumDailyFlow = ethData?["dailyFlow"] as? Double ?? 0.0
            let bitcoinDailyFlow = btcData?["dailyFlow"] as? Double ?? 0.0
            
            // Данные для графика - объединяем ETH и BTC потоки
            let ethereumDailyFlows = chartData?["ethereumDailyFlows"] as? [Double] ?? []
            let bitcoinDailyFlows = chartData?["bitcoinDailyFlows"] as? [Double] ?? []
            
            // Объединяем потоки ETH и BTC для общего графика
            var combinedDailyFlows: [Double] = []
            let maxLength = max(ethereumDailyFlows.count, bitcoinDailyFlows.count)
            for i in 0..<maxLength {
                let ethFlow = i < ethereumDailyFlows.count ? ethereumDailyFlows[i] : 0.0
                let btcFlow = i < bitcoinDailyFlows.count ? bitcoinDailyFlows[i] : 0.0
                combinedDailyFlows.append(ethFlow + btcFlow)
            }

            return ETFWidgetData(
                totalFlow: ethereumDailyFlow + bitcoinDailyFlow, // Общий дневной поток
                bitcoinFlow: bitcoinDailyFlow, // Дневной поток BTC
                ethereumFlow: ethereumDailyFlow, // Дневной поток ETH
                bitcoinTotalAssets: bitcoinTotalAssets, // Суммарные активы BTC
                ethereumTotalAssets: ethereumTotalAssets, // Суммарные активы ETH
                lastUpdated: Date(),
                dataDate: dataDate,
                isPositive: (ethereumDailyFlow + bitcoinDailyFlow) >= 0,
                last7DaysTotals: combinedDailyFlows // дневные потоки для графика
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
            VStack(spacing: 10) {
                // Верхняя строка только с общим потоком
                HStack {
                    Spacer()
                    Text(String(format: "%.1fM", entry.etfData.totalFlow))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
                // Мини-график за 7 дней
                MiniBarsView(values: entry.etfData.last7DaysTotals)
                    .frame(height: 26)
                // Низ с разбивкой BTC/ETH в стиле финансового виджета
                VStack(spacing: 6) {
                    // BTC строка
                    HStack {
                        // Иконка и название
                        HStack(spacing: 4) {
                            Image(systemName: "triangle.fill")
                                .font(.system(size: 8))
                                .foregroundColor(.green)
                            VStack(alignment: .leading, spacing: 1) {
                                Text("BTC-ETF")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(.primary)
                                Text("Bitcoin ETF")
                                    .font(.system(size: 9))
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                        
                        // Мини-график (простая линия)
                        MiniLineChart(values: entry.etfData.last7DaysTotals.map { $0 / 100 }) // масштабируем для мини-графика
                            .frame(width: 30, height: 12)
                        
                        Spacer()
                        
                        // Значения
                        VStack(alignment: .trailing, spacing: 1) {
                            Text(String(format: "%.1fB", entry.etfData.bitcoinTotalAssets / 1_000_000_000))
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.primary)
                            Text(String(format: "%.0fM", entry.etfData.bitcoinFlow))
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(entry.etfData.bitcoinFlow >= 0 ? .green : .red)
                        }
                    }
                    
                    // ETH строка
                    HStack {
                        // Иконка и название
                        HStack(spacing: 4) {
                            Image(systemName: "triangle.fill")
                                .font(.system(size: 8))
                                .foregroundColor(.green)
                            VStack(alignment: .leading, spacing: 1) {
                                Text("ETH-ETF")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(.primary)
                                Text("Ethereum ETF")
                                    .font(.system(size: 9))
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                        
                        // Мини-график (простая линия)
                        MiniLineChart(values: entry.etfData.last7DaysTotals.map { $0 / 100 }) // масштабируем для мини-графика
                            .frame(width: 30, height: 12)
                        
                        Spacer()
                        
                        // Значения
                        VStack(alignment: .trailing, spacing: 1) {
                            Text(String(format: "%.1fB", entry.etfData.ethereumTotalAssets / 1_000_000_000))
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.primary)
                            Text(String(format: "%.0fM", entry.etfData.ethereumFlow))
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(entry.etfData.ethereumFlow >= 0 ? .green : .red)
                        }
                    }
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
            VStack(spacing: 10) {
                // Верхняя строка только с общим потоком
                HStack {
                    Spacer()
                    Text(String(format: "%.1fM", entry.etfData.totalFlow))
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(entry.etfData.isPositive ? .green : .red)
                }
                MiniBarsView(values: entry.etfData.last7DaysTotals)
                    .frame(height: 36)
                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        // BTC суммарные активы и дневной поток
                        VStack(alignment: .leading, spacing: 2) {
                            HStack {
                                Text("BTC")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.secondary)
                                Text(String(format: "%.1fB", entry.etfData.bitcoinTotalAssets / 1_000_000_000))
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.primary)
                            }
                            Text(String(format: "%.0fM", entry.etfData.bitcoinFlow))
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(entry.etfData.bitcoinFlow >= 0 ? .green : .red)
                        }
                        // ETH суммарные активы и дневной поток
                        VStack(alignment: .leading, spacing: 2) {
                            HStack {
                                Text("ETH")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.secondary)
                                Text(String(format: "%.1fB", entry.etfData.ethereumTotalAssets / 1_000_000_000))
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.primary)
                            }
                            Text(String(format: "%.0fM", entry.etfData.ethereumFlow))
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(entry.etfData.ethereumFlow >= 0 ? .green : .red)
                        }
                    }
                    Spacer()
                    Text(formatUpdatedDate(entry.etfData.dataDate, entry.etfData.lastUpdated))
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
            }
            .padding(16)
        }
    }
}

// Мини-график столбиками: положительные зелёные, отрицательные красные
struct MiniBarsView: View {
    let values: [Double]

    private var maxAbsValue: Double {
        max(values.map { abs($0) }.max() ?? 1.0, 1.0)
    }

    var body: some View {
        GeometryReader { geometry in
            let barWidth = geometry.size.width / CGFloat(max(values.count, 1)) * 0.7
            let centerY = geometry.size.height / 2

            ZStack(alignment: .center) {
                Capsule()
                    .fill(Color.secondary.opacity(0.2))
                    .frame(height: 1)
                    .offset(y: 0)

                HStack(alignment: .bottom, spacing: geometry.size.width / CGFloat(max(values.count, 1)) * 0.3) {
                    ForEach(Array(values.enumerated()), id: \.offset) { item in
                        let value = item.element
                        let height = CGFloat(abs(value) / maxAbsValue) * (geometry.size.height / 2)
                        let color: Color = value >= 0 ? .green : .red
                        Rectangle()
                            .fill(color)
                            .frame(width: barWidth, height: height)
                            .offset(y: value >= 0 ? -height/2 : height/2)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                .offset(y: 0)
                .overlay(
                    Rectangle()
                        .fill(Color.secondary.opacity(0.15))
                        .frame(height: 1)
                        .position(x: geometry.size.width/2, y: centerY)
                )
            }
        }
    }
}

// Мини-график линией для отдельных активов
struct MiniLineChart: View {
    let values: [Double]
    
    private var maxValue: Double {
        values.max() ?? 1.0
    }
    
    private var minValue: Double {
        values.min() ?? 0.0
    }
    
    private var range: Double {
        maxValue - minValue
    }
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            
            Path { path in
                guard values.count > 1 else { return }
                
                let stepX = width / CGFloat(values.count - 1)
                
                for (index, value) in values.enumerated() {
                    let x = CGFloat(index) * stepX
                    let normalizedValue = range > 0 ? (value - minValue) / range : 0.5
                    let y = height - (CGFloat(normalizedValue) * height)
                    
                    if index == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            .stroke(Color.red, lineWidth: 1.5)
            .frame(width: width, height: height)
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
        .configurationDisplayName("Crypto ETF Flow")
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
        bitcoinTotalAssets: 3520548397122.5,
        ethereumTotalAssets: 3520548382366.1,
        lastUpdated: .now,
        dataDate: .now,
        isPositive: false,
        last7DaysTotals: [100, -50, 80, -20, 60, 40, -10]
    ))
}

#Preview(as: .systemMedium) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
}
