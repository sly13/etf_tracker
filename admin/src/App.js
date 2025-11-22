import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Users from './pages/Users';
import ETFNewRecords from './pages/ETFNewRecords';
import NotificationDeliveries from './pages/NotificationDeliveries';
import Funds from './pages/Funds';
import Languages from './pages/Languages';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
	const { isAuthenticated, loading } = useAuth();

	// Пока идет проверка аутентификации, показываем загрузчик
	if (loading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Layout>
							<Dashboard />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/applications"
				element={
					<ProtectedRoute>
						<Layout>
							<Applications />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/applications/:appName"
				element={
					<ProtectedRoute>
						<Layout>
							<ApplicationDetail />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/users"
				element={
					<ProtectedRoute>
						<Layout>
							<Users />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/etf-new-records"
				element={
					<ProtectedRoute>
						<Layout>
							<ETFNewRecords />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/notification-deliveries"
				element={
					<ProtectedRoute>
						<Layout>
							<NotificationDeliveries />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/funds"
				element={
					<ProtectedRoute>
						<Layout>
							<Funds />
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/languages"
				element={
					<ProtectedRoute>
						<Layout>
							<Languages />
						</Layout>
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}

function App() {
	return (
		<AuthProvider>
			<Box sx={{ display: 'flex', minHeight: '100vh' }}>
				<AppRoutes />
			</Box>
		</AuthProvider>
	);
}

export default App;
