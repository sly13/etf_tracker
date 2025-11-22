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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
	IconButton,
} from '@mui/material';
import {
	Search as SearchIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import etfNewRecordsService from '../services/etfNewRecordsService';

function ETFNewRecords() {
	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 50,
		total: 0,
		hasMore: false,
	});

	const columns = [
		{ field: 'id', headerName: 'ID', flex: 1, minWidth: 200 },
		{
			field: 'date',
			headerName: 'Дата',
			flex: 0.8,
			minWidth: 120,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ru-RU') : '-'
		},
		{
			field: 'assetType',
			headerName: 'Тип актива',
			flex: 0.8,
			minWidth: 100,
			renderCell: (params) => {
				const type = params.value || '';
				const color = type === 'bitcoin' ? 'warning' : type === 'ethereum' ? 'info' : 'success';
				const label = type === 'bitcoin' ? 'Bitcoin' : type === 'ethereum' ? 'Ethereum' : type === 'solana' ? 'Solana' : type;
				return (
					<Chip
						label={label}
						color={color}
						size="small"
					/>
				);
			},
		},
		{
			field: 'company',
			headerName: 'Компания',
			flex: 1,
			minWidth: 150,
			valueGetter: (params) => {
				const companyMap = {
					blackrock: 'BlackRock',
					fidelity: 'Fidelity',
					bitwise: 'Bitwise',
					twentyOneShares: '21Shares',
					vanEck: 'VanEck',
					invesco: 'Invesco',
					franklin: 'Franklin Templeton',
					grayscale: 'Grayscale',
					grayscaleBtc: 'Grayscale BTC',
					grayscaleEth: 'Grayscale Crypto',
					valkyrie: 'Valkyrie',
					wisdomTree: 'WisdomTree',
				};
				return companyMap[params.value] || params.value || '-';
			},
		},
		{
			field: 'amount',
			headerName: 'Сумма (млн)',
			flex: 0.8,
			minWidth: 120,
			valueFormatter: (params) => params.value != null ? `${params.value.toFixed(2)}` : '-'
		},
		{
			field: 'previousAmount',
			headerName: 'Предыдущая сумма (млн)',
			flex: 0.8,
			minWidth: 150,
			valueFormatter: (params) => params.value != null ? `${params.value.toFixed(2)}` : '-'
		},
		{
			field: 'detectedAt',
			headerName: 'Обнаружено',
			flex: 1,
			minWidth: 150,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('ru-RU') : '-'
		},
		{
			field: 'dedupeKey',
			headerName: 'Dedupe Key',
			flex: 1.5,
			minWidth: 200,
		},
		{
			field: 'createdAt',
			headerName: 'Создано',
			flex: 1,
			minWidth: 150,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('ru-RU') : '-'
		},
		{
			field: 'updatedAt',
			headerName: 'Обновлено',
			flex: 1,
			minWidth: 150,
			valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('ru-RU') : '-'
		},
		{
			field: 'actions',
			headerName: 'Действия',
			flex: 0.8,
			minWidth: 100,
			sortable: false,
			renderCell: (params) => {
				return (
					<IconButton
						color="error"
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							setDeleteDialog({
								open: true,
								recordId: params.row.id,
								record: params.row,
							});
						}}
					>
						<DeleteIcon />
					</IconButton>
				);
			},
		},
	];

	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [deleteDialog, setDeleteDialog] = useState({ open: false, recordId: null, record: null });

	const showSnackbar = useCallback((message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	}, []);

	const handleCloseSnackbar = useCallback(() => {
		setSnackbar({ ...snackbar, open: false });
	}, [snackbar]);

	const fetchRecords = useCallback(async (page, limit, search) => {
		setLoading(true);
		try {
			const response = await etfNewRecordsService.getNewRecords(
				page,
				limit,
				search
			);
			if (response.success) {
				setRecords(response.records || []);
				setPagination(response.pagination || { page, limit, total: 0, hasMore: false });
			} else {
				throw new Error(response.message || 'Ошибка загрузки записей');
			}
		} catch (error) {
			console.error('Ошибка загрузки записей:', error);
			showSnackbar('Ошибка загрузки записей', 'error');
		} finally {
			setLoading(false);
		}
	}, [showSnackbar]);

	useEffect(() => {
		fetchRecords(pagination.page, pagination.limit, searchTerm);
	}, [pagination.page, pagination.limit, searchTerm, fetchRecords]);

	const handlePageChange = (newPage) => {
		setPagination({ ...pagination, page: newPage + 1 });
	};

	const handlePageSizeChange = (newPageSize) => {
		setPagination({ ...pagination, limit: newPageSize, page: 1 });
	};

	const handleDeleteConfirm = async () => {
		if (!deleteDialog.recordId) return;

		try {
			await etfNewRecordsService.deleteRecord(deleteDialog.recordId);
			showSnackbar('Запись успешно удалена', 'success');
			setDeleteDialog({ open: false, recordId: null, record: null });
			// Обновляем список записей
			fetchRecords(pagination.page, pagination.limit, searchTerm);
		} catch (error) {
			console.error('Ошибка удаления записи:', error);
			showSnackbar('Ошибка удаления записи', 'error');
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialog({ open: false, recordId: null, record: null });
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Typography variant="h4" component="h1" gutterBottom>
				ETF Новые записи
			</Typography>

			<Card sx={{ mb: 3 }}>
				<CardContent>
					<TextField
						fullWidth
						placeholder="Поиск по компании или типу актива..."
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
							rows={records}
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
									borderBottom: '1px solid',
									borderColor: 'divider',
								},
								'& .MuiDataGrid-columnHeaders': {
									borderBottom: '2px solid',
									borderColor: 'divider',
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

			<Dialog
				open={deleteDialog.open}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">
					Подтверждение удаления
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						Вы уверены, что хотите удалить эту запись?
						{deleteDialog.record && (
							<Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
								<Typography variant="body2">
									<strong>Тип актива:</strong> {deleteDialog.record.assetType}
								</Typography>
								<Typography variant="body2">
									<strong>Компания:</strong> {deleteDialog.record.company}
								</Typography>
								<Typography variant="body2">
									<strong>Сумма:</strong> {deleteDialog.record.amount?.toFixed(2)} млн
								</Typography>
								<Typography variant="body2">
									<strong>Дата:</strong> {deleteDialog.record.date ? new Date(deleteDialog.record.date).toLocaleDateString('ru-RU') : '-'}
								</Typography>
							</Box>
						)}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						Отмена
					</Button>
					<Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
						Удалить
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default ETFNewRecords;

