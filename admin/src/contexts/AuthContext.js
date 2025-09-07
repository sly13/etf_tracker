import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('admin_token');
		if (token) {
			setIsAuthenticated(true);
			// Здесь можно добавить проверку токена
		}
		setLoading(false);
	}, []);

	const login = async (username, password) => {
		try {
			const response = await api.post('/admin/login', {
				username,
				password,
			});

			const { access_token, user } = response.data;
			localStorage.setItem('admin_token', access_token);
			setIsAuthenticated(true);
			setUser(user);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка авторизации'
			};
		}
	};

	const logout = () => {
		localStorage.removeItem('admin_token');
		setIsAuthenticated(false);
		setUser(null);
	};

	const value = {
		isAuthenticated,
		user,
		login,
		logout,
		loading,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
