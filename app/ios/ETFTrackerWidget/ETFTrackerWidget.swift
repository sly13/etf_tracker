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
        return "http://192.168.100.94:3066"
        #else
        return "http://192.168.100.94:3066" // Временно используем локальный IP
        #endif
    }
}

// Функция для определения цвета потока по знаку
func flowColor(_ value: Double) -> Color {
    return value >= 0 ? .green : .red
}

// Функция для форматирования даты в нужном формате
func formatUpdatedDate(_ dataDate: Date, _ lastUpdated: Date) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM.yy"
    
    let timeFormatter = DateFormatter()
    timeFormatter.dateFormat = "HH:mm"
    
    let dateString = dateFormatter.string(from: dataDate)
    let timeString = timeFormatter.string(from: lastUpdated)
    
    return "\(dateString) \(timeString)"
}

// Функция для форматирования только даты (без времени)
func formatDateOnly(_ dataDate: Date) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM.yy"
    
    return dateFormatter.string(from: dataDate)
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
    let bitcoinDailyFlows: [Double]
    let ethereumDailyFlows: [Double]
    
    static let placeholder = ETFWidgetData(
        totalFlow: 618.9,
        bitcoinFlow: 477.2,
        ethereumFlow: 141.7,
        bitcoinTotalAssets: 61942.9,
        ethereumTotalAssets: 24866.5,
        lastUpdated: Date(),
        dataDate: Date(),
        isPositive: true,
        last7DaysTotals: [618.9, -186.1, -598.9, -587.7, 65.5, 338.9, -754.9, 200.3, -150.2, 500.8],
        bitcoinDailyFlows: [477.2, -40.4, -366.6, -530.9, -104.1, 102.7, -326.4, 150.2, -200.3, 300.4],
        ethereumDailyFlows: [141.7, -145.7, -232.3, -56.8, 169.6, 236.2, -428.5, 100.1, -75.5, 200.4]
    )
}

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
            let overallData = json?["overall"] as? [String: Any]
            let chartData = json?["chart"] as? [String: Any]
            
            // Получаем суммарные активы
            let bitcoinTotalAssets = bitcoinData?["totalAssets"] as? Double ?? 0.0
            let ethereumTotalAssets = ethereumData?["totalAssets"] as? Double ?? 0.0
            
            // Получаем дневные потоки
            let bitcoinDailyFlow = bitcoinData?["dailyFlow"] as? Double ?? 0.0
            let ethereumDailyFlow = ethereumData?["dailyFlow"] as? Double ?? 0.0
            let totalFlow = overallData?["totalFlow"] as? Double ?? 0.0
            
            // Получаем данные для графика
            let combinedDailyFlows = chartData?["combinedDailyFlows"] as? [Double] ?? []
            let bitcoinDailyFlows = chartData?["bitcoinDailyFlows"] as? [Double] ?? []
            let ethereumDailyFlows = chartData?["ethereumDailyFlows"] as? [Double] ?? []
            
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
                totalFlow: totalFlow, // Общий дневной поток
                bitcoinFlow: bitcoinDailyFlow, // Дневной поток BTC
                ethereumFlow: ethereumDailyFlow, // Дневной поток ETH
                bitcoinTotalAssets: bitcoinTotalAssets, // Суммарные активы BTC
                ethereumTotalAssets: ethereumTotalAssets, // Суммарные активы ETH
                lastUpdated: Date(),
                dataDate: dataDate,
                isPositive: overallData?["isPositive"] as? Bool ?? true,
                last7DaysTotals: combinedDailyFlows, // дневные потоки для общего графика (10 дней)
                bitcoinDailyFlows: bitcoinDailyFlows, // дневные потоки BTC (10 дней)
                ethereumDailyFlows: ethereumDailyFlows // дневные потоки ETH (10 дней)
            )
        } catch {
            print("❌ Widget Error: \(error)")
            print("❌ Error details: \(error.localizedDescription)")
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
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
        case .systemMedium:
            MediumWidgetView(entry: entry)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
        default:
            SmallWidgetView(entry: entry)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
        }
    }
}

