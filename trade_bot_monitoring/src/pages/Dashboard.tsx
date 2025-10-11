import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Paper,
  Tooltip,
} from "@mui/material";
import { PlayArrow, Stop, InfoOutlined } from "@mui/icons-material";
import { botApi, okxApi } from "../services/api";
import { MonitoringStatus, TradingStats } from "../types";
import { safeFormatNumber } from "../utils/formatters";
import BTCFlowsChart from "../components/BTCFlowsChart";

// Компонент для иконки информации с подсказкой
const InfoIcon: React.FC<{ title: string }> = ({ title }) => (
  <Tooltip title={title} arrow placement="top">
    <InfoOutlined
      sx={{
        fontSize: 16,
        color: "text.secondary",
        ml: 0.5,
        cursor: "help",
      }}
    />
  </Tooltip>
);

// Функция для получения описания признака
const getFeatureDescription = (feature: string): string => {
  const descriptions: { [key: string]: string } = {
    price_to_ma30:
      "Отношение текущей цены к 30-дневному скользящему среднему - показывает, насколько цена отклоняется от долгосрочного тренда",
    ma_7: "7-дневное скользящее среднее - краткосрочный тренд цены",
    return_lag_2: "Доходность за 2 дня назад - историческая динамика цены",
    macd_signal:
      "Сигнальная линия MACD - технический индикатор для определения моментов покупки/продажи",
    rsi: "Relative Strength Index - индикатор перекупленности/перепроданности рынка",
    return_prev: "Доходность за предыдущий день - недавнее изменение цены",
    return_3d: "Доходность за 3 дня - краткосрочная динамика",
    return_7d: "Доходность за 7 дней - недельная динамика",
    volatility: "Волатильность - мера изменчивости цены",
    ma_30: "30-дневное скользящее среднее - долгосрочный тренд",
    price_to_ma7: "Отношение цены к 7-дневному скользящему среднему",
    ma7_to_ma30: "Отношение краткосрочного к долгосрочному тренду",
    hl_spread: "Размах цен (high-low spread) - внутридневная волатильность",
    volume_ratio: "Отношение объема к среднему - активность торгов",
    etf_flow_change: "Изменение притока ETF - поток капитала в Биткоин",
    etf_flow_ratio: "Отношение текущего потока ETF к среднему",
    return_lag_1: "Доходность за 1 день назад",
    return_lag_3: "Доходность за 3 дня назад",
    volume_lag_1: "Объем торгов за 1 день назад",
    volume_lag_2: "Объем торгов за 2 дня назад",
    volume_lag_3: "Объем торгов за 3 дня назад",
    etf_flow_lag_1: "Приток ETF за 1 день назад",
    etf_flow_lag_2: "Приток ETF за 2 дня назад",
    etf_flow_lag_3: "Приток ETF за 3 дня назад",
    macd: "MACD индикатор - разность между краткосрочной и долгосрочной экспоненциальными скользящими средними",
  };

  return (
    descriptions[feature] ||
    `Технический индикатор: ${feature.replace(/_/g, " ")}`
  );
};

