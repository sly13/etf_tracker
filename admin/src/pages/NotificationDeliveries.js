import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	Chip,
	Snackbar,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import {
	Search as SearchIcon,
	Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import notificationDeliveriesService from '../services/notificationDeliveriesService';

function NotificationDeliveries() {
	const [deliveries, setDeliveries] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [sentFilter, setSentFilter] = useState('');
	const [channelFilter, setChannelFilter] = useState('');
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		hasMore: false,
	});

	const columns = [
		{ field: 'id', headerName: 'ID', flex: 1, minWidth: 200 },
		{
			field: 'sent',
			headerName: 'Статус',
			flex: 0.6,
			minWidth: 100,
			renderCell: (params) => {
				const sent = params.value;
				return (
					<Chip
						label={sent ? 'Отправлено' : 'Ожидает'}
						color={sent ? 'success' : 'warning'}
						size="small"
					/>
				);
			},
		},
		{
			field: 'channel',
			headerName: 'Канал',
			flex: 0.8,
			minWidth: 120,
			renderCell: (params) => {
				const channel = params.value || 'Не указан';
				const colorMap = {
					push: 'primary',
					telegram: 'info',
					email: 'secondary',
				};
				return (
					<Chip
						label={channel}
						color={colorMap[channel] || 'default'}
						size="small"
					/>
				);
			},
		},
		{
			field: 'record',
			headerName: 'Запись ETF',
			flex: 1.5,
			minWidth: 200,
			valueGetter: (params) => {
				const record = params.value;
				if (!record) return '-';
				const assetType = record.assetType === 'bitcoin' ? 'BTC' : record.assetType === 'ethereum' ? 'ETH' : record.assetType === 'solana' ? 'SOL' : record.assetType;
				const companyMap = {
					blackrock: 'BlackRock',
					fidelity: 'Fidelity',
					bitwise: 'Bitwise',
					twentyOneShares: '21Shares',
					vanEck: 'VanEck',
					invesco: 'Invesco',
					franklin: 'Franklin Templeton',
					grayscale: 'Grayscale',
				};
				const company = companyMap[record.company] || record.company;
				return `${assetType} - ${company}: ${record.amount?.toFixed(2)}M`;
			},
		},
		{
			field: 'user',
			headerName: 'Пользователь',
			flex: 1,
			minWidth: 150,
			valueGetter: (params) => {
				const user = params.value;
				return user?.deviceId || '-';
			},
		},
		{
			field: 'sentAt',
			headerName: 'Отправлено',
			flex: 1,
			minWidth: 150,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('ru-RU') : '-'
		},
		{
			field: 'error',
			headerName: 'Ошибка',
			flex: 1.5,
			minWidth: 200,
			renderCell: (params) => {
				const error = params.value;
				if (!error) return '-';
				return (
					<Chip
						label={error.length > 50 ? error.substring(0, 50) + '...' : error}
						color="error"
						size="small"
					/>
				);
			},
		},
		{
			field: 'createdAt',
			headerName: 'Создано',
			flex: 1,
			minWidth: 150,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('ru-RU') : '-'
		},
	];

	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

	const showSnackbar = useCallback((message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	}, []);

	const handleCloseSnackbar = useCallback(() => {
		setSnackbar({ ...snackbar, open: false });
	}, [snackbar]);

	const fetchDeliveries = useCallback(async (page, limit, search, sent, channel) => {
		setLoading(true);
		try {
			const response = await notificationDeliveriesService.getNotificationDeliveries(
				page,
				limit,
				search,
				sent,
				channel
			);
			if (response.success) {
				setDeliveries(response.deliveries || []);
				setPagination(response.pagination || { page, limit, total: 0, hasMore: false });
			} else {
				throw new Error(response.message || 'Ошибка загрузки уведомлений');
			}
		} catch (error) {
			console.error('Ошибка загрузки уведомлений:', error);
			showSnackbar('Ошибка загрузки уведомлений', 'error');
		} finally {
			setLoading(false);
		}
	}, [showSnackbar]);

	useEffect(() => {
		fetchDeliveries(pagination.page, pagination.limit, searchTerm, sentFilter, channelFilter);
	}, [pagination.page, pagination.limit, searchTerm, sentFilter, channelFilter, fetchDeliveries]);

	const handlePageChange = (newPage) => {
		setPagination({ ...pagination, page: newPage + 1 });
	};

	const handlePageSizeChange = (newPageSize) => {
		setPagination({ ...pagination, limit: newPageSize, page: 1 });
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Доставка Уведомлений
			</Typography>

			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<TextField
							sx={{ flex: 1, minWidth: 200 }}
							placeholder="Поиск по компании, типу актива или deviceId..."
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
						<FormControl sx={{ minWidth: 150 }}>
							<InputLabel>Статус</InputLabel>
							<Select
								value={sentFilter}
								label="Статус"
								onChange={(e) => setSentFilter(e.target.value)}
							>
								<MenuItem value="">Все</MenuItem>
								<MenuItem value="true">Отправлено</MenuItem>
								<MenuItem value="false">Ожидает</MenuItem>
							</Select>
						</FormControl>
						<FormControl sx={{ minWidth: 150 }}>
							<InputLabel>Канал</InputLabel>
							<Select
								value={channelFilter}
								label="Канал"
								onChange={(e) => setChannelFilter(e.target.value)}
							>
								<MenuItem value="">Все</MenuItem>
								<MenuItem value="push">Push</MenuItem>
								<MenuItem value="telegram">Telegram</MenuItem>
								<MenuItem value="email">Email</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</CardContent>
			</Card>

			<Card sx={{ width: '100%' }}>
				<CardContent sx={{ width: '100%', p: 2 }}>
					<Box sx={{ height: 600, width: '100%' }}>
						<DataGrid
							rows={deliveries}
							columns={columns}
							loading={loading}
							pageSize={pagination.limit}
							page={pagination.page - 1}
							rowsPerPageOptions={[10, 20, 50, 100]}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							rowCount={pagination.total}
							paginationMode="server"
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

export default NotificationDeliveries;

