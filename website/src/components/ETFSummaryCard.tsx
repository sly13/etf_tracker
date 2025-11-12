"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Skeleton,
  Alert,
  Chip,
  useTheme,
} from "@mui/material";
import { AccountBalance } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import apiClient from "../services/api";
import { SummaryData, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";

export default function ETFSummaryCard() {
  const theme = useTheme();
  const t = useTranslations("summary");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<SummaryData>(
          API_CONFIG.ENDPOINTS.SUMMARY
        );

        setData(response.data);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        let errorMessage: string;

        if (apiError?.timeoutError && apiError?.timeoutMessage) {
          errorMessage = apiError.timeoutMessage;
        } else {
          errorMessage =
            apiError?.response?.data?.message ||
            apiError?.message ||
            tErrors("loadingData");
        }

        setError(errorMessage);
        console.error("ETF Summary fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(1);
  };

  // Форматирование потоков: данные приходят в миллионах
  // Для отдельных ETF всегда показываем в миллионах (M)
  // Для общего потока: если >= 1000M, показываем в миллиардах (B), иначе в миллионах (M)
  const formatFlow = (num: number, isOverall: boolean = false): string => {
    if (isOverall && num >= 1000) {
      return `${(num / 1000).toFixed(1)}B`;
    }
    return `${num.toFixed(1)}M`;
  };

  // Форматирование активов: данные приходят в миллионах, конвертируем в доллары
  const formatAssets = (num: number): string => {
    // Умножаем на 1,000,000 чтобы получить доллары, затем форматируем
    const dollars = num * 1000000;
    return formatNumber(dollars);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return t("noData");
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 4, textAlign: "center", fontWeight: 700 }}
        >
          {t("title")}
        </Typography>

        <Grid container spacing={3}>
          {/* Общий итог */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(22, 163, 74, 0.2) 0%, rgba(20, 83, 45, 0.2) 100%)"
                    : "linear-gradient(135deg, rgba(240, 253, 244, 1) 0%, rgba(220, 252, 231, 1) 100%)",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "#166534" : "#86efac"
                }`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Chip
                    icon={<AccountBalance />}
                    label={t("overall.label")}
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("overall.totalAssets")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      ${formatAssets(data.overall.totalAssets)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("overall.totalFlow")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      ${formatFlow(data.overall.currentFlow, true)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("overall.lastUpdate")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(data.overall.lastUpdated)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Bitcoin */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%)"
                    : "linear-gradient(135deg, rgba(239, 246, 255, 1) 0%, rgba(219, 234, 254, 1) 100%)",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "#1e40af" : "#93c5fd"
                }`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Chip
                    label={t("bitcoin.label")}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("bitcoin.totalAssets")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      ${formatAssets(data.bitcoin.totalAssets)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("bitcoin.currentFlow")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      ${formatFlow(data.bitcoin.currentFlow)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("bitcoin.daysCount")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {data.bitcoin.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("bitcoin.lastUpdate")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(data.bitcoin.latestDate)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ethereum */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%)"
                    : "linear-gradient(135deg, rgba(239, 246, 255, 1) 0%, rgba(219, 234, 254, 1) 100%)",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "#1e40af" : "#93c5fd"
                }`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Chip
                    label={t("ethereum.label")}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("ethereum.totalAssets")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      ${formatAssets(data.ethereum.totalAssets)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("ethereum.currentFlow")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      ${formatFlow(data.ethereum.currentFlow)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("ethereum.daysCount")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {data.ethereum.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("ethereum.lastUpdate")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(data.ethereum.latestDate)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Solana */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%)"
                    : "linear-gradient(135deg, rgba(239, 246, 255, 1) 0%, rgba(219, 234, 254, 1) 100%)",
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "#1e40af" : "#93c5fd"
                }`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Chip
                    label={t("solana.label")}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("solana.totalAssets")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      ${formatAssets(data.solana.totalAssets)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("solana.currentFlow")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      ${formatFlow(data.solana.currentFlow)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("solana.daysCount")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {data.solana.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t("solana.lastUpdate")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(data.solana.latestDate)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {tCommon("dataUpdatesRealtime")}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
