import WidgetKit
import SwiftUI

struct ETFTrackerWidget: Widget {
    let kind: String = "ETFTrackerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ETFTrackerTimelineProvider()) { entry in
            ETFTrackerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("ETF Tracker")
        .description("Отслеживает потоки ETF Bitcoin и Ethereum")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct ETFTrackerTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> ETFTrackerEntry {
        ETFTrackerEntry(
            date: Date(),
            ethereumTotal: 1876.3,
            bitcoinTotal: 6.4,
            overallTotal: 1882.7,
            ethereumChange: 12.5,
            bitcoinChange: -3.2
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ETFTrackerEntry) -> ()) {
        let entry = ETFTrackerEntry(
            date: Date(),
            ethereumTotal: 1876.3,
            bitcoinTotal: 6.4,
            overallTotal: 1882.7,
            ethereumChange: 12.5,
            bitcoinChange: -3.2
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // Обновляем виджет каждые 15 минут
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        
        let entry = ETFTrackerEntry(
            date: currentDate,
            ethereumTotal: 1876.3,
            bitcoinTotal: 6.4,
            overallTotal: 1882.7,
            ethereumChange: 12.5,
            bitcoinChange: -3.2
        )
        
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
}

struct ETFTrackerEntry: TimelineEntry {
    let date: Date
    let ethereumTotal: Double
    let bitcoinTotal: Double
    let overallTotal: Double
    let ethereumChange: Double
    let bitcoinChange: Double
}

struct ETFTrackerWidgetEntryView: View {
    var entry: ETFTrackerTimelineProvider.Entry
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

struct SmallWidgetView: View {
    let entry: ETFTrackerEntry
    
    var body: some View {
        VStack(spacing: 8) {
            // Заголовок
            HStack {
                Text("ETF Tracker")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Spacer()
            }
            
            // Общий поток
            VStack(spacing: 4) {
                Text("Общий поток")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.8))
                
                Text("$\(entry.overallTotal, specifier: "%.1f")M")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            // Изменения
            HStack(spacing: 12) {
                VStack(spacing: 2) {
                    Text("ETH")
                        .font(.caption2)
                        .foregroundColor(.blue)
                    Text("\(entry.ethereumChange, specifier: "%.1f")")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(entry.ethereumChange >= 0 ? .green : .red)
                }
                
                VStack(spacing: 2) {
                    Text("BTC")
                        .font(.caption2)
                        .foregroundColor(.orange)
                    Text("\(entry.bitcoinChange, specifier: "%.1f")")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(entry.bitcoinChange >= 0 ? .green : .red)
                }
            }
        }
        .padding(12)
        .background(
            LinearGradient(
                colors: [Color.blue.opacity(0.8), Color.purple.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

struct MediumWidgetView: View {
    let entry: ETFTrackerEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Левая часть - общий поток
            VStack(alignment: .leading, spacing: 8) {
                Text("ETF Tracker")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Общий поток")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Text("$\(entry.overallTotal, specifier: "%.1f")M")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                Spacer()
            }
            
            // Правая часть - детали
            VStack(spacing: 12) {
                // Ethereum
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Ethereum")
                            .font(.caption)
                            .foregroundColor(.blue)
                        Text("$\(entry.ethereumTotal, specifier: "%.1f")M")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Text("\(entry.ethereumChange, specifier: "%.1f")")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(entry.ethereumChange >= 0 ? .green : .red)
                }
                
                // Bitcoin
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Bitcoin")
                            .font(.caption)
                            .foregroundColor(.orange)
                        Text("$\(entry.bitcoinTotal, specifier: "%.1f")M")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Text("\(entry.bitcoinChange, specifier: "%.1f")")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(entry.bitcoinChange >= 0 ? .green : .red)
                }
                
                Spacer()
            }
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [Color.blue.opacity(0.8), Color.purple.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

@main
struct ETFTrackerWidgetBundle: WidgetBundle {
    var body: some Widget {
        ETFTrackerWidget()
    }
}
