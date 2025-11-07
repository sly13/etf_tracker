//
//  ETFTrackerWidget.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import WidgetKit
import SwiftUI

struct ETFTrackerWidget: Widget {
    let kind: String = "ETFTrackerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                ETFTrackerWidgetEntryView(entry: entry)
                    .containerBackground(for: .widget) {
                        // Адаптивный фон: темный в темной теме, светлый в светлой
                        Color(UIColor.systemBackground)
                    }
            } else {
                ETFTrackerWidgetEntryView(entry: entry)
                    .padding(8)
                    .background(Color(UIColor.systemBackground))
                    .cornerRadius(12)
            }
        }
        .contentMarginsDisabled() // 🔥 отключает системные паддинги
        .configurationDisplayName("Crypto ETFs Flow")
        .description("Отслеживает потоки Bitcoin, Ethereum и Solana ETF")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
}

#Preview(as: .systemMedium) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
}

#Preview(as: .systemLarge) {
    ETFTrackerWidget()
} timeline: {
    SimpleEntry(date: .now, etfData: ETFWidgetData.placeholder)
}
