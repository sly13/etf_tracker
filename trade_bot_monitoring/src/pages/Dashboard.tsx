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
} from "@mui/material";
import { PlayArrow, Stop } from "@mui/icons-material";
import { botApi, okxApi } from "../services/api";
import { MonitoringStatus, TradingStats } from "../types";
import { safeFormatNumber } from "../utils/formatters";

const Dashboard: React.FC = () => {
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatus | null>(null);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [okxConnected, setOkxConnected] = useState<boolean>(false);
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
      const [statusRes, statsRes, okxRes] = await Promise.allSettled([
        botApi.getMonitoringStatus(),
        botApi.getTradingStats(),
        okxApi.checkConnection(),
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
