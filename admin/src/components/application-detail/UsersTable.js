import React, { useState } from 'react';
import {
	Typography,
	Alert,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Box,
	IconButton,
	Tooltip,
	Chip,
	Collapse,
	Grid,
	Card,
	CardContent,
	Divider,
} from '@mui/material';
import {
	Settings as SettingsIcon,
	Notifications as NotificationsIcon,
	Telegram as TelegramIcon,
	Phone as PhoneIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

function UsersTable({ users, onSendNotification, onSendTelegramNotification, onSendPhoneNotification }) {
	const [expandedRows, setExpandedRows] = useState(new Set());

	const toggleRowExpansion = (userId) => {
		const newExpandedRows = new Set(expandedRows);
		if (newExpandedRows.has(userId)) {
			newExpandedRows.delete(userId);
		} else {
			newExpandedRows.add(userId);
		}
		setExpandedRows(newExpandedRows);
	};

	const SubscriptionDetails = ({ subscription }) => {
		if (!subscription) {
			return (
				<Alert severity="info" sx={{ mt: 2 }}>
					У пользователя нет активной подписки
				</Alert>
			);
		}

		return (
			<Card sx={{ mt: 2, mb: 2 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Детали подписки
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<Typography variant="subtitle2" color="text.secondary">
								ID подписки
							</Typography>
							<Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
								{subscription.id}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								RevenueCat User ID
							</Typography>
							<Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
								{subscription.revenueCatUserId || 'Не указан'}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								Transaction ID
							</Typography>
							<Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
								{subscription.originalTransactionId || 'Не указан'}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								Product ID
							</Typography>
							<Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
								{subscription.productId || 'Не указан'}
							</Typography>
						</Grid>

						<Grid item xs={12} md={6}>
							<Typography variant="subtitle2" color="text.secondary">
								Статус
							</Typography>
							<Box sx={{ mb: 1 }}>
								<Chip
									label={subscription.isActive ? 'Активна' : 'Неактивна'}
									color={subscription.isActive ? 'success' : 'error'}
									size="small"
									sx={{ mr: 1 }}
								/>
								<Chip
									label={subscription.isPremium ? 'Premium' : 'Бесплатная'}
									color={subscription.isPremium ? 'primary' : 'default'}
									size="small"
									sx={{ mr: 1 }}
								/>
								<Chip
									label={subscription.autoRenew ? 'Автопродление' : 'Без автопродления'}
									color={subscription.autoRenew ? 'info' : 'default'}
									size="small"
								/>
							</Box>

							<Typography variant="subtitle2" color="text.secondary">
								Дата покупки
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{subscription.purchaseDate
									? new Date(subscription.purchaseDate).toLocaleString('ru-RU')
									: 'Не указана'
								}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								Дата истечения
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{subscription.expirationDate
									? new Date(subscription.expirationDate).toLocaleString('ru-RU')
									: 'Не указана'
								}
							</Typography>
						</Grid>

						<Grid item xs={12}>
							<Divider sx={{ my: 1 }} />
						</Grid>

						<Grid item xs={12} md={6}>
							<Typography variant="subtitle2" color="text.secondary">
								Платформа
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{subscription.platform || 'Не указана'}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								Окружение
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{subscription.environment || 'Не указано'}
							</Typography>
						</Grid>

						<Grid item xs={12} md={6}>
							<Typography variant="subtitle2" color="text.secondary">
								Цена
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{subscription.price && subscription.currency
									? `${subscription.price} ${subscription.currency}`
									: 'Не указана'
								}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								Дата создания записи
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{new Date(subscription.createdAt).toLocaleString('ru-RU')}
							</Typography>

							<Typography variant="subtitle2" color="text.secondary">
								Дата обновления записи
							</Typography>
							<Typography variant="body2" sx={{ mb: 1 }}>
								{new Date(subscription.updatedAt).toLocaleString('ru-RU')}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		);
	};

	if (users.length === 0) {
		return (
			<Alert severity="info">
				У этого приложения пока нет пользователей
			</Alert>
		);
	}

	return (
		<TableContainer component={Paper} variant="outlined">
			<Table>
				<TableHead>
					<TableRow>
						<TableCell></TableCell>
						<TableCell>ID</TableCell>
						<TableCell>Device ID</TableCell>
						<TableCell>Device Token</TableCell>
						<TableCell>Telegram Chat ID</TableCell>
						<TableCell>OS</TableCell>
						<TableCell>Статус</TableCell>
						<TableCell>Подписка</TableCell>
						<TableCell>Настройки</TableCell>
						<TableCell>Создан</TableCell>
						<TableCell>Обновлен</TableCell>
						<TableCell>Последнее использование</TableCell>
						<TableCell>Действия</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{users.map((user) => (
						<React.Fragment key={user.id}>
							<TableRow
								sx={{
									cursor: 'pointer',
									'&:hover': { backgroundColor: 'action.hover' }
								}}
								onClick={() => toggleRowExpansion(user.id)}
							>
								<TableCell>
									<IconButton size="small">
										{expandedRows.has(user.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
									</IconButton>
								</TableCell>
								<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
									{user.id.substring(0, 8)}...
								</TableCell>
								<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
									{user.deviceId ? `${user.deviceId.substring(0, 12)}...` : 'Не указан'}
								</TableCell>
								<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
									{user.deviceToken ? `${user.deviceToken.substring(0, 12)}...` : 'Не указан'}
								</TableCell>
								<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
									{user.telegramChatId ? `${user.telegramChatId.substring(0, 12)}...` : 'Не указан'}
								</TableCell>
								<TableCell>
									{user.os ? (
										<Chip label={user.os} color="info" size="small" />
									) : (
										<Chip label="Не указан" color="default" size="small" />
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
									<Chip
										label={user.subscriptionStatus || 'Нет подписки'}
										color={
											user.subscriptionStatus === 'Активна'
												? 'success'
												: user.subscriptionStatus === 'Неактивна'
													? 'warning'
													: 'default'
										}
										size="small"
									/>
								</TableCell>
								<TableCell>
									{user.settings ? (
										<Box sx={{ maxWidth: 200 }}>
											<Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
												{JSON.stringify(user.settings, null, 2).substring(0, 100)}...
											</Typography>
										</Box>
									) : (
										<Chip label="Нет настроек" color="default" size="small" />
									)}
								</TableCell>
								<TableCell>
									{new Date(user.createdAt).toLocaleDateString('ru-RU')}
								</TableCell>
								<TableCell>
									{new Date(user.updatedAt).toLocaleDateString('ru-RU')}
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
												onClick={() => onSendNotification(user)}
											>
												<NotificationsIcon />
											</IconButton>
										</Tooltip>
										{user.telegramChatId && (
											<Tooltip title="Отправить тестовое уведомление в Telegram">
												<IconButton
													size="small"
													color="primary"
													onClick={() => onSendTelegramNotification(user)}
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
													onClick={() => onSendPhoneNotification(user)}
												>
													<PhoneIcon />
												</IconButton>
											</Tooltip>
										)}
									</Box>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={13}>
									<Collapse in={expandedRows.has(user.id)} timeout="auto" unmountOnExit>
										<Box sx={{ margin: 1 }}>
											<SubscriptionDetails subscription={user.subscriptions?.[0]} />
										</Box>
									</Collapse>
								</TableCell>
							</TableRow>
						</React.Fragment>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default UsersTable;
