import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	Chip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Alert,
	Snackbar
} from '@mui/material';
import {
	Search as SearchIcon, Delete as DeleteIcon,
	Visibility as VisibilityIcon,
	Block as BlockIcon,
	CheckCircle as CheckCircleIcon,
	Notifications as NotificationsIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import usersService from '../services/usersService';
import TestNotificationDialog from '../components/TestNotificationDialog';

function Users() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
	const [notificationUser, setNotificationUser] = useState(null);

	const columns = [
		{ field: 'id', headerName: 'ID', flex: 0.4, minWidth: 60 },
		{ field: 'deviceType', headerName: 'Устройство', flex: 0.6, minWidth: 80 },
		{
			field: 'isActive',
			headerName: 'Статус',
			flex: 0.6,
			minWidth: 100,
			renderCell: (params) => (
				<Chip
					label={params.value ? 'Активен' : 'Неактивен'}
					color={params.value ? 'success' : 'error'}
					size="small"
				/>
			),
		},
		{
			field: 'subscriptionStatus',
			headerName: 'Подписка',
			flex: 0.8,
			minWidth: 120,
			renderCell: (params) => (
				<Chip
					label={params.value || 'Нет подписки'}
					color={
						params.value === 'Активна'
							? 'success'
							: params.value === 'Неактивна'
								? 'warning'
								: 'default'
					}
					size="small"
				/>
			),
		},
		{
			field: 'application',
			headerName: 'Приложение',
			flex: 1,
			minWidth: 120,
			valueGetter: (params) => params.row.application?.displayName || params.row.application?.name || 'Не указано'
		},
		{
			field: 'deviceToken',
			headerName: 'Device Token',
			flex: 1.5,
			minWidth: 200,
			valueGetter: (params) => params.value ? `${params.value.substring(0, 20)}...` : 'Не указан'
		},
		{
			field: 'telegramChatId',
			headerName: 'Telegram',
			flex: 0.8,
			minWidth: 100,
			renderCell: (params) => (
				<Chip
					label={params.value ? 'Подключен' : 'Нет'}
					color={params.value ? 'primary' : 'default'}
					size="small"
				/>
			),
		},
		{
			field: 'notifications',
			headerName: 'Уведомления',
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				const settings = params.row.settings || {};
				const notifications = settings.notifications || {};
				const enabled = [];
				if (notifications.enableETFUpdates) enabled.push('ETF');
				if (notifications.enableSignificantFlow) enabled.push('Потоки');
				if (notifications.enableTestNotifications) enabled.push('Тест');
				if (notifications.enableTelegramNotifications) enabled.push('TG');
				return enabled.length > 0 ? enabled.join(', ') : 'Отключены';
			},
		},
		{
			field: 'lastUsed',
			headerName: 'Последний вход',
			flex: 1,
			minWidth: 120,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ru-RU') : 'Никогда'
		},
		{
			field: 'createdAt',
			headerName: 'Регистрация',
			flex: 1,
			minWidth: 100,
			valueFormatter: (params) => new Date(params.value).toLocaleDateString('ru-RU')
		},
		{
			field: 'actions',
			headerName: 'Действия',
			flex: 0.8,
			minWidth: 120,
			sortable: false,
			renderCell: (params) => (
				<Box>
					<IconButton size="small" onClick={() => handleView(params.row)} title="Просмотр">
						<VisibilityIcon />
					</IconButton>
					<IconButton
						size="small"
						onClick={() => handleSendNotification(params.row)}
						title="Отправить уведомление"
						color="primary"
					>
						<NotificationsIcon />
					</IconButton>
					<IconButton size="small" onClick={() => handleToggleStatus(params.row)} title="Изменить статус">
						{params.row.isActive ? <BlockIcon /> : <CheckCircleIcon />}
					</IconButton>
					<IconButton size="small" onClick={() => handleDelete(params.row.id)} title="Удалить">
						<DeleteIcon />
					</IconButton>
				</Box>
			),
		},
	];

	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

	const showSnackbar = useCallback((message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	}, []);

	const handleCloseSnackbar = useCallback(() => {
		setSnackbar({ ...snackbar, open: false });
	}, [snackbar]);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		try {
			const response = await usersService.getUsers(1, 100, searchTerm);
			if (response.success) {
				setUsers(response.users);
			} else {
				throw new Error(response.message || 'Ошибка загрузки пользователей');
			}
		} catch (error) {
			console.error('Ошибка загрузки пользователей:', error);
			showSnackbar('Ошибка загрузки пользователей', 'error');
		} finally {
			setLoading(false);
		}
	}, [searchTerm, showSnackbar]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleView = (user) => {
		setSelectedUser(user);
		setOpenDialog(true);
	};

	const handleSendNotification = (user) => {
		setNotificationUser(user);
		setNotificationDialogOpen(true);
	};

	const handleToggleStatus = async (user) => {
		try {
			const response = await usersService.updateUserStatus(user.id, !user.isActive);
			if (response.success) {
				showSnackbar(response.message, 'success');
				fetchUsers();
			} else {
				throw new Error(response.message || 'Ошибка изменения статуса');
			}
		} catch (error) {
			console.error('Ошибка изменения статуса:', error);
			showSnackbar('Ошибка изменения статуса пользователя', 'error');
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
			try {
				const response = await usersService.deleteUser(id);
				if (response.success) {
					showSnackbar(response.message, 'success');
					fetchUsers();
				} else {
					throw new Error(response.message || 'Ошибка удаления');
				}
			} catch (error) {
				console.error('Ошибка удаления:', error);
				showSnackbar('Ошибка удаления пользователя', 'error');
			}
		}
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Пользователи
			</Typography>

			<Card sx={{ mb: 3 }}>
				<CardContent>
					<TextField
						fullWidth
						placeholder="Поиск пользователей по email, имени или User ID..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
				</CardContent>
			</Card>

			<Card sx={{ width: '100%' }}>
				<CardContent sx={{ width: '100%', p: 2 }}>
					<Box sx={{ height: 600, width: '100%' }}>
						<DataGrid
							rows={users}
							columns={columns}
							loading={loading}
							pageSize={20}
							rowsPerPageOptions={[10, 20, 50]}
							disableSelectionOnClick
							getRowId={(row) => row.id}
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
							}}
						/>
					</Box>
				</CardContent>
			</Card>

			<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
				<DialogTitle>
					Информация о пользователе
				</DialogTitle>
				<DialogContent>
					{selectedUser && (
						<Box sx={{ pt: 1 }}>
							<Typography variant="h6" sx={{ mb: 2 }}>Основная информация</Typography>
							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
								<TextField
									label="ID"
									value={selectedUser.id}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Device ID"
									value={selectedUser.deviceId || 'Не указан'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Device Token"
									value={selectedUser.deviceToken || 'Не указан'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
									multiline
									rows={2}
								/>
								<TextField
									label="Telegram Chat ID"
									value={selectedUser.telegramChatId || 'Не подключен'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Устройство"
									value={selectedUser.deviceType || 'Не указано'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Статус"
									value={selectedUser.isActive ? 'Активен' : 'Неактивен'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Приложение"
									value={selectedUser.application?.displayName || selectedUser.application?.name || 'Не указано'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Последний вход"
									value={selectedUser.lastUsed ? new Date(selectedUser.lastUsed).toLocaleString('ru-RU') : 'Никогда'}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
								<TextField
									label="Дата регистрации"
									value={new Date(selectedUser.createdAt).toLocaleString('ru-RU')}
									InputProps={{ readOnly: true }}
									variant="outlined"
									fullWidth
								/>
							</Box>

							<Typography variant="h6" sx={{ mb: 2 }}>Настройки уведомлений</Typography>
							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
								{(() => {
									const settings = selectedUser.settings || {};
									const notifications = settings.notifications || {};
									const preferences = settings.preferences || {};
									const profile = settings.profile || {};

									return (
										<>
											<TextField
												label="ETF обновления"
												value={notifications.enableETFUpdates ? 'Включены' : 'Отключены'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Значительные потоки"
												value={notifications.enableSignificantFlow ? 'Включены' : 'Отключены'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Тестовые уведомления"
												value={notifications.enableTestNotifications ? 'Включены' : 'Отключены'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Telegram уведомления"
												value={notifications.enableTelegramNotifications ? 'Включены' : 'Отключены'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Минимальный порог потока"
												value={notifications.minFlowThreshold || 'Не установлен'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Процент значительного изменения"
												value={notifications.significantChangePercent ? `${notifications.significantChangePercent}%` : 'Не установлен'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Язык"
												value={preferences.language || 'Не указан'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Часовой пояс"
												value={preferences.timezone || 'Не указан'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Версия приложения"
												value={preferences.appVersion || 'Не указана'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Версия ОС"
												value={preferences.osVersion || 'Не указана'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Имя устройства"
												value={preferences.deviceName || 'Не указано'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Email"
												value={profile.email || 'Не указан'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
											<TextField
												label="Телефон"
												value={profile.phone || 'Не указан'}
												InputProps={{ readOnly: true }}
												variant="outlined"
												fullWidth
											/>
										</>
									);
								})()}
							</Box>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)}>Закрыть</Button>
				</DialogActions>
			</Dialog>

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

export default Users;
