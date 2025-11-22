import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Alert,
	CircularProgress,
	Switch,
	FormControlLabel,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Language as LanguageIcon,
} from '@mui/icons-material';
import languagesService from '../services/languagesService';

function Languages() {
	const [languages, setLanguages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingLanguage, setEditingLanguage] = useState(null);

	// Форма языка
	const [formData, setFormData] = useState({
		code: '',
		name: '',
		nativeName: '',
		isActive: true,
	});

	useEffect(() => {
		loadLanguages();
	}, []);

	const loadLanguages = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await languagesService.getAllLanguages();
			if (response.success) {
				setLanguages(response.languages || []);
			} else {
				setError(response.error || 'Ошибка загрузки языков');
			}
		} catch (err) {
			setError(err.message || 'Ошибка загрузки языков');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (language) => {
		if (language) {
			setEditingLanguage(language);
			setFormData({
				code: language.code,
				name: language.name,
				nativeName: language.nativeName,
				isActive: language.isActive,
			});
		} else {
			setEditingLanguage(null);
			setFormData({
				code: '',
				name: '',
				nativeName: '',
				isActive: true,
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingLanguage(null);
		setFormData({
			code: '',
			name: '',
			nativeName: '',
			isActive: true,
		});
	};

	const handleSaveLanguage = async () => {
		// Валидация
		if (!formData.code || !formData.name || !formData.nativeName) {
			setError('Все поля обязательны для заполнения');
			return;
		}

		// Проверка формата кода (2 символа, только буквы)
		if (!/^[a-z]{2}$/.test(formData.code.toLowerCase())) {
			setError('Код языка должен состоять из 2 латинских букв (например: en, ru)');
			return;
		}

		try {
			setError(null);
			const dataToSave = {
				code: formData.code.toLowerCase(),
				name: formData.name,
				nativeName: formData.nativeName,
				isActive: formData.isActive,
			};

			const response = editingLanguage
				? await languagesService.updateLanguage(editingLanguage.id, {
						name: dataToSave.name,
						nativeName: dataToSave.nativeName,
						isActive: dataToSave.isActive,
				  })
				: await languagesService.createLanguage(dataToSave);

			if (response.success) {
				handleCloseDialog();
				loadLanguages();
			} else {
				setError(response.error || 'Ошибка сохранения языка');
			}
		} catch (err) {
			setError(err.message || 'Ошибка сохранения языка');
		}
	};

	const handleDeleteLanguage = async (id) => {
		if (window.confirm('Вы уверены, что хотите удалить этот язык?')) {
			try {
				const response = await languagesService.deleteLanguage(id);
				if (response.success) {
					loadLanguages();
				} else {
					setError(response.error || 'Ошибка удаления языка');
				}
			} catch (err) {
				setError(err.message || 'Ошибка удаления языка');
			}
		}
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h4" component="h1">
					Языки
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpenDialog(null)}
				>
					Добавить язык
				</Button>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Код</TableCell>
							<TableCell>Название</TableCell>
							<TableCell>Родное название</TableCell>
							<TableCell>Статус</TableCell>
							<TableCell align="right">Действия</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{languages.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center">
									<Typography variant="body2" color="text.secondary">
										Языки не найдены
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							languages.map((language) => (
								<TableRow key={language.id}>
									<TableCell>
										<Chip
											label={language.code.toUpperCase()}
											color="primary"
											variant="outlined"
											size="small"
										/>
									</TableCell>
									<TableCell>{language.name}</TableCell>
									<TableCell>{language.nativeName}</TableCell>
									<TableCell>
										<Chip
											label={language.isActive ? 'Активен' : 'Неактивен'}
											color={language.isActive ? 'success' : 'default'}
											size="small"
										/>
									</TableCell>
									<TableCell align="right">
										<IconButton
											size="small"
											onClick={() => handleOpenDialog(language)}
											color="primary"
										>
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleDeleteLanguage(language.id)}
											color="error"
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Диалог создания/редактирования языка */}
			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>
					{editingLanguage ? 'Редактировать язык' : 'Добавить язык'}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
						<TextField
							label="Код языка (ISO 639-1)"
							value={formData.code}
							onChange={(e) =>
								setFormData({ ...formData, code: e.target.value.toLowerCase() })
							}
							disabled={!!editingLanguage}
							helperText="Двухбуквенный код языка (например: en, ru, es)"
							fullWidth
							required
						/>
						<TextField
							label="Название (на английском)"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							fullWidth
							required
						/>
						<TextField
							label="Родное название"
							value={formData.nativeName}
							onChange={(e) =>
								setFormData({ ...formData, nativeName: e.target.value })
							}
							fullWidth
							required
						/>
						<FormControlLabel
							control={
								<Switch
									checked={formData.isActive}
									onChange={(e) =>
										setFormData({ ...formData, isActive: e.target.checked })
									}
								/>
							}
							label="Активен"
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Отмена</Button>
					<Button onClick={handleSaveLanguage} variant="contained">
						Сохранить
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default Languages;

