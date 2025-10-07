import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { botApi } from "../services/api";
import { DailyFlowData, MonitoringStatus } from "../types";
import {
  safeFormatNumber,
  safeFormatDate,
  safeFormatMillions,
  safeFormatChartDate,
} from "../utils/formatters";

// Кастомный Tooltip компонент для детального отображения данных по фондам
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          minWidth: 250,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
          📅 {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "white", mb: 1, fontWeight: "bold" }}
        >
          💰 Общий Flow: {safeFormatMillions(data.flow)}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: "#ffd700" }}>
            🏦 BlackRock: {safeFormatMillions(data.blackrock)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#00ff00" }}>
            💎 Fidelity: {safeFormatMillions(data.fidelity)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#ff6b6b" }}>
            🔥 Bitwise: {safeFormatMillions(data.bitwise)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#4ecdc4" }}>
            📊 21Shares: {safeFormatMillions(data.twentyOneShares)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#45b7d1" }}>
            🌊 VanEck: {safeFormatMillions(data.vanEck)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#96ceb4" }}>
            🏛️ Grayscale: {safeFormatMillions(data.grayscale)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#feca57" }}>
            ⚡ Invesco: {safeFormatMillions(data.invesco)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#ff9ff3" }}>
            🌟 Franklin: {safeFormatMillions(data.franklin)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#54a0ff" }}>
            ⚔️ Valkyrie: {safeFormatMillions(data.valkyrie)}
          </Typography>
          <Typography variant="caption" sx={{ color: "#5f27cd" }}>
            🌳 WisdomTree: {safeFormatMillions(data.wisdomTree)}
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

const Monitoring: React.FC = () => {
  const [btcFlowData, setBtcFlowData] = useState<DailyFlowData[]>([]);
  const [ethFlowData, setEthFlowData] = useState<DailyFlowData[]>([]);
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setError(null);
      const [btcRes, ethRes, statusRes] = await Promise.allSettled([
        botApi.getDailyFlowData("btc", 50),
        botApi.getDailyFlowData("eth", 50),
        botApi.getMonitoringStatus(),
      ]);

      if (btcRes.status === "fulfilled") {
        setBtcFlowData(btcRes.value.data);
      }

      if (ethRes.status === "fulfilled") {
        setEthFlowData(ethRes.value.data);
      }

      if (statusRes.status === "fulfilled") {
        setMonitoringStatus(statusRes.value.data);
      }
    } catch (err) {
      setError("Ошибка загрузки данных мониторинга");
      console.error("Monitoring load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Подготовка данных для графиков (дневные данные)
  const prepareChartData = (data: DailyFlowData[]) => {
    return data
      .slice(-20) // Последние 20 записей
      .map(item => ({
        time: safeFormatChartDate(item.date),
        flow: item.total,
        blackrock: item.blackrock,
        fidelity: item.fidelity,
        bitwise: item.bitwise,
        twentyOneShares: item.twentyOneShares,
        vanEck: item.vanEck,
        grayscale: item.grayscale,
        invesco: item.invesco,
        franklin: item.franklin,
        valkyrie: item.valkyrie,
        wisdomTree: item.wisdomTree,
      }))
      .reverse();
  };

  const btcChartData = prepareChartData(btcFlowData);
  const ethChartData = prepareChartData(ethFlowData);

  // Статистика по сигналам
  const getSignalStats = () => {
    if (!monitoringStatus?.stats) return null;

    const stats = monitoringStatus.stats;
    const totalSignals = stats.totalSignals;
    const successRate =
      totalSignals > 0
        ? ((stats.successfulTrades / totalSignals) * 100).toFixed(1)
        : "0";

    return {
      totalSignals,
      btcSignals: stats.btcSignals,
      ethSignals: stats.ethSignals,
      successfulTrades: stats.successfulTrades,
      failedTrades: stats.failedTrades,
      successRate: `${successRate}%`,
    };
  };

  const signalStats = getSignalStats();

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
        {/* Статистика сигналов */}
        {signalStats && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Статистика сигналов
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ flex: "1 1 16%", minWidth: "150px" }}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {signalStats.totalSignals}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Всего сигналов
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 16%", minWidth: "150px" }}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="success.main">
                        {signalStats.btcSignals}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        BTC сигналов
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 16%", minWidth: "150px" }}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="info.main">
                        {signalStats.ethSignals}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ETH сигналов
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 16%", minWidth: "150px" }}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="success.main">
                        {signalStats.successfulTrades}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Успешных сделок
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 16%", minWidth: "150px" }}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="error.main">
                        {signalStats.failedTrades}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Неудачных сделок
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: "1 1 16%", minWidth: "150px" }}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {signalStats.successRate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Успешность
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Графики */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ₿ BTC Flow данные
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={btcChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="flow"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Flow значение"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* График ETH Flow */}
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ξ ETH Flow данные
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ethChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="flow"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Flow значение"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Таблицы данных */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {/* Последние BTC Flow данные */}
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Последние BTC Flow данные
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Общий Flow</TableCell>
                        <TableCell>BlackRock</TableCell>
                        <TableCell>Fidelity</TableCell>
                        <TableCell>Bitwise</TableCell>
                        <TableCell>21Shares</TableCell>
                        <TableCell>VanEck</TableCell>
                        <TableCell>Grayscale</TableCell>
                        <TableCell>Invesco</TableCell>
                        <TableCell>Franklin</TableCell>
                        <TableCell>Valkyrie</TableCell>
                        <TableCell>WisdomTree</TableCell>
                        <TableCell>Сигнал</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {btcFlowData.slice(0, 10).map(flow => {
                        const threshold =
                          monitoringStatus?.config?.minFlowThreshold || 1000000;
                        const isSignal = Math.abs(flow.total ?? 0) >= threshold;
                        return (
                          <TableRow key={flow.id}>
                            <TableCell>{safeFormatDate(flow.date)}</TableCell>
                            <TableCell>
                              <Typography
                                color={
                                  (flow.total ?? 0) >= 0
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {safeFormatNumber(flow.total)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {safeFormatNumber(flow.blackrock)}
                            </TableCell>
                            <TableCell>
                              {safeFormatNumber(flow.fidelity)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.bitwise)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.twentyOneShares)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.vanEck)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.grayscale)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.invesco)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.franklin)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.valkyrie)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.wisdomTree)}
                            </TableCell>
                            <TableCell>
                              {isSignal ? (
                                <Chip
                                  label={
                                    (flow.total ?? 0) >= 0 ? "LONG" : "SHORT"
                                  }
                                  color={
                                    (flow.total ?? 0) >= 0 ? "success" : "error"
                                  }
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="Нет сигнала"
                                  color="default"
                                  size="small"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Последние ETH Flow данные */}
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Последние ETH Flow данные
                </Typography>
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Общий Flow</TableCell>
                        <TableCell>BlackRock</TableCell>
                        <TableCell>Fidelity</TableCell>
                        <TableCell>Bitwise</TableCell>
                        <TableCell>21Shares</TableCell>
                        <TableCell>VanEck</TableCell>
                        <TableCell>Grayscale</TableCell>
                        <TableCell>Invesco</TableCell>
                        <TableCell>Franklin</TableCell>
                        <TableCell>Valkyrie</TableCell>
                        <TableCell>WisdomTree</TableCell>
                        <TableCell>Сигнал</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ethFlowData.slice(0, 10).map(flow => {
                        const threshold =
                          monitoringStatus?.config?.minFlowThreshold || 1000000;
                        const isSignal = Math.abs(flow.total ?? 0) >= threshold;
                        return (
                          <TableRow key={flow.id}>
                            <TableCell>{safeFormatDate(flow.date)}</TableCell>
                            <TableCell>
                              <Typography
                                color={
                                  (flow.total ?? 0) >= 0
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {safeFormatNumber(flow.total)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {safeFormatNumber(flow.blackrock)}
                            </TableCell>
                            <TableCell>
                              {safeFormatNumber(flow.fidelity)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.bitwise)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.twentyOneShares)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.vanEck)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.grayscale)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.invesco)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.franklin)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.valkyrie)}
                            </TableCell>
                            <TableCell>
                              {safeFormatMillions(flow.wisdomTree)}
                            </TableCell>
                            <TableCell>
                              {isSignal ? (
                                <Chip
                                  label={
                                    (flow.total ?? 0) >= 0 ? "LONG" : "SHORT"
                                  }
                                  color={
                                    (flow.total ?? 0) >= 0 ? "success" : "error"
                                  }
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="Нет сигнала"
                                  color="default"
                                  size="small"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Кнопка обновления */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={loadMonitoringData}
              sx={{ minWidth: 200 }}
            >
              🔄 Обновить данные
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Monitoring;
