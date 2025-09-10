import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { People as PeopleIcon, Notifications as NotificationsIcon, ShowChart as ChartIcon, CurrencyBitcoin as BitcoinIcon } from '@mui/icons-material';

function ApplicationStats({ users, etfFlowData, btcFlowData }) {
	return (
		<Grid item xs={12} md={4}>
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Статистика
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
						<PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
						<Typography variant="h4" color="primary">
							{users?.length || 0}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
							пользователей
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
						<NotificationsIcon sx={{ mr: 1, color: 'secondary.main' }} />
						<Typography variant="body2" color="text.secondary">
							Уведомления настроены
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
						<ChartIcon sx={{ mr: 1, color: '#f57c00' }} />
						<Typography variant="h4" color="primary">
							{etfFlowData?.length || 0}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
							ETF потоков
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
						<BitcoinIcon sx={{ mr: 1, color: '#ff9800' }} />
						<Typography variant="h4" color="primary">
							{btcFlowData?.length || 0}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
							BTC потоков
						</Typography>
					</Box>
				</CardContent>
			</Card>
		</Grid>
	);
}

export default ApplicationStats;
