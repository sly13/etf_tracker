"use client";

export const runtime = 'edge';

import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  TrendingUp,
  Security,
} from "@mui/icons-material";
import { useTranslations } from 'next-intl';
import ETFSummaryCard from "../../components/ETFSummaryCard";
import FundHoldingsCard from "../../components/FundHoldingsCard";
import LatestNewsCard from "../../components/LatestNewsCard";
import CEFIIndexCard from "../../components/CEFIIndexCard";
import Navigation from "../../components/Navigation";

export default function Home() {
  const theme = useTheme();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.75rem" },
            }}
          >
            {t('title')}
            <Box
              component="span"
              sx={{
                display: "block",
                color: "primary.main",
                mt: 1,
              }}
            >
              {t('subtitle')}
            </Box>
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "600px", mx: "auto" }}
          >
            {t('description')}
          </Typography>
        </Box>

        {/* Latest News Section */}
        <LatestNewsCard />

        {/* CEFI Index Section */}
        <CEFIIndexCard />

        {/* ETF Summary Section */}
        <ETFSummaryCard />

        {/* Fund Holdings Section */}
        <FundHoldingsCard />

        {/* Features Section */}
        <Box sx={{ mt: 10 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 6, textAlign: "center", fontWeight: 700 }}
          >
            {t('whyChoose')}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            <Box>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "primary.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <BarChart sx={{ color: "primary.main" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {t('features.realtimeAnalysis.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('features.realtimeAnalysis.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "success.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <TrendingUp sx={{ color: "success.main" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {t('features.portfolioManagement.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('features.portfolioManagement.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "secondary.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Security sx={{ color: "secondary.main" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {t('features.security.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('features.security.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* CTA Section */}
        <Paper
          sx={{
            mt: 10,
            p: 6,
            textAlign: "center",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
          }}
        >
          <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
            {t('cta.title')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {t('cta.description')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              color: "primary.main",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            {tCommon('contactUs')}
          </Button>
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
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Crypto ETFs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('footer.description')}
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
                &copy; 2024 Crypto ETFs. {tCommon('allRightsReserved')}.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
}

