import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Pagination,
  Stack,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Refresh,
  Delete,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { botApi } from "../services/api";
import { MonitoringStatus, TradingPosition, DailyFlowData } from "../types";
import {
  safeFormatNumber,
  safeFormatCurrency,
  safeFormatDateTime,
  safeFormatDate,
} from "../utils/formatters";

const BotManagement: React.FC = () => {
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatus | null>(null);
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [btcFlowData, setBtcFlowData] = useState<DailyFlowData[]>([]);
  const [ethFlowData, setEthFlowData] = useState<DailyFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние пагинации
  const [btcPage, setBtcPage] = useState(1);
  const [ethPage, setEthPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Обновляем каждые 10 секунд
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [statusRes, positionsRes, btcRes, ethRes] =
        await Promise.allSettled([
          botApi.getMonitoringStatus(),
          botApi.getPositions(),
          botApi.getDailyFlowData("btc", 20),
          botApi.getDailyFlowData("eth", 20),
        ]);

      if (statusRes.status === "fulfilled") {
        setMonitoringStatus(statusRes.value.data);
      }

      if (positionsRes.status === "fulfilled") {
        setPositions(positionsRes.value.data);
      }

      if (btcRes.status === "fulfilled") {
        setBtcFlowData(btcRes.value.data);
        setBtcPage(1); // Сброс на первую страницу при загрузке новых данных
      }

      if (ethRes.status === "fulfilled") {
        setEthFlowData(ethRes.value.data);
        setEthPage(1); // Сброс на первую страницу при загрузке новых данных
      }
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Bot management load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitoring = async () => {
    try {
      await botApi.startMonitoring();
      loadData();
    } catch (err) {
      setError("Ошибка запуска мониторинга");
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await botApi.stopMonitoring();
      loadData();
    } catch (err) {
      setError("Ошибка остановки мониторинга");
    }
  };

  const handleResetStats = async () => {
    try {
      await botApi.resetStats();
      loadData();
    } catch (err) {
      setError("Ошибка сброса статистики");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "closed":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getSideIcon = (side: string) => {
    return side === "long" ? (
      <TrendingUp color="success" />
    ) : (
      <TrendingDown color="error" />
    );
  };

  // Функции для пагинации
  const handleBtcPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setBtcPage(value);
  };

  const handleEthPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setEthPage(value);
  };

  // Получение данных для текущей страницы
  const getBtcPageData = () => {
    if (!btcFlowData || btcFlowData.length === 0) return [];
    const startIndex = (btcPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return btcFlowData.slice(startIndex, endIndex);
  };

  const getEthPageData = () => {
    if (!ethFlowData || ethFlowData.length === 0) return [];
    const startIndex = (ethPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return ethFlowData.slice(startIndex, endIndex);
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
        {/* Управление мониторингом */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎛️ Управление мониторингом
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleStartMonitoring}
                  disabled={monitoringStatus?.isRunning}
                  color="success"
                >
                  Запустить мониторинг
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Stop />}
                  onClick={handleStopMonitoring}
                  disabled={!monitoringStatus?.isRunning}
                  color="error"
                >
                  Остановить мониторинг
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadData}
                >
                  Обновить данные
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={handleResetStats}
                  color="warning"
                >
                  Сбросить статистику
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Торговые позиции */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Торговые позиции
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Символ</TableCell>
                      <TableCell>Направление</TableCell>
                      <TableCell>Размер</TableCell>
                      <TableCell>Цена входа</TableCell>
                      <TableCell>Flow значение</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>P&L</TableCell>
                      <TableCell>Дата создания</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positions.map(position => (
                      <TableRow key={position.id}>
                        <TableCell>{position.id}</TableCell>
                        <TableCell>{position.symbol}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getSideIcon(position.side)}
                            <Typography sx={{ ml: 1 }}>
                              {position.side}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{position.size}</TableCell>
                        <TableCell>
                          {safeFormatCurrency(position.entry_price)}
                        </TableCell>
                        <TableCell>
                          {safeFormatNumber(position.flow_value)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={position.status}
                            color={getStatusColor(position.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {position.profit_loss !== undefined ? (
                            <Typography
                              color={
                                position.profit_loss >= 0
                                  ? "success.main"
                                  : "error.main"
                              }
                            >
                              {safeFormatCurrency(position.profit_loss)}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {safeFormatDateTime(position.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* BTC и ETH Flow данные */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ₿ BTC Flow данные
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getBtcPageData().map(flow => (
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
                            {safeFormatNumber(flow.bitwise)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.twentyOneShares)}
                          </TableCell>
                          <TableCell>{safeFormatNumber(flow.vanEck)}</TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.grayscale)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.invesco)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.franklin)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.valkyrie)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.wisdomTree)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Пагинация для BTC */}
                {btcFlowData.length > rowsPerPage && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <Stack spacing={2}>
                      <Pagination
                        count={Math.ceil(btcFlowData.length / rowsPerPage)}
                        page={btcPage}
                        onChange={handleBtcPageChange}
                        color="primary"
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                      >
                        Показано {getBtcPageData().length} из{" "}
                        {btcFlowData.length} записей
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* ETH Flow данные */}
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ξ ETH Flow данные
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getEthPageData().map(flow => (
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
                            {safeFormatNumber(flow.bitwise)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.twentyOneShares)}
                          </TableCell>
                          <TableCell>{safeFormatNumber(flow.vanEck)}</TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.grayscale)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.invesco)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.franklin)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.valkyrie)}
                          </TableCell>
                          <TableCell>
                            {safeFormatNumber(flow.wisdomTree)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Пагинация для ETH */}
                {ethFlowData.length > rowsPerPage && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <Stack spacing={2}>
                      <Pagination
                        count={Math.ceil(ethFlowData.length / rowsPerPage)}
                        page={ethPage}
                        onChange={handleEthPageChange}
                        color="primary"
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                      >
                        Показано {getEthPageData().length} из{" "}
                        {ethFlowData.length} записей
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BotManagement;
