import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Users from './pages/Users';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? children : <Navigate to="/login" />;
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
