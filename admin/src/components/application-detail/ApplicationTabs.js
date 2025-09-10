import React from 'react';
import { Box, Tabs, Tab, Card } from '@mui/material';

function ApplicationTabs({ activeTab, onTabChange, children }) {
	return (
		<Card sx={{ mt: 3 }}>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={activeTab} onChange={onTabChange} aria-label="application tabs">
					<Tab label="Пользователи" />
					<Tab label="Данные" />
				</Tabs>
			</Box>
			{children}
		</Card>
	);
}

export default ApplicationTabs;