const Dashboard: React.FC = () => {
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatus | null>(null);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [okxConnected, setOkxConnected] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statusRes, statsRes, okxRes, predictionRes] =
        await Promise.allSettled([
          botApi.getMonitoringStatus(),
          botApi.getTradingStats(),
          okxApi.checkConnection(),
          botApi.getPrediction(),
        ]);

      if (statusRes.status === "fulfilled") {
        setMonitoringStatus(statusRes.value.data);
      }

      if (statsRes.status === "fulfilled") {
        setTradingStats(statsRes.value.data);
      }

      if (okxRes.status === "fulfilled") {
        setOkxConnected(okxRes.value.data.connected);
      }

      if (predictionRes.status === "fulfilled") {
        setPrediction(predictionRes.value.data);
        setPredictionError(null);
      } else {
        setPredictionError("Ошибка загрузки предикшена");
      }
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitoring = async () => {
    try {
      await botApi.startMonitoring();
      loadDashboardData();
    } catch (err) {
      setError("Ошибка запуска мониторинга");
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await botApi.stopMonitoring();
      loadDashboardData();
    } catch (err) {
      setError("Ошибка остановки мониторинга");
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Статус мониторинга */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🤖 Статус мониторинга
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip
                  label={monitoringStatus?.isRunning ? "Активен" : "Остановлен"}
                  color={monitoringStatus?.isRunning ? "success" : "default"}
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={okxConnected ? "OKX подключен" : "OKX отключен"}
                  color={okxConnected ? "success" : "error"}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleStartMonitoring}
                  disabled={monitoringStatus?.isRunning}
                  color="success"
                >
                  Запустить
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Stop />}
                  onClick={handleStopMonitoring}
                  disabled={!monitoringStatus?.isRunning}
                  color="error"
                >
                  Остановить
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Статистика сигналов */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Статистика сигналов
              </Typography>
              {monitoringStatus?.stats && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Всего сигналов: {monitoringStatus?.stats?.totalSignals || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    BTC сигналов: {monitoringStatus?.stats?.btcSignals || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ETH сигналов: {monitoringStatus?.stats?.ethSignals || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Успешных сделок:{" "}
                    {monitoringStatus?.stats?.successfulTrades || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Неудачных сделок:{" "}
                    {monitoringStatus?.stats?.failedTrades || 0}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Торговая статистика */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Торговая статистика
              </Typography>
              {tradingStats && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Всего позиций: {tradingStats?.totalPositions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Открытых позиций: {tradingStats?.openPositions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Закрытых позиций: {tradingStats?.closedPositions || 0}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Последний сигнал */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔔 Последний сигнал
              </Typography>
              {monitoringStatus?.stats?.lastSignal ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Актив: {monitoringStatus?.stats?.lastSignal?.asset || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Flow: {monitoringStatus?.stats?.lastSignal?.flowValue || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Направление:{" "}
                    {monitoringStatus?.stats?.lastSignal?.side || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Время:{" "}
                    {monitoringStatus?.stats?.lastSignal?.timestamp
                      ? new Date(
                          monitoringStatus.stats.lastSignal.timestamp
                        ).toLocaleString()
                      : "N/A"}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет сигналов
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* ML Prediction */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🤖 ML Prediction
              </Typography>
              {predictionError ? (
                <Box>
                  <Alert severity="error">{predictionError}</Alert>
                </Box>
              ) : prediction ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Статус: {prediction.success ? "✅ Успешно" : "❌ Ошибка"}
                    <InfoIcon title="Статус выполнения ML модели: успешно означает, что модель загружена и прогноз выполнен без ошибок" />
                  </Typography>
                  {prediction.success && prediction.data ? (
                    <Box sx={{ mt: 2 }}>
                      {/* Основной прогноз */}
                      <Box
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="h6" color="primary" gutterBottom>
                          📈 Прогноз: {prediction.data.prediction || "N/A"}
                          <InfoIcon title="Направление прогноза: 'Рост' означает ожидание увеличения цены Биткоина на следующий день, 'Падение' - снижения" />
                        </Typography>
                        <Typography
                          variant="h5"
                          color="primary.main"
                          fontWeight="bold"
                        >
                          {prediction.data.confidence || "N/A"}
                          <InfoIcon title="Уверенность модели: процентная вероятность правильности прогноза (чем выше, тем более уверена модель в своем предсказании)" />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Текущая цена: ${prediction.data.price || "N/A"}
                          <InfoIcon title="Актуальная цена Биткоина на момент выполнения прогноза (последняя цена из базы данных)" />
                        </Typography>
                      </Box>

                      {/* Детальные данные */}
                      {prediction.data && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            📊 Детальный анализ:
                          </Typography>

                          {/* Основной прогноз */}
                          <Box
                            sx={{
                              mb: 2,
                              p: 1,
                              bgcolor: "blue.50",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              Реальные данные из БД:
                              <InfoIcon title="Прогноз на основе реальных исторических данных о цене Биткоина и притоках ETF из базы данных" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Прогноз: {prediction.data.prediction_text}
                              <InfoIcon title="Направление прогноза на основе анализа технических индикаторов и рыночных данных" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Вероятность роста:{" "}
                              {(prediction.data.probability_up * 100).toFixed(
                                1
                              )}
                              %
                              <InfoIcon title="Вероятность того, что цена Биткоина вырастет на следующий день (от 0% до 100%)" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Данных использовано:{" "}
                              {prediction.data.data_points_used}
                              <InfoIcon title="Количество исторических записей (дней), которые модель использовала для создания прогноза" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Символ:{" "}
                              {prediction.data.data_info?.symbol || "N/A"}
                              <InfoIcon title="Торговая пара, для которой выполняется прогноз (BTCUSDT - Биткоин к доллару США)" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Период:{" "}
                              {prediction.data.data_info?.lookback_days ||
                                "N/A"}{" "}
                              дней
                              <InfoIcon title="Количество дней исторических данных, которые модель анализирует для создания прогноза" />
                            </Typography>
                          </Box>

                          {/* Топ важных признаков */}
                          {prediction.data.feature_importance && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                🔍 Топ-5 важных признаков:
                                <InfoIcon title="Наиболее влиятельные технические индикаторы и признаки, которые модель использует для принятия решения о прогнозе" />
                              </Typography>
                              {Object.entries(
                                prediction.data.feature_importance
                              )
                                .sort(
                                  ([, a], [, b]) =>
                                    parseFloat(b as string) -
                                    parseFloat(a as string)
                                )
                                .slice(0, 5)
                                .map(([feature, importance]) => (
                                  <Box
                                    key={feature}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ textTransform: "capitalize" }}
                                    >
                                      {feature.replace(/_/g, " ")}:
                                      <InfoIcon
                                        title={getFeatureDescription(feature)}
                                      />
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                    >
                                      {(
                                        parseFloat(importance as string) * 100
                                      ).toFixed(1)}
                                      %
                                    </Typography>
                                  </Box>
                                ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: "block" }}
                      >
                        Обновлено:{" "}
                        {new Date(prediction.data.timestamp).toLocaleString()}
                        <InfoIcon title="Время последнего обновления прогноза ML модели" />
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="error" sx={{ mb: 1 }}>
                        Ошибка получения предикшена
                      </Alert>
                      <Typography variant="body2" color="error">
                        Сообщение: {prediction.message || "Неизвестная ошибка"}
                      </Typography>
                      <Typography variant="body2" color="error">
                        Детали: {prediction.error || "Нет деталей"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Загрузка предикшена...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* BTC Flows Chart */}
        <Box sx={{ mb: 3 }}>
          <BTCFlowsChart />
        </Box>

        {/* Конфигурация */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ Конфигурация
              </Typography>
              {monitoringStatus?.config && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ flex: "1 1 33%", minWidth: "200px" }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2">
                        Интервал проверки
                      </Typography>
                      <Typography variant="h6">
                        {monitoringStatus?.config?.checkInterval
                          ? monitoringStatus.config.checkInterval / 1000
                          : 0}
                        с
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 33%", minWidth: "200px" }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2">
                        Минимальный порог
                      </Typography>
                      <Typography variant="h6">
                        {safeFormatNumber(
                          monitoringStatus?.config?.minFlowThreshold
                        )}
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 33%", minWidth: "200px" }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2">
                        Максимальная позиция
                      </Typography>
                      <Typography variant="h6">
                        ${monitoringStatus?.config?.maxPositionSize || 0}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
