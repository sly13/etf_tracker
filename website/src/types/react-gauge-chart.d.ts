declare module "react-gauge-chart" {
  export interface GaugeChartProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    marginInPercent?: number;
    cornerRadius?: number;
    nrOfLevels?: number;
    percent?: number;
    arcPadding?: number;
    arcWidth?: number;
    colors?: string[];
    textColor?: string;
    needleColor?: string;
    needleBaseColor?: string;
    hideText?: boolean;
    animate?: boolean;
    animDelay?: number;
    formatTextValue?: (value: string) => string;
  }

  const GaugeChart: React.ComponentType<GaugeChartProps>;
  export default GaugeChart;
}

