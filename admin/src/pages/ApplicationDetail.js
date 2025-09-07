import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Chip,
	Button,
	Grid,
	Alert,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Tooltip,
	Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	People as PeopleIcon,
	Notifications as NotificationsIcon,
	Settings as SettingsIcon,
	Telegram as TelegramIcon,
	Phone as PhoneIcon,
} from '@mui/icons-material';
import applicationsService from '../services/applicationsService';
import usersService from '../services/usersService';
import flowService from '../services/flowService';
import notificationService from '../services/notificationService';
import TestNotificationDialog from '../components/TestNotificationDialog';

function ApplicationDetail() {
	const { appName } = useParams();
	const navigate = useNavigate();
	const [application, setApplication] = useState(null);
	const [users, setUsers] = useState([]);
	const [etfFlowData, setEtfFlowData] = useState([]);
	const [btcFlowData, setBtcFlowData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingFlows, setLoadingFlows] = useState(false);
	const [error, setError] = useState(null);
	const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
	const [notificationUser, setNotificationUser] = useState(null);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

	useEffect(() => {
		if (appName) {
			fetchApplicationData();
			fetchFlowData();
		}
	}, [appName]);

	const fetchApplicationData = async () => {
		setLoading(true);
		setError(null);
		try {
			// Загружаем данные приложения
			const appResponse = await applicationsService.getApplications();
			if (appResponse.success) {
				const app = appResponse.applications.find(a => a.name === appName);
				if (app) {
					setApplication(app);
					// Загружаем пользователей приложения
					await fetchUsers(app.id);
				} else {
					setError('Приложение не найдено');
				}
			} else {
				setError('Ошибка загрузки приложения');
			}
		} catch (err) {
			console.error('Ошибка загрузки данных:', err);
			setError('Ошибка загрузки данных');
		} finally {
			setLoading(false);
		}
	};

	const fetchUsers = async (appId) => {
		try {
			const response = await usersService.getUsers();
			if (response.success) {
				// Фильтруем пользователей по приложению
				const appUsers = response.users.filter(user => user.applicationId === appId);
				setUsers(appUsers);
			}
		} catch (err) {
			console.error('Ошибка загрузки пользователей:', err);
		}
	};

	const fetchFlowData = async () => {
		setLoadingFlows(true);
		try {
			// Загружаем все данные ETF Flow и BTC Flow параллельно
			const [etfResponse, btcResponse] = await Promise.all([
				flowService.getETFFlowData(),
				flowService.getBTCFlowData()
			]);

			if (etfResponse.success) {
				// Сортируем по убыванию дат (новые сначала)
				const sortedEtfData = etfResponse.data.sort((a, b) =>
					new Date(b.date) - new Date(a.date)
				);
				setEtfFlowData(sortedEtfData);
			}
			if (btcResponse.success) {
				// Сортируем по убыванию дат (новые сначала)
				const sortedBtcData = btcResponse.data.sort((a, b) =>
					new Date(b.date) - new Date(a.date)
				);
				setBtcFlowData(sortedBtcData);
			}
		} catch (err) {
			console.error('Ошибка загрузки данных потоков:', err);
		} finally {
			setLoadingFlows(false);
		}
	};

	const handleEditApplication = () => {
		navigate(`/applications/edit/${appName}`);
	};

	const handleBackToApplications = () => {
		navigate('/applications');
	};

	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleSendNotification = (user) => {
		setNotificationUser(user);
		setNotificationDialogOpen(true);
	};

	const handleSendTelegramNotification = async (user) => {
		try {
			const response = await notificationService.sendTestTelegramNotification(
				user.id,
				'Тестовое уведомление из админской панели'
			);

			if (response.success) {
				showSnackbar('Тестовое уведомление в Telegram отправлено!', 'success');
			} else {
				showSnackbar(response.error || 'Ошибка отправки уведомления в Telegram', 'error');
			}
		} catch (error) {
			console.error('Ошибка отправки Telegram уведомления:', error);
			showSnackbar('Ошибка отправки уведомления в Telegram', 'error');
		}
	};

	const handleSendPhoneNotification = async (user) => {
		try {
			const response = await notificationService.sendTestPhoneNotification(
				user.id,
				'Тестовое уведомление на телефон из админской панели'
			);

			if (response.success) {
				showSnackbar('Тестовое уведомление на телефон отправлено!', 'success');
			} else {
				showSnackbar(response.error || 'Ошибка отправки уведомления на телефон', 'error');
			}
		} catch (error) {
			console.error('Ошибка отправки уведомления на телефон:', error);
			showSnackbar('Ошибка отправки уведомления на телефон', 'error');
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={handleBackToApplications}
					sx={{ mb: 2 }}
				>
					Назад к приложениям
				</Button>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	if (!application) {
		return (
			<Box>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={handleBackToApplications}
					sx={{ mb: 2 }}
				>
					Назад к приложениям
				</Button>
				<Alert severity="warning">Приложение не найдено</Alert>
			</Box>
		);
	}

	return (
		<Box>
			{/* Заголовок */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={handleBackToApplications}
						sx={{ mr: 2 }}
					>
						Назад
					</Button>
					<Typography variant="h4" component="h1">
						{application.displayName}
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<EditIcon />}
					onClick={handleEditApplication}
				>
					Редактировать
				</Button>
			</Box>

			{/* Информация о приложении */}
			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Информация о приложении
							</Typography>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Имя приложения
								</Typography>
								<Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
									{application.name}
								</Typography>
							</Box>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Описание
								</Typography>
								<Typography variant="body1">
									{application.description || 'Описание не указано'}
								</Typography>
							</Box>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Статус
								</Typography>
								<Chip
									label={application.isActive ? 'Активно' : 'Неактивно'}
									color={application.isActive ? 'success' : 'default'}
									size="small"
								/>
							</Box>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Создано
								</Typography>
								<Typography variant="body1">
									{new Date(application.createdAt).toLocaleDateString('ru-RU')}
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Статистика
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
								<Typography variant="h4" color="primary">
									{users.length}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
									пользователей
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<NotificationsIcon sx={{ mr: 1, color: 'secondary.main' }} />
								<Typography variant="body2" color="text.secondary">
									Уведомления настроены
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Пользователи приложения */}
			<Card sx={{ mt: 3 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Пользователи приложения
					</Typography>
					{users.length === 0 ? (
						<Alert severity="info">
							У этого приложения пока нет пользователей
						</Alert>
					) : (
						<TableContainer component={Paper} variant="outlined">
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>ID</TableCell>
										<TableCell>Device ID</TableCell>
										<TableCell>Telegram</TableCell>
										<TableCell>Статус</TableCell>
										<TableCell>Последнее использование</TableCell>
										<TableCell>Действия</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user.id}>
											<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
												{user.id.substring(0, 8)}...
											</TableCell>
											<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
												{user.deviceId ? `${user.deviceId.substring(0, 8)}...` : 'Не указан'}
											</TableCell>
											<TableCell>
												{user.telegramChatId ? (
													<Chip label="Подключен" color="success" size="small" />
												) : (
													<Chip label="Не подключен" color="default" size="small" />
												)}
											</TableCell>
											<TableCell>
												<Chip
													label={user.isActive ? 'Активен' : 'Неактивен'}
													color={user.isActive ? 'success' : 'default'}
													size="small"
												/>
											</TableCell>
											<TableCell>
												{new Date(user.lastUsed).toLocaleDateString('ru-RU')}
											</TableCell>
											<TableCell>
												<Box sx={{ display: 'flex', gap: 1 }}>
													<Tooltip title="Настройки пользователя">
														<IconButton size="small">
															<SettingsIcon />
														</IconButton>
													</Tooltip>
													<Tooltip title="Отправить тестовое уведомление">
														<IconButton
															size="small"
															color="primary"
															onClick={() => handleSendNotification(user)}
														>
															<NotificationsIcon />
														</IconButton>
													</Tooltip>
													{user.telegramChatId && (
														<Tooltip title="Отправить тестовое уведомление в Telegram">
															<IconButton
																size="small"
																color="primary"
																onClick={() => handleSendTelegramNotification(user)}
															>
																<TelegramIcon />
															</IconButton>
														</Tooltip>
													)}
													{user.deviceToken && (
														<Tooltip title="Отправить тестовое уведомление на телефон">
															<IconButton
																size="small"
																color="secondary"
																onClick={() => handleSendPhoneNotification(user)}
															>
																<PhoneIcon />
															</IconButton>
														</Tooltip>
													)}
												</Box>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</CardContent>
			</Card>

			{/* Таблицы данных потоков */}
			<Grid container spacing={3} sx={{ mt: 2 }}>
				{/* ETF Flow (Ethereum) */}
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								ETF Flow Data (Ethereum)
							</Typography>
							{loadingFlows ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
									<CircularProgress />
								</Box>
							) : (
								<Box sx={{ height: 400, width: '100%' }}>
									<DataGrid
										rows={etfFlowData}
										getRowId={(row) => row.date}
										columns={[
											{ field: 'date', headerName: 'Дата', flex: 1, minWidth: 120, valueFormatter: (params) => new Date(params.value).toLocaleDateString('ru-RU') },
											{ field: 'blackrock', headerName: 'BlackRock', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'fidelity', headerName: 'Fidelity', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'bitwise', headerName: 'Bitwise', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'twentyOneShares', headerName: '21Shares', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'vanEck', headerName: 'VanEck', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'invesco', headerName: 'Invesco', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'franklin', headerName: 'Franklin', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'grayscale', headerName: 'Grayscale', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'grayscaleEth', headerName: 'Grayscale ETH', flex: 1, minWidth: 120, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'total', headerName: 'Total', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00', cellClassName: 'font-bold' },
										]}
										paginationModel={{ page: 0, pageSize: 10 }}
										pageSizeOptions={[10, 25, 50]}
										autoSizeColumns={true}
										autoSizeColumnsOnMount={true}
										sx={{
											width: '100%',
											border: 'none',
											'& .MuiDataGrid-root': {
												border: 'none',
											},
											'& .MuiDataGrid-cell': {
												borderBottom: '1px solid #e0e0e0',
											},
											'& .MuiDataGrid-columnHeaders': {
												borderBottom: '2px solid #e0e0e0',
											},
											'& .MuiDataGrid-columnHeader': {
												fontWeight: 'bold',
											},
											'& .font-bold': {
												fontWeight: 'bold',
											},
										}}
									/>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>

				{/* BTC Flow (Bitcoin) */}
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								BTC Flow Data (Bitcoin)
							</Typography>
							{loadingFlows ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
									<CircularProgress />
								</Box>
							) : (
								<Box sx={{ height: 400, width: '100%' }}>
									<DataGrid
										rows={btcFlowData}
										getRowId={(row) => row.date}
										columns={[
											{ field: 'date', headerName: 'Дата', flex: 1, minWidth: 120, valueFormatter: (params) => new Date(params.value).toLocaleDateString('ru-RU') },
											{ field: 'blackrock', headerName: 'BlackRock', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'fidelity', headerName: 'Fidelity', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'bitwise', headerName: 'Bitwise', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'twentyOneShares', headerName: '21Shares', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'vanEck', headerName: 'VanEck', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'invesco', headerName: 'Invesco', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'franklin', headerName: 'Franklin', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'grayscale', headerName: 'Grayscale', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'grayscaleBtc', headerName: 'Grayscale BTC', flex: 1, minWidth: 120, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'valkyrie', headerName: 'Valkyrie', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'wisdomTree', headerName: 'WisdomTree', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00' },
											{ field: 'total', headerName: 'Total', flex: 1, minWidth: 100, valueFormatter: (params) => params.value?.toFixed(2) || '0.00', cellClassName: 'font-bold' },
										]}
										paginationModel={{ page: 0, pageSize: 10 }}
										pageSizeOptions={[10, 25, 50]}
										autoSizeColumns={true}
										autoSizeColumnsOnMount={true}
										sx={{
											width: '100%',
											border: 'none',
											'& .MuiDataGrid-root': {
												border: 'none',
											},
											'& .MuiDataGrid-cell': {
												borderBottom: '1px solid #e0e0e0',
											},
											'& .MuiDataGrid-columnHeaders': {
												borderBottom: '2px solid #e0e0e0',
											},
											'& .MuiDataGrid-columnHeader': {
												fontWeight: 'bold',
											},
											'& .font-bold': {
												fontWeight: 'bold',
											},
										}}
									/>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>

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

			<TestNotificationDialog
				open={notificationDialogOpen}
				onClose={() => setNotificationDialogOpen(false)}
				user={notificationUser}
			/>
		</Box>
	);
}

export default ApplicationDetail;
