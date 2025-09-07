import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Alert,
	Button,
	Snackbar,
} from '@mui/material';
import {
	Apps as AppsIcon,
	People as PeopleIcon,
	TrendingUp as TrendingUpIcon,
	Notifications as NotificationsIcon,
	ShowChart as ChartIcon,
	CurrencyBitcoin as BitcoinIcon,
	Send as SendIcon,
} from '@mui/icons-material';
import dashboardService from '../services/dashboardService';
import notificationService from '../services/notificationService';

function Dashboard() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [notificationLoading, setNotificationLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getNotificationTypeLabel = (type) => {
		const types = {
			'etf_update': 'Обновление ETF',
			'significant_flow': 'Значительный поток',
			'test': 'Тестовое',
		};
		return types[type] || type;
	};

	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleSendTestNotification = async () => {
		setNotificationLoading(true);
		try {
			const response = await notificationService.sendTestNotificationToAll();
			if (response.success) {
				showSnackbar('Тестовое уведомление отправлено всем пользователям', 'success');
			} else {
				showSnackbar(response.message || 'Ошибка отправки уведомления', 'error');
			}
		} catch (error) {
			showSnackbar('Ошибка отправки уведомления', 'error');
		} finally {
			setNotificationLoading(false);
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

	const statsCards = [
		{
			title: 'Всего приложений',
			value: stats?.totalApplications || 0,
			icon: <AppsIcon />,
			color: '#1976d2',
		},
		{
			title: 'Активные пользователи',
			value: stats?.totalUsers || 0,
			icon: <PeopleIcon />,
			color: '#2e7d32',
		},
		{
			title: 'Уведомления сегодня',
			value: stats?.notificationsToday || 0,
			icon: <NotificationsIcon />,
			color: '#ed6c02',
		},
		{
			title: 'Рост пользователей',
			value: `${stats?.userGrowth || 0}%`,
			icon: <TrendingUpIcon />,
			color: '#9c27b0',
		},
		{
			title: 'ETF потоки',
			value: stats?.etfFlowCount || 0,
			icon: <ChartIcon />,
			color: '#f57c00',
		},
		{
			title: 'BTC потоки',
			value: stats?.btcFlowCount || 0,
			icon: <BitcoinIcon />,
			color: '#ff9800',
		},
	];

	return (
		<Box sx={{ width: '100%', maxWidth: 'none' }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
				<Box>
					<Typography variant="h4" component="h1" gutterBottom>
						Дашборд системы
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Обзор всех приложений и статистика системы
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={notificationLoading ? <CircularProgress size={20} /> : <SendIcon />}
					onClick={handleSendTestNotification}
					disabled={notificationLoading}
					sx={{ ml: 2 }}
				>
					{notificationLoading ? 'Отправка...' : 'Отправить тестовое уведомление всем'}
				</Button>
			</Box>

			<Grid container spacing={3} sx={{ width: '100%' }}>
				{statsCards.map((stat, index) => (
					<Grid item xs={12} sm={6} md={4} lg={2} key={index} sx={{ display: 'flex' }}>
						<Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
							<CardContent sx={{ flexGrow: 1, width: '100%' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
									<Box
										sx={{
											backgroundColor: stat.color,
											color: 'white',
											borderRadius: 1,
											p: 1,
											mr: 2,
										}}
									>
										{stat.icon}
									</Box>
									<Typography variant="h6" component="div">
										{stat.title}
									</Typography>
								</Box>
								<Typography variant="h3" component="div" color="primary">
									{stat.value}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			<Box sx={{ mt: 4, width: '100%' }}>
				<Card sx={{ width: '100%' }}>
					<CardHeader title="Последние активности" />
					<CardContent sx={{ width: '100%' }}>
						{stats?.recentActivities && stats.recentActivities.length > 0 ? (
							<TableContainer component={Paper}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Тип</TableCell>
											<TableCell>Заголовок</TableCell>
											<TableCell>Отправлено</TableCell>
											<TableCell>Успешно</TableCell>
											<TableCell>Ошибки</TableCell>
											<TableCell>Дата</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{stats.recentActivities.map((activity) => (
											<TableRow key={activity.id}>
												<TableCell>
													<Chip
														label={getNotificationTypeLabel(activity.type)}
														size="small"
														color={activity.type === 'test' ? 'default' : 'primary'}
													/>
												</TableCell>
												<TableCell>{activity.title}</TableCell>
												<TableCell>{activity.sentToTokens}</TableCell>
												<TableCell sx={{ color: 'success.main' }}>
													{activity.successCount}
												</TableCell>
												<TableCell sx={{ color: 'error.main' }}>
													{activity.failureCount}
												</TableCell>
												<TableCell>{formatDate(activity.createdAt)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<Typography variant="body2" color="text.secondary">
								Нет данных об активностях
							</Typography>
						)}
					</CardContent>
				</Card>
			</Box>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}

export default Dashboard;
