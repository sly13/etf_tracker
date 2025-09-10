import React from 'react';
import { Box, Typography } from '@mui/material';

function DashboardHeader() {
	return (
		<Box>
			<Typography variant="h4" component="h1" gutterBottom>
				Дашборд системы
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				Обзор всех приложений и статистика системы
			</Typography>
		</Box>
	);
}

export default DashboardHeader;
