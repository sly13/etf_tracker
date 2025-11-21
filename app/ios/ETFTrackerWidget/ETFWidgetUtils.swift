//
//  ETFWidgetUtils.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import SwiftUI
import Foundation

struct APIConfig {
    static var baseURL: String {
        // DEBUG флаг теперь установлен и для Debug, и для Profile конфигураций
        // Это позволяет использовать dev URL при запуске через flutter run
        #if DEBUG
        // return "http://192.168.100.94:3066"
        return "https://api-etf.vadimsemenko.ru"
        #else
        return "https://api-etf.vadimsemenko.ru"
        #endif
    }
}

// Функция для определения цвета потока по знаку
func flowColor(_ value: Double) -> Color {
    return value >= 0 ? .green : .red
}

// Функция для форматирования даты в нужном формате
// dataDate - дата данных ETF (когда были зафиксированы потоки, например "2025-11-20")
// lastUpdated - время последнего обновления данных на сервере
func formatUpdatedDate(_ dataDate: Date, _ lastUpdated: Date) -> String {
    // Форматируем дату данных в локальной timezone пользователя
    // dataDate - это дата, когда были зафиксированы потоки ETF (из latestDate API)
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM.yy"
    dateFormatter.timeZone = TimeZone.current
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    
    // Форматируем время последнего обновления в локальном timezone
    // lastUpdated - это время, когда сервер обновил данные (из overall.lastUpdated API)
    let timeFormatter = DateFormatter()
    timeFormatter.dateFormat = "HH:mm"
    timeFormatter.timeZone = TimeZone.current
    timeFormatter.locale = Locale(identifier: "en_US_POSIX")
    
    let dateString = dateFormatter.string(from: dataDate)
    let timeString = timeFormatter.string(from: lastUpdated)
    
    // Формат: "20.11.25 20:20" - дата данных и время обновления
    return "\(dateString) \(timeString)"
}

// Функция для форматирования только даты (без времени)
func formatDateOnly(_ dataDate: Date) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM.yy"
    dateFormatter.timeZone = TimeZone.current
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    
    return dateFormatter.string(from: dataDate)
}

// Функция для форматирования потока: если > 1000M, то показываем в миллиардах
func formatFlow(_ value: Double) -> String {
    let absValue = abs(value)
    if absValue >= 1000 {
        let billions = value / 1000
        return String(format: "%+.1fB", billions)
    } else {
        return String(format: "%+.1fM", value)
    }
}

