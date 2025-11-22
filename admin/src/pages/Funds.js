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
	CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
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
	const [logoPreview, setLogoPreview] = useState(null);
	const [logoFile, setLogoFile] = useState(null);

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

	// Функция для получения правильного URL изображения
	const getImageUrl = (url) => {
		if (!url) return null;
		// Если это base64 или полный URL, возвращаем как есть
		if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}
		// Если это относительный путь, используем URL бэкенда для изображений
		// Изображения теперь хранятся на бэкенде в uploads/fund_logos/
		const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3066/api';
		const baseUrl = apiUrl.replace('/api', '');
		// Убеждаемся, что путь начинается с /
		const imagePath = url.startsWith('/') ? url : `/${url}`;
		return `${baseUrl}${imagePath}`;
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
			setLogoPreview(fund.logoUrl ? getImageUrl(fund.logoUrl) : null);
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
			setLogoPreview(null);
		}
		setLogoFile(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingFund(null);
		setLogoPreview(null);
		setLogoFile(null);
	};

	const handleSaveFund = async () => {
		try {
			let logoUrlToSave = formData.logoUrl;

			// Если загружен новый файл, загружаем его на бэкенд
			if (logoFile) {
				const uploadResponse = await fundsService.uploadLogo(logoFile);
				if (uploadResponse.success) {
					logoUrlToSave = uploadResponse.url;
				} else {
					setError(uploadResponse.error || 'Ошибка загрузки логотипа');
					return;
				}
			}

			const dataToSave = {
				...formData,
				logoUrl: logoUrlToSave,
			};

			const response = editingFund
				? await fundsService.updateFund(editingFund.fundKey, dataToSave)
				: await fundsService.createFund(dataToSave);

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

	const onDrop = async (acceptedFiles) => {
		if (acceptedFiles && acceptedFiles.length > 0) {
			const file = acceptedFiles[0];
			// Проверяем размер файла (макс 10MB)
			if (file.size > 10 * 1024 * 1024) {
				setError('Размер файла не должен превышать 10MB');
				return;
			}

			// Показываем превью сразу
			const reader = new FileReader();
			reader.onload = () => {
				setLogoPreview(reader.result);
			};
			reader.onerror = () => {
				setError('Ошибка чтения файла');
			};
			reader.readAsDataURL(file);

			// Сохраняем файл для последующей загрузки
			setLogoFile(file);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
		},
		maxFiles: 1,
	});

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
							<TableCell width={80}>Логотип</TableCell>
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
								<TableCell>
									{fund.logoUrl ? (
										<Box
											component="img"
											src={getImageUrl(fund.logoUrl)}
											alt={fund.name}
											onError={(e) => {
												e.target.style.display = 'none';
											}}
											sx={{
												width: 50,
												height: 50,
												objectFit: 'contain',
												borderRadius: 1,
												backgroundColor: 'background.paper',
											}}
										/>
									) : (
										<Box
											sx={{
												width: 50,
												height: 50,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: 'background.paper',
												borderRadius: 1,
												border: '1px solid',
												borderColor: 'divider',
											}}
										>
											<Typography variant="caption" color="text.secondary">
												Нет
											</Typography>
										</Box>
									)}
								</TableCell>
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
						<Grid item xs={12}>
							<Typography variant="body2" sx={{ mb: 1 }}>
								Логотип фонда
							</Typography>
							<Box
								{...getRootProps()}
								sx={{
									border: '2px dashed',
									borderColor: isDragActive ? 'primary.main' : 'divider',
									borderRadius: 2,
									p: 3,
									textAlign: 'center',
									cursor: 'pointer',
									backgroundColor: isDragActive ? 'action.hover' : 'transparent',
									transition: 'all 0.2s',
									'&:hover': {
										borderColor: 'primary.main',
										backgroundColor: 'action.hover',
									},
								}}
							>
								<input {...getInputProps()} />
								{logoPreview ? (
									<Box>
										<Box
											component="img"
											src={logoPreview.startsWith('data:') ? logoPreview : getImageUrl(logoPreview)}
											alt="Логотип фонда"
											onError={(e) => {
												console.error('Ошибка загрузки изображения:', logoPreview);
												// Показываем сообщение об ошибке вместо скрытия
												const errorBox = e.target.parentElement;
												if (errorBox && !errorBox.querySelector('.error-message')) {
													const errorMsg = document.createElement('div');
													errorMsg.className = 'error-message';
													errorMsg.style.cssText = 'color: red; padding: 8px; text-align: center;';
													errorMsg.textContent = 'Не удалось загрузить изображение';
													errorBox.appendChild(errorMsg);
												}
												e.target.style.display = 'none';
											}}
											onLoad={(e) => {
												// Убираем сообщение об ошибке, если изображение загрузилось
												const errorBox = e.target.parentElement;
												const errorMsg = errorBox?.querySelector('.error-message');
												if (errorMsg) {
													errorMsg.remove();
												}
											}}
											sx={{
												maxWidth: '100%',
												maxHeight: 200,
												mb: 2,
												borderRadius: 1,
												objectFit: 'contain',
												backgroundColor: 'background.paper',
												border: '1px solid',
												borderColor: 'divider',
											}}
										/>
										<Typography variant="body2" color="text.secondary">
											Нажмите или перетащите файл для замены
										</Typography>
									</Box>
								) : (
									<Box>
										<CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
										<Typography variant="body1" sx={{ mb: 1 }}>
											{isDragActive ? 'Отпустите файл здесь' : 'Нажмите или перетащите изображение сюда'}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											PNG, JPG, GIF до 10MB
										</Typography>
									</Box>
								)}
							</Box>
							{logoPreview && (
								<Button
									size="small"
									color="error"
									onClick={async (e) => {
										e.stopPropagation();

										// Если это загруженный файл, просто отменяем загрузку
										if (logoFile) {
											setLogoFile(null);
											if (editingFund && editingFund.logoUrl) {
												setLogoPreview(getImageUrl(editingFund.logoUrl));
												setFormData({ ...formData, logoUrl: editingFund.logoUrl });
											} else {
												setLogoPreview(null);
												setFormData({ ...formData, logoUrl: '' });
											}
											return;
										}

										// Если это существующее изображение, удаляем его с бэкенда
										if (formData.logoUrl && formData.logoUrl.startsWith('/uploads/')) {
											const filename = formData.logoUrl.split('/').pop();
											const deleteResponse = await fundsService.deleteLogo(filename);
											if (deleteResponse.success) {
												setLogoPreview(null);
												setFormData({ ...formData, logoUrl: '' });
											} else {
												setError(deleteResponse.error || 'Ошибка удаления логотипа');
											}
										} else {
											// Просто очищаем поле
											setLogoPreview(null);
											setFormData({ ...formData, logoUrl: '' });
										}
									}}
									sx={{ mt: 1 }}
								>
									{logoFile ? 'Отменить загрузку' : 'Удалить изображение'}
								</Button>
							)}
							<TextField
								fullWidth
								label="URL логотипа (альтернатива)"
								value={formData.logoUrl}
								onChange={(e) => {
									setFormData({ ...formData, logoUrl: e.target.value });
									if (!logoFile) {
										if (e.target.value) {
											setLogoPreview(getImageUrl(e.target.value));
										} else if (!editingFund || !editingFund.logoUrl) {
											setLogoPreview(null);
										}
									}
								}}
								sx={{ mt: 2 }}
								helperText="Или введите URL изображения напрямую"
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

