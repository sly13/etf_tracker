import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BotManagement from "./pages/BotManagement";
import OKXPanel from "./pages/OKXPanel";
import Monitoring from "./pages/Monitoring";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

// Компонент для навигации с табами
function NavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем текущий таб на основе URL
  const getCurrentTab = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 0;
      case '/bot-management':
        return 1;
      case '/okx-panel':
        return 2;
      case '/monitoring':
        return 3;
      default:
        return 0;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        navigate('/bot-management');
        break;
      case 2:
        navigate('/okx-panel');
        break;
      case 3:
        navigate('/monitoring');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={getCurrentTab()}
        onChange={handleTabChange}
        aria-label="bot management tabs"
      >
        <Tab label="Dashboard" />
        <Tab label="Bot Management" />
        <Tab label="OKX Panel" />
        <Tab label="Monitoring" />
      </Tabs>
    </Box>
  );
}

// Компонент для основного контента приложения
function AppContent() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🤖 Trade Bot Monitor
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl">
          <NavigationTabs />
          
          <Box sx={{ p: 3 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bot-management" element={<BotManagement />} />
              <Route path="/okx-panel" element={<OKXPanel />} />
              <Route path="/monitoring" element={<Monitoring />} />
              {/* Fallback для неизвестных путей */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
