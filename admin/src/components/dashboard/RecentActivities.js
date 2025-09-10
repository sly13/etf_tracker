import React from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from '@mui/material';

function RecentActivities({ activities }) {
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getNotificationTypeLabel = (type) => {
		const types = {
			'etf_update': 'Обновление ETF',
			'significant_flow': 'Значительный поток',
			'test': 'Тестовое',
		};
		return types[type] || type;
	};

	return (
		<Box sx={{ mt: 4, width: '100%' }}>
			<Card sx={{ width: '100%' }}>
				<CardHeader title="Последние активности" />
				<CardContent sx={{ width: '100%' }}>
					{activities && activities.length > 0 ? (
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Тип</TableCell>
										<TableCell>Заголовок</TableCell>
										<TableCell>Отправлено</TableCell>
										<TableCell>Успешно</TableCell>
										<TableCell>Ошибки</TableCell>
										<TableCell>Дата</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{activities.map((activity) => (
										<TableRow key={activity.id}>
											<TableCell>
												<Chip
													label={getNotificationTypeLabel(activity.type)}
													size="small"
													color={activity.type === 'test' ? 'default' : 'primary'}
												/>
											</TableCell>
											<TableCell>{activity.title}</TableCell>
											<TableCell>{activity.sentToTokens}</TableCell>
											<TableCell sx={{ color: 'success.main' }}>
												{activity.successCount}
											</TableCell>
											<TableCell sx={{ color: 'error.main' }}>
												{activity.failureCount}
											</TableCell>
											<TableCell>{formatDate(activity.createdAt)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Typography variant="body2" color="text.secondary">
							Нет данных об активностях
						</Typography>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}

export default RecentActivities;
