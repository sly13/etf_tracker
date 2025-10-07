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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Refresh, TrendingUp, TrendingDown, Add } from "@mui/icons-material";
import { okxApi } from "../services/api";
import {
  OKXConnection,
  TickerData,
  OrderData,
  BalanceData,
  MarketOrderForm,
  LimitOrderForm,
} from "../types";
import { safeFormatNumber } from "../utils/formatters";

const OKXPanel: React.FC = () => {
  const [connection, setConnection] = useState<OKXConnection | null>(null);
  const [prices, setPrices] = useState<{
    BTC: TickerData;
    ETH: TickerData;
  } | null>(null);
  const [openOrders, setOpenOrders] = useState<OrderData[]>([]);
  const [balance, setBalance] = useState<BalanceData[]>([]);
  const [detailedBalance, setDetailedBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Диалоги для торговли
  const [marketOrderOpen, setMarketOrderOpen] = useState(false);
  const [limitOrderOpen, setLimitOrderOpen] = useState(false);
  const [marketOrderForm, setMarketOrderForm] = useState<MarketOrderForm>({
    symbol: "BTC-USDT",
    side: "buy",
    size: 0.001,
  });
  const [limitOrderForm, setLimitOrderForm] = useState<LimitOrderForm>({
    symbol: "BTC-USDT",
    side: "buy",
    size: 0.001,
    price: 50000,
  });

  useEffect(() => {
    loadOKXData();
    const interval = setInterval(loadOKXData, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const loadOKXData = async () => {
    try {
      setError(null);
      const [
        connectionRes,
        pricesRes,
        ordersRes,
        balanceRes,
        detailedBalanceRes,
      ] = await Promise.allSettled([
        okxApi.checkConnection(),
        okxApi.getCurrentPrices(),
        okxApi.getOpenOrders(),
        okxApi.getBalance(),
        fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3088"
          }/api/okx/balance/multiple?ccy=USDT,BTC,ETH`
        ).then(res => res.json()),
      ]);

      if (connectionRes.status === "fulfilled") {
        setConnection(connectionRes.value.data);
      }

      if (pricesRes.status === "fulfilled") {
        setPrices(pricesRes.value.data);
      }

      if (ordersRes.status === "fulfilled") {
        setOpenOrders(ordersRes.value.data);
      }

      if (balanceRes.status === "fulfilled") {
        setBalance(balanceRes.value.data);
      }

      if (detailedBalanceRes.status === "fulfilled") {
        setDetailedBalance(detailedBalanceRes.value.data[0]);
      }
    } catch (err) {
      setError("Ошибка загрузки данных OKX");
      console.error("OKX load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketOrder = async () => {
    try {
      await okxApi.placeMarketOrder(marketOrderForm);
      setMarketOrderOpen(false);
      loadOKXData();
    } catch (err) {
      setError("Ошибка размещения рыночного ордера");
    }
  };

  const handleLimitOrder = async () => {
    try {
      await okxApi.placeLimitOrder(limitOrderForm);
      setLimitOrderOpen(false);
      loadOKXData();
    } catch (err) {
      setError("Ошибка размещения лимитного ордера");
    }
  };

  const getOrderStatusColor = (state: string) => {
    switch (state) {
      case "live":
        return "success";
      case "filled":
        return "info";
      case "canceled":
        return "error";
      default:
        return "default";
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
        {/* Статус подключения */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔗 Статус подключения OKX
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip
                  label={connection?.connected ? "Подключен" : "Отключен"}
                  color={connection?.connected ? "success" : "error"}
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadOKXData}
                >
                  Обновить
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Цены и баланс */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 Текущие цены
                </Typography>
                {prices && prices.BTC && prices.ETH ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">₿ BTC-USDT</Typography>
                      <Typography variant="h5" color="primary">
                        ${safeFormatNumber(prices.BTC.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bid: ${safeFormatNumber(prices.BTC.bid)} | Ask: $
                        {safeFormatNumber(prices.BTC.ask)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Volume: {safeFormatNumber(prices.BTC.volume)} BTC
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1">Ξ ETH-USDT</Typography>
                      <Typography variant="h5" color="primary">
                        ${safeFormatNumber(prices.ETH.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bid: ${safeFormatNumber(prices.ETH.bid)} | Ask: $
                        {safeFormatNumber(prices.ETH.ask)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Volume: {safeFormatNumber(prices.ETH.volume)} ETH
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Данные о ценах недоступны
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Баланс */}
          <Box sx={{ flex: "1 1 50%", minWidth: "300px" }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💳 Баланс аккаунта
                </Typography>

                {detailedBalance && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" color="primary">
                      Общий баланс: {detailedBalance.totalEq} USDT
                    </Typography>
                  </Box>
                )}

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Валюта</TableCell>
                        <TableCell>Доступно</TableCell>
                        <TableCell>Заморожено</TableCell>
                        <TableCell>USD</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailedBalance && detailedBalance.details
                        ? detailedBalance.details
                            .filter(
                              (detail: any) =>
                                detail.ccy === "USDT" ||
                                detail.ccy === "BTC" ||
                                detail.ccy === "ETH"
                            )
                            .map((detail: any) => (
                              <TableRow key={detail.ccy}>
                                <TableCell>{detail.ccy}</TableCell>
                                <TableCell>{detail.availBal}</TableCell>
                                <TableCell>{detail.frozenBal}</TableCell>
                                <TableCell>{detail.eqUsd}</TableCell>
                              </TableRow>
                            ))
                        : balance
                            .filter(
                              b =>
                                parseFloat(b.availBal) > 0 ||
                                parseFloat(b.frozenBal) > 0
                            )
                            .map(bal => (
                              <TableRow key={bal.ccy}>
                                <TableCell>{bal.ccy}</TableCell>
                                <TableCell>{bal.availBal}</TableCell>
                                <TableCell>{bal.frozenBal}</TableCell>
                                <TableCell>-</TableCell>
                              </TableRow>
                            ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Торговые операции
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setMarketOrderOpen(true)}
                  disabled={!connection?.connected}
                >
                  Рыночный ордер
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setLimitOrderOpen(true)}
                  disabled={!connection?.connected}
                >
                  Лимитный ордер
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Открытые ордера */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Открытые ордера
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID ордера</TableCell>
                      <TableCell>Символ</TableCell>
                      <TableCell>Направление</TableCell>
                      <TableCell>Размер</TableCell>
                      <TableCell>Цена</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Заполнено</TableCell>
                      <TableCell>Дата создания</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {openOrders.map(order => (
                      <TableRow key={order.ordId}>
                        <TableCell>{order.ordId}</TableCell>
                        <TableCell>{order.instId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {order.side === "buy" ? (
                              <TrendingUp color="success" />
                            ) : (
                              <TrendingDown color="error" />
                            )}
                            <Typography sx={{ ml: 1 }}>{order.side}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{order.sz}</TableCell>
                        <TableCell>{order.px || "Market"}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.state}
                            color={getOrderStatusColor(order.state) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.fillSz}</TableCell>
                        <TableCell>
                          {order.createTime
                            ? new Date(
                                parseInt(order.createTime)
                              ).toLocaleString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Диалог рыночного ордера */}
      <Dialog open={marketOrderOpen} onClose={() => setMarketOrderOpen(false)}>
        <DialogTitle>Рыночный ордер</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Символ</InputLabel>
              <Select
                value={marketOrderForm.symbol}
                onChange={e =>
                  setMarketOrderForm({
                    ...marketOrderForm,
                    symbol: e.target.value,
                  })
                }
              >
                <MenuItem value="BTC-USDT">BTC-USDT</MenuItem>
                <MenuItem value="ETH-USDT">ETH-USDT</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Направление</InputLabel>
              <Select
                value={marketOrderForm.side}
                onChange={e =>
                  setMarketOrderForm({
                    ...marketOrderForm,
                    side: e.target.value as "buy" | "sell",
                  })
                }
              >
                <MenuItem value="buy">Покупка</MenuItem>
                <MenuItem value="sell">Продажа</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Размер"
              type="number"
              value={marketOrderForm.size}
              onChange={e =>
                setMarketOrderForm({
                  ...marketOrderForm,
                  size: parseFloat(e.target.value),
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarketOrderOpen(false)}>Отмена</Button>
          <Button onClick={handleMarketOrder} variant="contained">
            Разместить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог лимитного ордера */}
      <Dialog open={limitOrderOpen} onClose={() => setLimitOrderOpen(false)}>
        <DialogTitle>Лимитный ордер</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Символ</InputLabel>
              <Select
                value={limitOrderForm.symbol}
                onChange={e =>
                  setLimitOrderForm({
                    ...limitOrderForm,
                    symbol: e.target.value,
                  })
                }
              >
                <MenuItem value="BTC-USDT">BTC-USDT</MenuItem>
                <MenuItem value="ETH-USDT">ETH-USDT</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Направление</InputLabel>
              <Select
                value={limitOrderForm.side}
                onChange={e =>
                  setLimitOrderForm({
                    ...limitOrderForm,
                    side: e.target.value as "buy" | "sell",
                  })
                }
              >
                <MenuItem value="buy">Покупка</MenuItem>
                <MenuItem value="sell">Продажа</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Размер"
              type="number"
              value={limitOrderForm.size}
              onChange={e =>
                setLimitOrderForm({
                  ...limitOrderForm,
                  size: parseFloat(e.target.value),
                })
              }
              fullWidth
            />
            <TextField
              label="Цена"
              type="number"
              value={limitOrderForm.price}
              onChange={e =>
                setLimitOrderForm({
                  ...limitOrderForm,
                  price: parseFloat(e.target.value),
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLimitOrderOpen(false)}>Отмена</Button>
          <Button onClick={handleLimitOrder} variant="contained">
            Разместить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OKXPanel;
