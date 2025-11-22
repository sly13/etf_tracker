import React, { useState, useEffect } from 'react';
import {
	Box,
	Card,
	CardContent,
	TextField,
	Button,
	Typography,
	Alert,
	CircularProgress,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// Если пользователь уже авторизован, перенаправляем на главную
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/');
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const result = await login(formData.username, formData.password);

			if (result.success) {
				// Успешный вход - переходим на главную страницу
				navigate('/');
			} else {
				setError(result.error);
			}
		} catch (error) {
			console.error('Ошибка входа:', error);
			setError('Ошибка входа в систему');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'background.default',
				p: 2,
				position: 'relative',
				width: '100%',
			}}
		>
			<Card
				sx={{
					maxWidth: 500,
					width: '100%',
					mx: 'auto',
					boxShadow: 6,
					borderRadius: 3,
					border: '2px solid',
					borderColor: 'primary.main',
				}}
			>
				<CardContent sx={{
					p: 4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
				}}>
					<Box sx={{ textAlign: 'center', mb: 3 }}>
						<LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
						<Typography variant="h4" component="h1" gutterBottom>
							Вход в админку
						</Typography>
						<Typography variant="body2" color="text.secondary">
							ETF Flow Tracker Admin Panel
						</Typography>
					</Box>

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<Box sx={{
						width: '100%',
						maxWidth: 350,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}>
						<form onSubmit={handleSubmit} style={{ width: '100%' }}>
							<TextField
								fullWidth
								label="Имя пользователя"
								margin="normal"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								required
								disabled={loading}
								sx={{ mb: 2 }}
							/>
							<TextField
								fullWidth
								label="Пароль"
								type="password"
								margin="normal"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								required
								disabled={loading}
								sx={{ mb: 3 }}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								size="large"
								disabled={loading}
								startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
								sx={{
									mt: 2,
									mb: 2,
									py: 1.5,
									fontSize: '1.1rem',
								}}
							>
								{loading ? 'Вход...' : '→ Войти'}
							</Button>
						</form>
					</Box>

					<Box sx={{ mt: 2, textAlign: 'center' }}>
						<Typography variant="body2" color="text.secondary">
							По умолчанию: flutter / 123
						</Typography>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}

export default Login;