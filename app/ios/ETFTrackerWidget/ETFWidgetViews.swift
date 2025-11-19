//
//  ETFWidgetViews.swift
//  ETFTrackerWidget
//
//  Created by Vadim Semenko on 31/08/25.
//

import SwiftUI
import WidgetKit

struct ETFTrackerWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    @ViewBuilder
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
        case .systemLarge:
            LargeWidgetView(entry: entry)
        @unknown default:
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
            Link(destination: URL(string: "etfapp://crypto-etf?tab=btc")!) {
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
            }
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
            
            // ETH секция
            Link(destination: URL(string: "etfapp://crypto-etf?tab=eth")!) {
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
            }
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
            
            // SOL секция
            Link(destination: URL(string: "etfapp://crypto-etf?tab=sol")!) {
                HStack(spacing: 8) {
                    VStack(alignment: .leading, spacing: 1) {
                        Text("SOL")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.primary)
                        Text("Solana ETF")
                            .font(.system(size: 9))
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 1) {
                        Text(String(format: "%+.1fM", entry.etfData.solanaFlow))
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(flowColor(entry.etfData.solanaFlow))
                        Text(String(format: "%.1fB", entry.etfData.solanaTotalAssets / 1_000))
                            .font(.system(size: 10))
                            .foregroundColor(.primary)
                    }
                }
                .padding(.horizontal, 2)
                .padding(.vertical, 10)
            }
            
        }
        .padding(.vertical, 10)
    }
}

// Вид для среднего виджета
struct MediumWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(spacing: 0) {
            // BTC секция
            Link(destination: URL(string: "etfapp://crypto-etf?tab=btc")!) {
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
            }
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
                .padding(.vertical, 2)
            
            // ETH секция
            Link(destination: URL(string: "etfapp://crypto-etf?tab=eth")!) {
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
            }
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
                .padding(.vertical, 2)
            
            // SOL секция
            Link(destination: URL(string: "etfapp://crypto-etf?tab=sol")!) {
                HStack(spacing: 12) {
                    // SOL слева
                    VStack(alignment: .leading, spacing: 4) {
                        Text("SOL")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.primary)
                        Text("Solana ETF")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                    .frame(width: 100, alignment: .leading) // Фиксированная ширина
                    
                    Spacer()
                    
                    // Мини-график в центре
                    MiniBarsView(values: entry.etfData.solanaDailyFlows)
                        .frame(width: 60, height: 30)
                    
                    Spacer()
                    
                    // Значение потока и суммарные активы справа
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(format: "%+.1fM", entry.etfData.solanaFlow))
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(flowColor(entry.etfData.solanaFlow))
                        Text(String(format: "%.1fB", entry.etfData.solanaTotalAssets / 1_000))
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
            }
        }
        .padding(.vertical, 6)
    }
}

// Вид для большого виджета
struct LargeWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(spacing: 0) {
            // Заголовок
            HStack {
                Text("Crypto ETFs")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.primary)
                Spacer()
                Text(formatUpdatedDate(entry.etfData.dataDate, entry.etfData.lastUpdated))
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            
            // Разделитель
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(height: 0.5)
            
            // Секции с данными
            VStack(spacing: 0) {
                // BTC секция
                Link(destination: URL(string: "etfapp://crypto-etf?tab=btc")!) {
                    createRow(
                        title: "BTC",
                        subtitle: "Bitcoin ETF",
                        flow: entry.etfData.bitcoinFlow,
                        totalAssets: entry.etfData.bitcoinTotalAssets,
                        dailyFlows: entry.etfData.bitcoinDailyFlows,
                        fundFlows: entry.etfData.bitcoinFundFlows
                    )
                }
                
                Divider()
                    .background(Color.secondary.opacity(0.3))
                
                // ETH секция
                Link(destination: URL(string: "etfapp://crypto-etf?tab=eth")!) {
                    createRow(
                        title: "ETH",
                        subtitle: "Ethereum ETF",
                        flow: entry.etfData.ethereumFlow,
                        totalAssets: entry.etfData.ethereumTotalAssets,
                        dailyFlows: entry.etfData.ethereumDailyFlows,
                        fundFlows: entry.etfData.ethereumFundFlows
                    )
                }
                
                Divider()
                    .background(Color.secondary.opacity(0.3))
                
                // SOL секция
                Link(destination: URL(string: "etfapp://crypto-etf?tab=sol")!) {
                    createRow(
                        title: "SOL",
                        subtitle: "Solana ETF",
                        flow: entry.etfData.solanaFlow,
                        totalAssets: entry.etfData.solanaTotalAssets,
                        dailyFlows: entry.etfData.solanaDailyFlows,
                        fundFlows: entry.etfData.solanaFundFlows
                    )
                }
                
                Divider()
                    .background(Color.secondary.opacity(0.3))
                
                // Total секция
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Total")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.primary)
                        Text("Combined Flow")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Text(String(format: "%+.1fM", entry.etfData.totalFlow))
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(flowColor(entry.etfData.totalFlow))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
        }
    }
    
    @ViewBuilder
    private func createRow(
        title: String,
        subtitle: String,
        flow: Double,
        totalAssets: Double,
        dailyFlows: [Double],
        fundFlows: FundFlows?
    ) -> some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.primary)
                    Text(subtitle)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.secondary)
                }
                .frame(width: 110, alignment: .leading)
                
                Spacer()
                
                MiniBarsView(values: dailyFlows)
                    .frame(width: 90, height: 42)
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 3) {
                    Text(String(format: "%+.1fM", flow))
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(flowColor(flow))
                    Text(String(format: "%.1fB", totalAssets / 1_000))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            
            // Топ-фонды
            if let fundFlows = fundFlows {
                let topFunds = fundFlows.topFunds(limit: 3)
                if !topFunds.isEmpty {
                    HStack(spacing: 6) {
                        ForEach(Array(topFunds.enumerated()), id: \.offset) { index, fund in
                            HStack(spacing: 3) {
                                Text(fund.name)
                                    .font(.system(size: 9, weight: .medium))
                                    .foregroundColor(.secondary)
                                Text(String(format: "%+.1fM", fund.flow))
                                    .font(.system(size: 9, weight: .semibold))
                                    .foregroundColor(flowColor(fund.flow))
                            }
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.secondary.opacity(0.1))
                            .cornerRadius(3)
                            
                            if index < topFunds.count - 1 {
                                Text("•")
                                    .font(.system(size: 8))
                                    .foregroundColor(.secondary.opacity(0.4))
                                    .padding(.horizontal, 2)
                            }
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 6)
                }
            }
        }
    }
}

