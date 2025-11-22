"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Paper,
  Skeleton,
  Alert,
} from "@mui/material";
import Navigation from "../../../components/Navigation";
import MoneyRain from "../../../components/MoneyRain";
import FundLogo from "../../../components/FundLogo";
import apiClient from "../../../services/api";
import { FundHoldingsData, ApiError } from "../../../types/api";
import { API_CONFIG } from "../../../config/api";
import { Link } from "../../../i18n/routing";

// Маппинг названий фондов
const FUND_NAMES: Record<string, string> = {
  blackrock: "BlackRock",
  fidelity: "Fidelity",
  bitwise: "Bitwise",
  twentyOneShares: "21Shares",
  vanEck: "VanEck",
  invesco: "Invesco",
  franklin: "Franklin Templeton",
  grayscale: "Grayscale BTC",
  grayscaleCrypto: "Grayscale Crypto",
  valkyrie: "Valkyrie",
  wisdomTree: "WisdomTree",
};

// Логотипы фондов
const FUND_LOGOS: Record<string, string> = {
  blackrock: "/images/fund_logos/blackrock.jpg",
  fidelity: "/images/fund_logos/fidelity.jpg",
  bitwise: "/images/fund_logos/bitwise.jpg",
  twentyOneShares: "/images/fund_logos/ark.jpg",
  vanEck: "/images/fund_logos/vaneck.jpg",
  invesco: "/images/fund_logos/invesco.jpg",
  franklin: "/images/fund_logos/franklin.jpg",
  grayscale: "/images/fund_logos/grayscale-gbtc.jpg",
  grayscaleCrypto: "/images/fund_logos/grayscale.jpg",
  valkyrie: "/images/fund_logos/valkyrie.jpg",
  wisdomTree: "/images/fund_logos/wtree.jpg",
};

// Функция для определения поддерживаемых криптовалют на основе данных из БД
const getFundCryptos = (
  fundKey: string,
  holdings: FundHoldingsData["fundHoldings"]
): string[] => {
  const fundHolding = holdings[fundKey];
  if (!fundHolding) return [];

  const cryptos: string[] = [];
  if (fundHolding.btc > 0) cryptos.push("BTC");
  if (fundHolding.eth > 0) cryptos.push("ETH");
  if (fundHolding.sol > 0) cryptos.push("SOL");

  return cryptos;
};

export default function FundsPage() {
  const t = useTranslations("funds");
  const tCommon = useTranslations("common");
  const tBrand = useTranslations("brand");
  const tHome = useTranslations("home");
  const tErrors = useTranslations("errors");
  const [holdingsData, setHoldingsData] = useState<FundHoldingsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<FundHoldingsData>(
          API_CONFIG.ENDPOINTS.FUND_HOLDINGS
        );

        setHoldingsData(response.data);
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
        console.error("Fund holdings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const funds = Object.keys(FUND_NAMES).map(key => ({
    key,
    name: FUND_NAMES[key],
    logo: FUND_LOGOS[key],
    cryptos: holdingsData ? getFundCryptos(key, holdingsData.fundHoldings) : [],
  }));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        bgcolor: "background.default",
      }}
    >
      {/* Money Rain Animation */}
      <MoneyRain />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6, position: "relative", zIndex: 10 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ mb: 2, fontWeight: 700 }}
          >
            {t("title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "800px", mx: "auto" }}
          >
            {t("description")}
          </Typography>
        </Box>

        {/* Funds Grid */}
        {loading ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {funds.map(fund => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={fund.key}>
                <Link
                  href={`/funds/${fund.key}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          width: 80,
                          height: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FundLogo
                          src={fund.logo}
                          alt={fund.name}
                          className="w-full h-full rounded object-contain"
                        />
                      </Box>
                      <Box sx={{ mb: 2, pr: 10 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          {fund.name}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {t("etfFund")}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {t("tickerLabel")} {fund.key.toUpperCase()}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "wrap",
                          }}
                        >
                          {fund.cryptos.map(crypto => (
                            <Chip
                              key={crypto}
                              label={crypto}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 24,
                                backgroundColor: "primary.main",
                                color: "#ffffff",
                                "& .MuiChip-label": {
                                  px: 1,
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Statistics */}
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 4, textAlign: "center", fontWeight: 700 }}
          >
            {t("statistics.title")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
                >
                  {funds.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("statistics.totalFunds")}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "warning.main", mb: 1 }}
                >
                  $601.7B
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("statistics.totalBTCAssets")}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
                >
                  $252.9B
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("statistics.totalETHAssets")}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "success.main", mb: 1 }}
                >
                  $854.6B
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("statistics.totalAssets")}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Footer */}
      <Paper
        component="footer"
        sx={{
          mt: 8,
          py: 6,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {tBrand("name")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {tHome("footer.description")}
            </Typography>
            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                mt: 4,
                pt: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                &copy; 2024 {tBrand("name")}. {tCommon("allRightsReserved")}.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
}
