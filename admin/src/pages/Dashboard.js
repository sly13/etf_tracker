import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import dashboardService from '../services/dashboardService';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCards from '../components/dashboard/StatsCards';
import RecentActivities from '../components/dashboard/RecentActivities';

function Dashboard() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadDashboardStats();
	}, []);

	const loadDashboardStats = async () => {
		try {
			setLoading(true);
			const data = await dashboardService.getDashboardStats();
			setStats(data);
			setError(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ mt: 2 }}>
				<Alert severity="error" sx={{ mb: 2 }}>
					Ошибка загрузки данных: {error}
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ width: '100%', maxWidth: 'none' }}>
			<DashboardHeader />
			<StatsCards stats={stats} />
			<RecentActivities activities={stats?.recentActivities} />
		</Box>
	);
}

export default Dashboard;