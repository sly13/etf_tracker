import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Typography,
	Alert,
	CircularProgress,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Divider
} from '@mui/material';
import {
	Phone as PhoneIcon,
	Telegram as TelegramIcon,
	Send as SendIcon,
	Notifications as NotificationsIcon
} from '@mui/icons-material';
import notificationService from '../services/notificationService';

function TestNotificationDialog({ open, onClose, user }) {
	const [message, setMessage] = useState('');
	const [notificationType, setNotificationType] = useState('phone');
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);

	const handleSend = async () => {
		if (!user || !message.trim()) {
			setResult({ success: false, message: 'Пожалуйста, введите сообщение' });
			return;
		}

		setLoading(true);
		setResult(null);

		try {
			let response;

			if (notificationType === 'phone') {
				if (!user.deviceToken) {
					setResult({
						success: false,
						message: 'У пользователя не настроен device token для push уведомлений'
					});
					setLoading(false);
					return;
				}
				response = await notificationService.sendTestPhoneNotification(user.id, message);
			} else if (notificationType === 'telegram') {
				if (!user.telegramChatId) {
					setResult({
						success: false,
						message: 'У пользователя не настроен Telegram'
					});
					setLoading(false);
					return;
				}
				response = await notificationService.sendTestTelegramNotification(user.id, message);
			}

			setResult(response);
		} catch (error) {
			setResult({
				success: false,
				message: error.response?.data?.error || 'Ошибка отправки уведомления'
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setMessage('');
		setResult(null);
		setNotificationType('phone');
		onClose();
	};

	const canSendPhone = user?.deviceToken;
	const canSendTelegram = user?.telegramChatId;

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<NotificationsIcon color="primary" />
					<Typography variant="h6">
						Отправить тестовое уведомление
					</Typography>
				</Box>
			</DialogTitle>

			<DialogContent>
				{user && (
					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle1" gutterBottom>
							Пользователь: {user.id}
						</Typography>

						<Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
							<Chip
								icon={<PhoneIcon />}
								label={canSendPhone ? 'Push уведомления доступны' : 'Push уведомления недоступны'}
								color={canSendPhone ? 'success' : 'default'}
								size="small"
							/>
							<Chip
								icon={<TelegramIcon />}
								label={canSendTelegram ? 'Telegram доступен' : 'Telegram недоступен'}
								color={canSendTelegram ? 'success' : 'default'}
								size="small"
							/>
						</Box>

						<Divider sx={{ my: 2 }} />

						<FormControl fullWidth sx={{ mb: 2 }}>
							<InputLabel>Тип уведомления</InputLabel>
							<Select
								value={notificationType}
								label="Тип уведомления"
								onChange={(e) => setNotificationType(e.target.value)}
							>
								<MenuItem value="phone" disabled={!canSendPhone}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<PhoneIcon fontSize="small" />
										Push уведомление на телефон
									</Box>
								</MenuItem>
								<MenuItem value="telegram" disabled={!canSendTelegram}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<TelegramIcon fontSize="small" />
										Telegram сообщение
									</Box>
								</MenuItem>
							</Select>
						</FormControl>

						<TextField
							fullWidth
							multiline
							rows={3}
							label="Сообщение"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Введите текст тестового уведомления..."
							sx={{ mb: 2 }}
						/>

						{result && (
							<Alert
								severity={result.success ? 'success' : 'error'}
								sx={{ mb: 2 }}
							>
								{result.message || result.error}
							</Alert>
						)}
					</Box>
				)}
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose} disabled={loading}>
					Отмена
				</Button>
				<Button
					onClick={handleSend}
					variant="contained"
					startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
					disabled={loading || !message.trim() || (!canSendPhone && !canSendTelegram)}
				>
					{loading ? 'Отправка...' : 'Отправить'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default TestNotificationDialog;

