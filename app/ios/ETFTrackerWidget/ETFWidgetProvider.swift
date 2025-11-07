//
//  ETFWidgetProvider.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import WidgetKit

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
                // При изменении размера виджета iOS автоматически запросит новый timeline
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