// Вид для маленького виджета
struct SmallWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(spacing: 0) {
            // BTC секция
            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("BTC")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.primary)
                    Text("Bitcoin ETF")
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 1) {
                    Text(String(format: "%+.1fM", entry.etfData.bitcoinFlow))
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(flowColor(entry.etfData.bitcoinFlow))
                    Text(String(format: "%.1fB", entry.etfData.bitcoinTotalAssets / 1_000))
                        .font(.system(size: 10))
                        .foregroundColor(.primary)
                }
            }
            .padding(.horizontal, 2)
            .padding(.vertical, 10)
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
            
            // ETH секция
            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("ETH")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.primary)
                    Text("Ethereum ETF")
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 1) {
                    Text(String(format: "%+.1fM", entry.etfData.ethereumFlow))
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(flowColor(entry.etfData.ethereumFlow))
                    Text(String(format: "%.1fB", entry.etfData.ethereumTotalAssets / 1_000))
                        .font(.system(size: 10))
                        .foregroundColor(.primary)
                }
            }
            .padding(.horizontal, 2)
            .padding(.vertical, 10)
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
            
            // Общий результат
            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Total")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.primary)
                    Text(formatDateOnly(entry.etfData.dataDate))
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Text(String(format: "%+.1fM", entry.etfData.totalFlow))
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(flowColor(entry.etfData.totalFlow))
            }
            .padding(.horizontal, 2)
            .padding(.vertical, 10)
            
        }
        .padding(.vertical, 10)
        .widgetURL(URL(string: "etfapp://open"))
    }
}

// Вид для среднего виджета
struct MediumWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(spacing: 0) {
            // BTC секция
            HStack(spacing: 12) {
                // BTC слева
                VStack(alignment: .leading, spacing: 4) {
                    Text("BTC")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.primary)
                    Text("Bitcoin ETF")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
                .frame(width: 100, alignment: .leading) // Фиксированная ширина
                
                Spacer()
                
                // Мини-график в центре
                MiniBarsView(values: entry.etfData.bitcoinDailyFlows)
                    .frame(width: 60, height: 30)
                
                Spacer()
                
                // Значение потока и суммарные активы справа
                VStack(alignment: .trailing, spacing: 2) {
                    Text(String(format: "%+.1fM", entry.etfData.bitcoinFlow))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(flowColor(entry.etfData.bitcoinFlow))
                    Text(String(format: "%.1fB", entry.etfData.bitcoinTotalAssets / 1_000))
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
                .padding(.vertical, 2)
            
            // ETH секция
            HStack(spacing: 12) {
                // ETH слева
                VStack(alignment: .leading, spacing: 4) {
                    Text("ETH")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.primary)
                    Text("Ethereum ETF")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
                .frame(width: 100, alignment: .leading) // Фиксированная ширина
                
                Spacer()
                
                // Мини-график в центре
                MiniBarsView(values: entry.etfData.ethereumDailyFlows)
                    .frame(width: 60, height: 30)
                
                Spacer()
                
                // Значение потока и суммарные активы справа
                VStack(alignment: .trailing, spacing: 2) {
                    Text(String(format: "%+.1fM", entry.etfData.ethereumFlow))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(flowColor(entry.etfData.ethereumFlow))
                    Text(String(format: "%.1fB", entry.etfData.ethereumTotalAssets / 1_000))
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
                .padding(.vertical, 2)
            
            // Inflow секция
            HStack(spacing: 12) {
                // Total текст и дата
                VStack(alignment: .leading, spacing: 2) {
                    Text("Total")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.primary)
                    Text(formatUpdatedDate(entry.etfData.dataDate, entry.etfData.lastUpdated))
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Общее значение
                Text(String(format: "%+.1fM", entry.etfData.totalFlow))
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(flowColor(entry.etfData.totalFlow))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
        }
        .padding(.vertical, 6) // 👉 добавь этот отступ
        .widgetURL(URL(string: "etfapp://open"))
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
            let spacing = geometry.size.width / CGFloat(max(values.count, 1)) * 0.3

            HStack(alignment: .bottom, spacing: spacing) {
                // Переворачиваем массив, чтобы последние данные были справа
                ForEach(Array(values.reversed().enumerated()), id: \.offset) { item in
                    let value = item.element
                    // Высота бара всегда отсчитывается от низа
                    let height = CGFloat(abs(value) / maxAbsValue) * geometry.size.height * 0.9
                    let color: Color = value >= 0 ? .green : .red
                    
                    Rectangle()
                        .fill(color)
                        .frame(width: barWidth, height: max(height, 1)) // Минимальная высота 1 пиксель
                        .cornerRadius(barWidth / 4) // Закругленные углы
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
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
                    .containerBackground(for: .widget) { Color.black }
            } else {
                ETFTrackerWidgetEntryView(entry: entry)
                    .padding(8)
                    .background(Color.black)
                    .cornerRadius(12)
            }
        }
        .contentMarginsDisabled() // 🔥 отключает системные паддинги
        .configurationDisplayName("Crypto ETF Flow")
        .description("Отслеживает потоки Bitcoin и Ethereum ETF")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}


#Preview(as: .systemMedium) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
}
