import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	Chip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Alert,
	Snackbar,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import applicationsService from '../services/applicationsService';

function Applications() {
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingApp, setEditingApp] = useState(null);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [formData, setFormData] = useState({
		name: '',
		displayName: '',
		description: '',
		isActive: true,
	});
	const navigate = useNavigate();

	const columns = [
		{ field: 'id', headerName: 'ID', flex: 0.5, minWidth: 70 },
		{ field: 'name', headerName: 'Имя', flex: 1, minWidth: 120 },
		{ field: 'displayName', headerName: 'Отображаемое название', flex: 1.5, minWidth: 180 },
		{ field: 'userCount', headerName: 'Пользователи', flex: 0.8, minWidth: 100 },
		{
			field: 'isActive',
			headerName: 'Статус',
			flex: 0.8,
			minWidth: 120,
			renderCell: (params) => (
				<Chip
					label={params.value ? 'Активно' : 'Неактивно'}
					color={params.value ? 'success' : 'default'}
					size="small"
				/>
			),
		},
		{
			field: 'createdAt',
			headerName: 'Создано',
			flex: 1,
			minWidth: 120,
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
					<IconButton size="small" onClick={() => handleView(params.row)}>
						<VisibilityIcon />
					</IconButton>
					<IconButton size="small" onClick={() => handleEdit(params.row)}>
						<EditIcon />
					</IconButton>
					<IconButton size="small" onClick={() => handleDelete(params.row.id)}>
						<DeleteIcon />
					</IconButton>
				</Box>
			),
		},
	];

	useEffect(() => {
		fetchApplications();
	}, []);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			const response = await applicationsService.getApplications();
			if (response.success) {
				setApplications(response.applications);
			} else {
				showSnackbar(response.message || 'Ошибка загрузки приложений', 'error');
			}
		} catch (error) {
			console.error('Ошибка загрузки приложений:', error);
			showSnackbar(error.message || 'Ошибка загрузки приложений', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = () => {
		setEditingApp(null);
		setFormData({
			name: '',
			displayName: '',
			description: '',
			isActive: true,
		});
		setOpenDialog(true);
	};

	const handleEdit = (app) => {
		setEditingApp(app);
		setFormData({
			name: app.name,
			displayName: app.displayName,
			description: app.description || '',
			isActive: app.isActive,
		});
		setOpenDialog(true);
	};

	const handleView = (app) => {
		// Здесь можно открыть модальное окно с подробной информацией
		console.log('Просмотр приложения:', app);
	};

	const handleDelete = async (id) => {
		if (window.confirm('Вы уверены, что хотите удалить это приложение?')) {
			try {
				const response = await applicationsService.deleteApplication(id);
				if (response.success) {
					showSnackbar('Приложение успешно удалено', 'success');
					fetchApplications();
				} else {
					showSnackbar(response.message || 'Ошибка удаления приложения', 'error');
				}
			} catch (error) {
				console.error('Ошибка удаления:', error);
				showSnackbar(error.message || 'Ошибка удаления приложения', 'error');
			}
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			let response;
			if (editingApp) {
				response = await applicationsService.updateApplication(editingApp.id, formData);
			} else {
				response = await applicationsService.createApplication(formData);
			}

			if (response.success) {
				showSnackbar(
					editingApp ? 'Приложение успешно обновлено' : 'Приложение успешно создано',
					'success'
				);
				setOpenDialog(false);
				fetchApplications();
			} else {
				showSnackbar(response.message || 'Ошибка сохранения приложения', 'error');
			}
		} catch (error) {
			console.error('Ошибка сохранения:', error);
			showSnackbar(error.message || 'Ошибка сохранения приложения', 'error');
		} finally {
			setSaving(false);
		}
	};

	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleRowClick = (params) => {
		// Переходим на страницу приложения при клике на строку
		navigate(`/applications/${params.row.name}`);
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h4" component="h1">
					Приложения
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleCreate}
				>
					Создать приложение
				</Button>
			</Box>

			<Card sx={{ width: '100%' }}>
				<CardContent sx={{ width: '100%', p: 2 }}>
					{applications.length === 0 ? (
						<Box sx={{ textAlign: 'center', py: 4 }}>
							<Typography variant="h6" color="text.secondary" gutterBottom>
								Приложения не найдены
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Создайте первое приложение для начала работы
							</Typography>
							<Button variant="outlined" onClick={handleCreate}>
								Создать приложение
							</Button>
						</Box>
					) : (
						<Box sx={{ height: 400, width: '100%' }}>
							<DataGrid
								rows={applications}
								columns={columns}
								loading={loading}
								pageSize={10}
								rowsPerPageOptions={[10, 25, 50]}
								onRowClick={handleRowClick}
								autoSizeColumns={true}
								autoSizeColumnsOnMount={true}
								sx={{
									width: '100%',
									border: 'none',
									cursor: 'pointer',
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
									'& .MuiDataGrid-row:hover': {
										backgroundColor: '#f5f5f5',
									},
								}}
							/>
						</Box>
					)}
				</CardContent>
			</Card>

			<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle>
					{editingApp ? 'Редактировать приложение' : 'Создать приложение'}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 1 }}>
						<TextField
							autoFocus
							margin="dense"
							label="Имя приложения"
							fullWidth
							variant="outlined"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							disabled={editingApp} // Нельзя изменить имя существующего приложения
							helperText={editingApp ? "Имя приложения нельзя изменить" : "Уникальное имя для API"}
							sx={{ mb: 2 }}
						/>
						<TextField
							margin="dense"
							label="Отображаемое название"
							fullWidth
							variant="outlined"
							value={formData.displayName}
							onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
							sx={{ mb: 2 }}
						/>
						<TextField
							margin="dense"
							label="Описание"
							fullWidth
							multiline
							rows={3}
							variant="outlined"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							sx={{ mb: 2 }}
						/>
						<TextField
							margin="dense"
							label="Статус"
							fullWidth
							select
							SelectProps={{ native: true }}
							variant="outlined"
							value={formData.isActive}
							onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
						>
							<option value={true}>Активно</option>
							<option value={false}>Неактивно</option>
						</TextField>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)} disabled={saving}>
						Отмена
					</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						disabled={saving || !formData.name || !formData.displayName}
						startIcon={saving ? <CircularProgress size={20} /> : null}
					>
						{saving ? 'Сохранение...' : (editingApp ? 'Обновить' : 'Создать')}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default Applications;
