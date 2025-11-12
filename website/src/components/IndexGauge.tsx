"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

// Динамический импорт для избежания проблем с SSR
const GaugeChart = dynamic(() => import("react-gauge-chart"), {
  ssr: false,
});

interface IndexGaugeProps {
  value: number; // Значение индекса от 0 до 100
  colors?: string[]; // Цвета для разных уровней
  arcWidth?: number; // Толщина дуги
  className?: string;
  id?: string; // Уникальный ID для gauge chart
}

export default function IndexGauge({
  value,
  colors = ["#FF5F6D", "#FFC371", "#FFE66D", "#C5E86C", "#4ECDC4"],
  arcWidth = 0.2,
  className = "",
  id,
}: IndexGaugeProps) {
  // Ограничиваем значение от 0 до 100
  const normalizedValue = Math.max(0, Math.min(100, value)) / 100;

  // Генерируем уникальный ID, если не передан
  const gaugeId = useMemo(
    () => id || `gauge-chart-${Math.random().toString(36).substr(2, 9)}`,
    [id]
  );

  // Настройки для gauge chart
  const chartStyle = {
    width: "100%",
    height: "130px",
  };

  return (
    <div className={className}>
      <GaugeChart
        id={gaugeId}
        nrOfLevels={20}
        percent={normalizedValue}
        colors={colors}
        arcWidth={arcWidth}
        needleColor="#374151"
        needleBaseColor="#374151"
        textColor="#000000"
        hideText={true}
        style={chartStyle}
      />
    </div>
  );
}

