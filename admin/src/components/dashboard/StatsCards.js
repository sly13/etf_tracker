import React from 'react';
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
} from '@mui/material';
import {
	Apps as AppsIcon,
	People as PeopleIcon,
	TrendingUp as TrendingUpIcon,
	Notifications as NotificationsIcon,
} from '@mui/icons-material';

function StatsCards({ stats }) {
	const statsCards = [
		{
			title: 'Всего приложений',
			value: stats?.totalApplications || 0,
			icon: <AppsIcon />,
			color: '#1976d2',
		},
		{
			title: 'Активные пользователи',
			value: stats?.totalUsers || 0,
			icon: <PeopleIcon />,
			color: '#2e7d32',
		},
		{
			title: 'Уведомления сегодня',
			value: stats?.notificationsToday || 0,
			icon: <NotificationsIcon />,
			color: '#ed6c02',
		},
		{
			title: 'Рост пользователей',
			value: `${stats?.userGrowth || 0}%`,
			icon: <TrendingUpIcon />,
			color: '#9c27b0',
		},
	];

	return (
		<Grid container spacing={3} sx={{ width: '100%' }}>
			{statsCards.map((stat, index) => (
				<Grid item xs={12} sm={6} md={4} lg={2} key={index} sx={{ display: 'flex' }}>
					<Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
						<CardContent sx={{ flexGrow: 1, width: '100%' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<Box
									sx={{
										backgroundColor: stat.color,
										color: 'white',
										borderRadius: 1,
										p: 1,
										mr: 2,
									}}
								>
									{stat.icon}
								</Box>
								<Typography variant="h6" component="div">
									{stat.title}
								</Typography>
							</Box>
							<Typography variant="h3" component="div" color="primary">
								{stat.value}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}

export default StatsCards;
