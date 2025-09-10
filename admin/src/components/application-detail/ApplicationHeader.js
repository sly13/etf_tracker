import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

function ApplicationHeader({ application, appName }) {
	const navigate = useNavigate();

	const handleEditApplication = () => {
		navigate(`/applications/edit/${appName}`);
	};

	const handleBackToApplications = () => {
		navigate('/applications');
	};

	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={handleBackToApplications}
					sx={{ mr: 2 }}
				>
					Назад
				</Button>
				<Typography variant="h4" component="h1">
					{application?.displayName}
				</Typography>
			</Box>
			<Button
				variant="contained"
				startIcon={<EditIcon />}
				onClick={handleEditApplication}
			>
				Редактировать
			</Button>
		</Box>
	);
}

export default ApplicationHeader;
