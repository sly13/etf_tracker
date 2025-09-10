import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Grid } from '@mui/material';

function ApplicationInfo({ application }) {
	return (
		<Grid container spacing={3}>
			<Grid item xs={12} md={8}>
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Информация о приложении
						</Typography>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Имя приложения
							</Typography>
							<Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
								{application?.name}
							</Typography>
						</Box>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Описание
							</Typography>
							<Typography variant="body1">
								{application?.description || 'Описание не указано'}
							</Typography>
						</Box>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Статус
							</Typography>
							<Chip
								label={application?.isActive ? 'Активно' : 'Неактивно'}
								color={application?.isActive ? 'success' : 'default'}
								size="small"
							/>
						</Box>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Создано
							</Typography>
							<Typography variant="body1">
								{new Date(application?.createdAt).toLocaleDateString('ru-RU')}
							</Typography>
						</Box>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
}

export default ApplicationInfo;
