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
	MenuItem,
	Alert,
	CircularProgress,
	Grid,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Language as LanguageIcon,
} from '@mui/icons-material';
import fundsService from '../services/fundsService';

const SUPPORTED_LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'ru', name: 'Русский' },
	{ code: 'zh', name: '中文' },
	{ code: 'ja', name: '日本語' },
	{ code: 'pt', name: 'Português' },
	{ code: 'es', name: 'Español' },
	{ code: 'tr', name: 'Türkçe' },
	{ code: 'vi', name: 'Tiếng Việt' },
	{ code: 'ko', name: '한국어' },
	{ code: 'ar', name: 'العربية' },
];

function Funds() {
	const [funds, setFunds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [openTranslationDialog, setOpenTranslationDialog] = useState(false);
	const [editingFund, setEditingFund] = useState(null);
	const [selectedFund, setSelectedFund] = useState(null);
	const [translations, setTranslations] = useState([]);

	// Форма фонда
	const [formData, setFormData] = useState({
		fundKey: '',
		name: '',
		description: '',
		logoUrl: '',
		ticker: '',
		fundType: 'ETF',
		feePercentage: 0.25,
		launchDate: '',
		status: 'active',
	});

	// Форма перевода
	const [translationData, setTranslationData] = useState({
		language: 'en',
		name: '',
		description: '',
	});

	useEffect(() => {
		loadFunds();
	}, []);

	const loadFunds = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fundsService.getAllFunds();
			if (response.success) {
				setFunds(response.funds || []);
			} else {
				setError(response.error || 'Ошибка загрузки фондов');
			}
		} catch (err) {
			setError(err.message || 'Ошибка загрузки фондов');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (fund) => {
		if (fund) {
			setEditingFund(fund);
			setFormData({
				fundKey: fund.fundKey,
				name: fund.name,
				description: fund.description || '',
				logoUrl: fund.logoUrl || '',
				ticker: fund.ticker || '',
				fundType: fund.fundType || 'ETF',
				feePercentage: fund.feePercentage || 0.25,
				launchDate: fund.launchDate ? fund.launchDate.split('T')[0] : '',
				status: fund.status || 'active',
			});
		} else {
			setEditingFund(null);
			setFormData({
				fundKey: '',
				name: '',
				description: '',
				logoUrl: '',
				ticker: '',
				fundType: 'ETF',
				feePercentage: 0.25,
				launchDate: '',
				status: 'active',
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingFund(null);
	};

	const handleSaveFund = async () => {
		try {
			const response = editingFund
				? await fundsService.updateFund(editingFund.fundKey, formData)
				: await fundsService.createFund(formData);

			if (response.success) {
				handleCloseDialog();
				loadFunds();
			} else {
				setError(response.error || 'Ошибка сохранения фонда');
			}
		} catch (err) {
			setError(err.message || 'Ошибка сохранения фонда');
		}
	};

	const handleDeleteFund = async (fundKey) => {
		if (window.confirm('Вы уверены, что хотите удалить этот фонд?')) {
			try {
				const response = await fundsService.deleteFund(fundKey);
				if (response.success) {
					loadFunds();
				} else {
					setError(response.error || 'Ошибка удаления фонда');
				}
			} catch (err) {
				setError(err.message || 'Ошибка удаления фонда');
			}
		}
	};

	const handleOpenTranslationDialog = async (fund) => {
		setSelectedFund(fund);
		try {
			const response = await fundsService.getTranslations(fund.fundKey);
			if (response.success) {
				setTranslations(response.translations || []);
				setTranslationData({
					language: 'en',
					name: '',
					description: '',
				});
				setOpenTranslationDialog(true);
			} else {
				setError(response.error || 'Ошибка загрузки переводов');
			}
		} catch (err) {
			setError(err.message || 'Ошибка загрузки переводов');
		}
	};

	const handleCloseTranslationDialog = () => {
		setOpenTranslationDialog(false);
		setSelectedFund(null);
		setTranslations([]);
	};

	const handleSaveTranslation = async () => {
		if (!selectedFund) return;

		try {
			const response = await fundsService.createOrUpdateTranslation(
				selectedFund.fundKey,
				translationData.language,
				{
					name: translationData.name || undefined,
					description: translationData.description || undefined,
				}
			);

			if (response.success) {
				setTranslationData({
					language: 'en',
					name: '',
					description: '',
				});
				const transResponse = await fundsService.getTranslations(selectedFund.fundKey);
				if (transResponse.success) {
					setTranslations(transResponse.translations || []);
				}
			} else {
				setError(response.error || 'Ошибка сохранения перевода');
			}
		} catch (err) {
			setError(err.message || 'Ошибка сохранения перевода');
		}
	};

	const handleDeleteTranslation = async (language) => {
		if (!selectedFund) return;

		if (window.confirm('Вы уверены, что хотите удалить этот перевод?')) {
			try {
				const response = await fundsService.deleteTranslation(selectedFund.fundKey, language);
				if (response.success) {
					const transResponse = await fundsService.getTranslations(selectedFund.fundKey);
					if (transResponse.success) {
						setTranslations(transResponse.translations || []);
					}
				} else {
					setError(response.error || 'Ошибка удаления перевода');
				}
			} catch (err) {
				setError(err.message || 'Ошибка удаления перевода');
			}
		}
	};

	const handleEditTranslation = (translation) => {
		setTranslationData({
			language: translation.language,
			name: translation.name || '',
			description: translation.description || '',
		});
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<Typography variant="h4" component="h1" fontWeight="bold">
					Управление фондами
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpenDialog()}
				>
					Создать фонд
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
							<TableCell>Ключ</TableCell>
							<TableCell>Название</TableCell>
							<TableCell>Тикер</TableCell>
							<TableCell>Тип</TableCell>
							<TableCell>Статус</TableCell>
							<TableCell>Языки</TableCell>
							<TableCell align="right">Действия</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{funds.map((fund) => (
							<TableRow key={fund.fundKey}>
								<TableCell>{fund.fundKey}</TableCell>
								<TableCell>{fund.name}</TableCell>
								<TableCell>{fund.ticker || '-'}</TableCell>
								<TableCell>{fund.fundType || 'ETF'}</TableCell>
								<TableCell>
									<Chip
										label={fund.status === 'active' ? 'Активный' : fund.status}
										color={fund.status === 'active' ? 'success' : 'default'}
										size="small"
									/>
								</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
										{fund.availableLanguages && fund.availableLanguages.length > 0 ? (
											fund.availableLanguages.map((lang) => (
												<Chip
													key={lang}
													label={lang.toUpperCase()}
													size="small"
													variant="outlined"
												/>
											))
										) : (
											<Typography variant="caption" color="text.secondary">
												Нет переводов
											</Typography>
										)}
									</Box>
								</TableCell>
								<TableCell align="right">
									<IconButton
										size="small"
										onClick={() => handleOpenTranslationDialog(fund)}
										title="Управление переводами"
									>
										<LanguageIcon />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => handleOpenDialog(fund)}
										title="Редактировать"
									>
										<EditIcon />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => handleDeleteFund(fund.fundKey)}
										title="Удалить"
										color="error"
									>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Диалог создания/редактирования фонда */}
			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
				<DialogTitle>
					{editingFund ? 'Редактировать фонд' : 'Создать фонд'}
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={2} sx={{ mt: 1 }}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Ключ фонда"
								value={formData.fundKey}
								onChange={(e) => setFormData({ ...formData, fundKey: e.target.value })}
								disabled={!!editingFund}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Название"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Описание"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								multiline
								rows={4}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="URL логотипа"
								value={formData.logoUrl}
								onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Тикер"
								value={formData.ticker}
								onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								select
								label="Тип фонда"
								value={formData.fundType}
								onChange={(e) => setFormData({ ...formData, fundType: e.target.value })}
							>
								<MenuItem value="ETF">ETF</MenuItem>
								<MenuItem value="Mutual Fund">Mutual Fund</MenuItem>
							</TextField>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Комиссия (%)"
								type="number"
								value={formData.feePercentage}
								onChange={(e) =>
									setFormData({ ...formData, feePercentage: parseFloat(e.target.value) || 0 })
								}
								inputProps={{ step: 0.01, min: 0, max: 100 }}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Дата запуска"
								type="date"
								value={formData.launchDate}
								onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								select
								label="Статус"
								value={formData.status}
								onChange={(e) => setFormData({ ...formData, status: e.target.value })}
							>
								<MenuItem value="active">Активный</MenuItem>
								<MenuItem value="inactive">Неактивный</MenuItem>
							</TextField>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Отмена</Button>
					<Button onClick={handleSaveFund} variant="contained">
						Сохранить
					</Button>
				</DialogActions>
			</Dialog>

			{/* Диалог управления переводами */}
			<Dialog
				open={openTranslationDialog}
				onClose={handleCloseTranslationDialog}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					Переводы для: {selectedFund?.name}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ mb: 3 }}>
						<Typography variant="h6" gutterBottom>
							Добавить/Редактировать перевод
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={4}>
								<TextField
									fullWidth
									select
									label="Язык"
									value={translationData.language}
									onChange={(e) =>
										setTranslationData({ ...translationData, language: e.target.value })
									}
								>
									{SUPPORTED_LANGUAGES.map((lang) => (
										<MenuItem key={lang.code} value={lang.code}>
											{lang.name}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12} sm={8}>
								<TextField
									fullWidth
									label="Название"
									value={translationData.name}
									onChange={(e) =>
										setTranslationData({ ...translationData, name: e.target.value })
									}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="Описание"
									value={translationData.description}
									onChange={(e) =>
										setTranslationData({ ...translationData, description: e.target.value })
									}
									multiline
									rows={3}
								/>
							</Grid>
							<Grid item xs={12}>
								<Button
									variant="contained"
									onClick={handleSaveTranslation}
									fullWidth
								>
									Сохранить перевод
								</Button>
							</Grid>
						</Grid>
					</Box>

					<Typography variant="h6" gutterBottom>
						Существующие переводы
					</Typography>
					{translations.length > 0 ? (
						<TableContainer>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Язык</TableCell>
										<TableCell>Название</TableCell>
										<TableCell>Описание</TableCell>
										<TableCell align="right">Действия</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{translations.map((trans) => (
										<TableRow key={trans.id}>
											<TableCell>
												<Chip
													label={trans.language.toUpperCase()}
													size="small"
												/>
											</TableCell>
											<TableCell>{trans.name || '-'}</TableCell>
											<TableCell>
												{trans.description
													? trans.description.substring(0, 50) + '...'
													: '-'}
											</TableCell>
											<TableCell align="right">
												<IconButton
													size="small"
													onClick={() => handleEditTranslation(trans)}
												>
													<EditIcon />
												</IconButton>
												<IconButton
													size="small"
													onClick={() => handleDeleteTranslation(trans.language)}
													color="error"
												>
													<DeleteIcon />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Typography variant="body2" color="text.secondary">
							Нет переводов
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseTranslationDialog}>Закрыть</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default Funds;

