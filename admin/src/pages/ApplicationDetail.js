import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
	Box,
	Typography,
	Alert,
	CircularProgress,
	Snackbar,
	Grid,
} from '@mui/material';
import applicationsService from '../services/applicationsService';
import usersService from '../services/usersService';
import flowService from '../services/flowService';
import notificationService from '../services/notificationService';
import TestNotificationDialog from '../components/TestNotificationDialog';
import ApplicationHeader from '../components/application-detail/ApplicationHeader';
import ApplicationInfo from '../components/application-detail/ApplicationInfo';
import ApplicationStats from '../components/application-detail/ApplicationStats';
import ApplicationTabs from '../components/application-detail/ApplicationTabs';
import UsersTable from '../components/application-detail/UsersTable';
import ETFDataTable from '../components/application-detail/ETFDataTable';

function ApplicationDetail() {
	const { appName } = useParams();
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
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		if (appName) {
			fetchApplicationData();
			fetchFlowData();
		}
	}, [appName]); // eslint-disable-line react-hooks/exhaustive-deps

	const fetchApplicationData = async () => {
		try {
			setLoading(true);
			const [appResponse, usersResponse] = await Promise.all([
				applicationsService.getApplication(appName),
				usersService.getUsersByApplication(appName)
			]);

			if (appResponse.success) {
				setApplication(appResponse.application);
			} else {
				setError(appResponse.error || 'Ошибка загрузки приложения');
			}

			if (usersResponse.success) {
				setUsers(usersResponse.users);
			} else {
				setError(usersResponse.error || 'Ошибка загрузки пользователей');
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchFlowData = async () => {
		setLoadingFlows(true);
		try {
			const [etfResponse, btcResponse] = await Promise.all([
				flowService.getETFFlowData(),
				flowService.getBTCFlowData()
			]);

			if (etfResponse.success) {
				const sortedEtfData = etfResponse.data.sort((a, b) =>
					new Date(b.date) - new Date(a.date)
				);
				setEtfFlowData(sortedEtfData);
			}
			if (btcResponse.success) {
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

	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
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

	const etfColumns = [
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
	];

	const btcColumns = [
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
	];

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
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	if (!application) {
		return (
			<Box>
				<Alert severity="warning">Приложение не найдено</Alert>
			</Box>
		);
	}

	return (
		<Box>
			<ApplicationHeader application={application} appName={appName} />

			<Grid container spacing={3}>
				<ApplicationInfo application={application} />
				<ApplicationStats users={users} etfFlowData={etfFlowData} btcFlowData={btcFlowData} />
			</Grid>

			<ApplicationTabs activeTab={activeTab} onTabChange={handleTabChange}>
				{activeTab === 0 && (
					<Box sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Пользователи приложения
						</Typography>
						<UsersTable
							users={users}
							onSendNotification={handleSendNotification}
							onSendTelegramNotification={handleSendTelegramNotification}
							onSendPhoneNotification={handleSendPhoneNotification}
						/>
					</Box>
				)}

				{activeTab === 1 && (
					<Box sx={{ p: 3 }}>
						<Grid container spacing={3}>
							<ETFDataTable
								title="ETF Flow Data (Ethereum)"
								data={etfFlowData}
								loading={loadingFlows}
								columns={etfColumns}
							/>
							<ETFDataTable
								title="BTC Flow Data (Bitcoin)"
								data={btcFlowData}
								loading={loadingFlows}
								columns={btcColumns}
							/>
						</Grid>
					</Box>
				)}
			</ApplicationTabs>

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