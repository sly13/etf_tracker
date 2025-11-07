//
//  ETFWidgetComponents.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import SwiftUI

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




