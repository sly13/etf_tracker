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
        return "http://192.168.100.94:3066"
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

