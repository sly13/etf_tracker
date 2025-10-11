import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CandlestickData,
  Time,
  CandlestickSeries,
  WhitespaceData,
} from "lightweight-charts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { botApi } from "../services/api";

interface BTCCandleData {
  id: string;
  symbol: string;
  interval: string;
  open_time: string;
  close_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quote_volume: number;
  trades: number;
  taker_buy_base: number;
  taker_buy_quote: number;
  source: string;
  inserted_at: string;
  updated_at: string;
}

const BTCCandlesChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<{
    [key: string]: ISeriesApi<
      "Candlestick",
      Time,
      CandlestickData<Time> | WhitespaceData<Time>
    >;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalDataLoaded, setTotalDataLoaded] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("5m");

  // Функция для загрузки данных с выбранным интервалом
  const loadDataWithInterval = async (interval: string) => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setTotalDataLoaded(0);
      setHasMoreData(true);

      // Проверяем, что серии созданы
      if (Object.keys(seriesRefs.current).length === 0) {
        console.warn("Series not initialized yet, waiting...");
        setTimeout(() => loadDataWithInterval(interval), 100);
        return;
      }

      console.log(`Loading BTC candles with interval: ${interval}`);
      setLoadingProgress(10);

      // Определяем количество свечей в зависимости от интервала
      let limit = 1000;
      if (interval === "5m") limit = 1000; // много 5-минутных свечей
      else if (interval === "1h") limit = 168; // неделя по часам
      else if (interval === "1d") limit = 30; // месяц по дням
      else if (interval === "1w") limit = 12; // квартал по неделям

      const response = await botApi.getBTCCandles(limit, interval, 0);

      if (response.success && response.data && Array.isArray(response.data)) {
        console.log(
          `Data loaded: ${response.data.length} items for ${interval}`
        );
        setLoadingProgress(50);

        const chartData: CandlestickData<Time>[] = response.data
          .map((item: BTCCandleData) => ({
            time: Math.floor(new Date(item.open_time).getTime() / 1000) as Time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
          .sort((a, b) => Number(a.time) - Number(b.time));

        if (seriesRefs.current["btc"]) {
          seriesRefs.current["btc"].setData(chartData);
          setTotalDataLoaded(chartData.length);
          setLoadingProgress(100);
        }
      } else {
        console.error("Invalid response:", response);
        setError(`Не удалось загрузить данные для интервала ${interval}`);
      }
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Error loading BTC candles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения интервала
  const handleIntervalChange = (
    event: React.MouseEvent<HTMLElement>,
    newInterval: string | null
  ) => {
    if (newInterval && newInterval !== selectedInterval) {
      setSelectedInterval(newInterval);
      loadDataWithInterval(newInterval);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Создаем график
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "white" },
        textColor: "black",
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: {
          color: "rgba(197, 203, 206, 0.5)",
        },
        horzLines: {
          color: "rgba(197, 203, 206, 0.5)",
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Создаем серию для BTC свечей
    const seriesConfigs = [{ key: "btc", title: "BTC/USDT" }];

    seriesConfigs.forEach(config => {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        title: config.title,
      });
      seriesRefs.current[config.key] = series;
    });

    chartRef.current = chart;

    // Обработка изменения размера
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Обработчик изменения видимого диапазона для подгрузки исторических данных
    const handleVisibleRangeChange = (timeRange: any) => {
      if (!timeRange || isLoadingMore || !hasMoreData) return;

      const { from } = timeRange;
      const visibleStartTime = Number(from);

      // Получаем текущие данные из серии для определения самого раннего времени
      const currentData = seriesRefs.current["btc"]?.data();
      if (currentData && Array.isArray(currentData) && currentData.length > 0) {
        const earliestTime = Number(currentData[0].time);

        // Если пользователь приблизился к началу загруженных данных (осталось меньше 2 часов)
        if (visibleStartTime - earliestTime < 7200) {
          loadMoreHistoricalData();
        }
      }
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(handleVisibleRangeChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [isLoadingMore, hasMoreData]);

  // Функция для подгрузки исторических данных
  const loadMoreHistoricalData = async () => {
    if (isLoadingMore || !hasMoreData) return;

    try {
      setIsLoadingMore(true);
      console.log("Loading more historical data...");

      // Загружаем данные с большим offset для получения более старых данных
      const response = await botApi.getBTCCandles(1000, "5m", totalDataLoaded);

      if (
        response.success &&
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const newChartData: CandlestickData<Time>[] = response.data
          .map((item: BTCCandleData) => ({
            time: Math.floor(new Date(item.open_time).getTime() / 1000) as Time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
          .sort((a, b) => Number(a.time) - Number(b.time));

        // Получаем текущие данные из серии
        const currentData = seriesRefs.current["btc"]?.data();
        if (currentData && Array.isArray(currentData)) {
          // Объединяем данные
          const allData = [...currentData, ...newChartData];

          // Удаляем дубликаты по времени
          const uniqueData = new Map<number, CandlestickData<Time>>();
          allData.forEach(item => {
            const timeKey = Number(item.time);
            if (!uniqueData.has(timeKey)) {
              uniqueData.set(timeKey, item);
            }
          });

          const finalData = Array.from(uniqueData.values()).sort(
            (a, b) => Number(a.time) - Number(b.time)
          );

          // Обновляем график
          if (seriesRefs.current["btc"]) {
            seriesRefs.current["btc"].setData(finalData);
            setTotalDataLoaded(finalData.length);
            console.log(`Loaded ${finalData.length} total candles`);
          }
        }
      } else {
        // Если данных больше нет, устанавливаем флаг
        setHasMoreData(false);
        console.log("No more historical data available");
      }
    } catch (error) {
      console.error("Error loading more historical data:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadDataProgressively = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        setTotalDataLoaded(0);

        // Проверяем, что серии созданы
        if (Object.keys(seriesRefs.current).length === 0) {
          console.warn("Series not initialized yet, waiting...");
          setTimeout(loadDataProgressively, 100);
          return;
        }

        // Сначала загружаем последние 500 свечей для быстрого отображения
        console.log("Loading initial 500 candles...");
        setLoadingProgress(10);

        const initialResponse = await botApi.getBTCCandles(500, "5m", 0);

        if (
          initialResponse.success &&
          initialResponse.data &&
          Array.isArray(initialResponse.data)
        ) {
          console.log(
            "Initial data loaded:",
            initialResponse.data.length,
            "items"
          );
          setLoadingProgress(30);

          // Обрабатываем начальные данные
          const initialChartData: CandlestickData<Time>[] = initialResponse.data
            .map((item: BTCCandleData) => ({
              time: Math.floor(
                new Date(item.open_time).getTime() / 1000
              ) as Time,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
            }))
            .sort((a, b) => Number(a.time) - Number(b.time));

          // Отображаем начальные данные
          if (seriesRefs.current["btc"]) {
            seriesRefs.current["btc"].setData(initialChartData);
            setTotalDataLoaded(initialChartData.length);
            setLoadingProgress(50);
          }

          // Теперь загружаем остальные данные порциями
          const batchSize = 1000;
          let offset = 500;
          let allData = [...initialChartData];

          while (offset < 10000) {
            // Загружаем до 10,000 свечей максимум
            console.log(`Loading batch starting from offset ${offset}...`);

            const batchResponse = await botApi.getBTCCandles(
              batchSize,
              "5m",
              offset
            );

            if (
              batchResponse.success &&
              batchResponse.data &&
              Array.isArray(batchResponse.data)
            ) {
              const batchChartData: CandlestickData<Time>[] = batchResponse.data
                .map((item: BTCCandleData) => ({
                  time: Math.floor(
                    new Date(item.open_time).getTime() / 1000
                  ) as Time,
                  open: item.open,
                  high: item.high,
                  low: item.low,
                  close: item.close,
                }))
                .sort((a, b) => Number(a.time) - Number(b.time));

              // Добавляем новые данные к существующим
              allData = [...allData, ...batchChartData];

              // Удаляем дубликаты по времени и сортируем
              const uniqueData = new Map<number, CandlestickData<Time>>();
              allData.forEach(item => {
                const timeKey = Number(item.time);
                if (!uniqueData.has(timeKey)) {
                  uniqueData.set(timeKey, item);
                }
              });

              allData = Array.from(uniqueData.values()).sort(
                (a, b) => Number(a.time) - Number(b.time)
              );

              // Обновляем график
              if (seriesRefs.current["btc"]) {
                seriesRefs.current["btc"].setData(allData);
                setTotalDataLoaded(allData.length);
                setLoadingProgress(Math.min(50 + (offset / 10000) * 40, 90));
              }

              offset += batchSize;

              // Небольшая задержка между запросами
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              break;
            }
          }

          console.log(`Final data loaded: ${allData.length} candles`);
          setLoadingProgress(100);
        } else {
          console.error("Invalid initial response:", initialResponse);
          setError("Не удалось загрузить данные BTC candles");
        }
      } catch (err) {
        setError("Ошибка загрузки данных");
        console.error("Error loading BTC candles:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDataWithInterval(selectedInterval);
  }, [selectedInterval]);

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">📈 BTC Candles Chart</Typography>

          {/* Переключатель интервалов */}
          <ToggleButtonGroup
            value={selectedInterval}
            exclusive
            onChange={handleIntervalChange}
            aria-label="интервал"
            size="small"
          >
            <ToggleButton value="5m" aria-label="5 минут">
              5m
            </ToggleButton>
            <ToggleButton value="1h" aria-label="1 час">
              1h
            </ToggleButton>
            <ToggleButton value="1d" aria-label="1 день">
              1d
            </ToggleButton>
            <ToggleButton value="1w" aria-label="1 неделя">
              1w
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Индикатор прогресса загрузки */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Загрузка данных...
              </Typography>
              <Chip
                label={`${totalDataLoaded} свечей`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={loadingProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {Math.round(loadingProgress)}% завершено
            </Typography>
          </Box>
        )}

        {/* Индикатор загрузки дополнительных данных */}
        {isLoadingMore && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Загрузка исторических данных...
              </Typography>
              <Chip
                label={`${totalDataLoaded} свечей`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
            <LinearProgress
              variant="indeterminate"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        <Box
          ref={chartContainerRef}
          sx={{
            width: "100%",
            height: 400,
            position: "relative",
          }}
        >
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <Typography>Загрузка графика...</Typography>
            </Box>
          )}
        </Box>

        {/* Информация о загруженных данных */}
        {!loading && totalDataLoaded > 0 && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Загружено {totalDataLoaded} свечей BTC/USDT с интервалом{" "}
              {selectedInterval}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {hasMoreData && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={loadMoreHistoricalData}
                  disabled={isLoadingMore}
                  sx={{ ml: 1 }}
                >
                  {isLoadingMore ? "Загрузка..." : "Загрузить историю"}
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => loadDataWithInterval(selectedInterval)}
                sx={{ ml: 1 }}
              >
                Обновить данные
              </Button>
            </Box>
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          График показывает свечи BTC/USDT с данными OHLC (Open, High, Low,
          Close). Зеленые свечи - рост цены, красные свечи - падение цены.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BTCCandlesChart;
