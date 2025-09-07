// Пример интеграции Telegram настроек в мобильное приложение

class TelegramIntegration {
	constructor() {
		this.baseUrl = 'https://your-backend.com';
		this.deviceId = null;
		this.userId = null;
	}

	// Генерация уникального Device ID
	generateDeviceId() {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substr(2, 9);
		return `device_${timestamp}_${random}`;
	}

	// Регистрация устройства при первом запуске
	async registerDevice(fcmToken, userInfo) {
		try {
			const deviceId = this.generateDeviceId();

			const response = await fetch(`${this.baseUrl}/applications/register-device`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: fcmToken,
					appName: 'etf.flow',
					userId: userInfo.userId,
					deviceId: deviceId,
					deviceInfo: {
						deviceType: Platform.OS,
						appVersion: '1.0.0',
						firstName: userInfo.firstName,
						lastName: userInfo.lastName,
						email: userInfo.email,
					},
				}),
			});

			const result = await response.json();

			if (result.success) {
				this.deviceId = result.deviceId;
				this.userId = result.userId;

				// Сохраняем локально
				await this.saveDeviceInfo(result.deviceId, result.userId);

				console.log('✅ Устройство зарегистрировано:', result.deviceId);
				return result.deviceId;
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('❌ Ошибка регистрации устройства:', error);
			throw error;
		}
	}

	// Сохранение Device ID локально
	async saveDeviceInfo(deviceId, userId) {
		try {
			await AsyncStorage.setItem('deviceId', deviceId);
			await AsyncStorage.setItem('userId', userId);
		} catch (error) {
			console.error('Ошибка сохранения Device ID:', error);
		}
	}

	// Загрузка Device ID из локального хранилища
	async loadDeviceInfo() {
		try {
			this.deviceId = await AsyncStorage.getItem('deviceId');
			this.userId = await AsyncStorage.getItem('userId');
			return this.deviceId;
		} catch (error) {
			console.error('Ошибка загрузки Device ID:', error);
			return null;
		}
	}

	// Открытие Telegram бота с Device ID
	async openTelegramBot() {
		if (!this.deviceId) {
			throw new Error('Device ID не найден. Сначала зарегистрируйте устройство.');
		}

		const botUrl = `https://t.me/your_bot_username?start=${this.deviceId}`;

		try {
			const canOpen = await Linking.canOpenURL(botUrl);
			if (canOpen) {
				await Linking.openURL(botUrl);
				return true;
			} else {
				throw new Error('Не удалось открыть Telegram');
			}
		} catch (error) {
			console.error('Ошибка открытия Telegram:', error);
			throw error;
		}
	}

	// Проверка статуса Telegram подключения
	async checkTelegramStatus() {
		if (!this.deviceId) {
			return { isLinked: false, message: 'Device ID не найден' };
		}

		try {
			const response = await fetch(`${this.baseUrl}/applications/user/${this.deviceId}`);
			const result = await response.json();

			if (result.success) {
				return {
					isLinked: result.user.enableTelegramNotifications,
					user: result.user,
				};
			} else {
				return { isLinked: false, message: result.message };
			}
		} catch (error) {
			console.error('Ошибка проверки статуса:', error);
			return { isLinked: false, message: 'Ошибка проверки статуса' };
		}
	}

	// Отвязка Telegram аккаунта
	async unlinkTelegram() {
		if (!this.deviceId) {
			throw new Error('Device ID не найден');
		}

		try {
			const response = await fetch(`${this.baseUrl}/applications/unlink-telegram`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					deviceToken: 'your_fcm_token', // Получить из Firebase
				}),
			});

			const result = await response.json();

			if (result.success) {
				console.log('✅ Telegram аккаунт отвязан');
				return true;
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error('Ошибка отвязки Telegram:', error);
			throw error;
		}
	}
}

// React Native компонент для настроек
const TelegramSettingsComponent = ({ deviceId, userId }) => {
	const [isLinked, setIsLinked] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const telegramIntegration = new TelegramIntegration();

	useEffect(() => {
		checkStatus();
	}, []);

	const checkStatus = async () => {
		try {
			const status = await telegramIntegration.checkTelegramStatus();
			setIsLinked(status.isLinked);
		} catch (error) {
			console.error('Ошибка проверки статуса:', error);
		}
	};

	const handleConnectTelegram = async () => {
		setIsLoading(true);

		try {
			await telegramIntegration.openTelegramBot();

			Alert.alert(
				'Инструкции',
				'Telegram откроется автоматически. Отправьте команду /start боту для привязки аккаунта.',
				[{ text: 'Понятно' }]
			);
		} catch (error) {
			Alert.alert('Ошибка', error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnectTelegram = async () => {
		try {
			await telegramIntegration.unlinkTelegram();
			setIsLinked(false);
			Alert.alert('Успех', 'Telegram аккаунт отвязан');
		} catch (error) {
			Alert.alert('Ошибка', error.message);
		}
	};

	return (
		<View style={styles.telegramSection}>
			<View style={styles.telegramHeader}>
				<Text style={styles.telegramTitle}>Telegram Notifications</Text>
				{isLinked && (
					<View style={styles.statusBadge}>
						<Text style={styles.statusText}>Connected</Text>
					</View>
				)}
			</View>

			<Text style={styles.telegramDescription}>
				Get real-time ETF flow updates directly in Telegram
			</Text>

			{isLinked ? (
				<TouchableOpacity
					style={[styles.button, styles.unlinkButton]}
					onPress={handleDisconnectTelegram}
				>
					<Text style={styles.unlinkButtonText}>Disconnect Telegram</Text>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					style={[styles.button, styles.linkButton]}
					onPress={handleConnectTelegram}
					disabled={isLoading}
				>
					<Text style={styles.linkButtonText}>
						{isLoading ? 'Opening...' : 'Connect Telegram'}
					</Text>
				</TouchableOpacity>
			)}

			<Text style={styles.deviceIdText}>
				Device ID: {deviceId}
			</Text>
		</View>
	);
};

// Стили для компонента
const styles = StyleSheet.create({
	telegramSection: {
		backgroundColor: '#2a2a2a',
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
	},
	telegramHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	telegramTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ffffff',
	},
	statusBadge: {
		backgroundColor: '#4CAF50',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#ffffff',
	},
	telegramDescription: {
		fontSize: 14,
		color: '#cccccc',
		marginBottom: 16,
		lineHeight: 20,
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 12,
	},
	linkButton: {
		backgroundColor: '#0088cc',
	},
	unlinkButton: {
		backgroundColor: '#ff4444',
	},
	linkButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ffffff',
	},
	unlinkButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ffffff',
	},
	deviceIdText: {
		fontSize: 12,
		color: '#666666',
		textAlign: 'center',
	},
});

// Инициализация в главном компоненте приложения
const App = () => {
	const [deviceId, setDeviceId] = useState(null);
	const telegramIntegration = new TelegramIntegration();

	useEffect(() => {
		initializeDevice();
	}, []);

	const initializeDevice = async () => {
		try {
			// Сначала пытаемся загрузить существующий Device ID
			let existingDeviceId = await telegramIntegration.loadDeviceInfo();

			if (!existingDeviceId) {
				// Если Device ID нет, регистрируем новое устройство
				const fcmToken = await getFCMToken(); // Получить из Firebase
				const userInfo = {
					userId: 'user_12345', // Получить из локального хранилища
					firstName: 'Иван',
					lastName: 'Петров',
					email: 'ivan@example.com',
				};

				existingDeviceId = await telegramIntegration.registerDevice(fcmToken, userInfo);
			}

			setDeviceId(existingDeviceId);
		} catch (error) {
			console.error('Ошибка инициализации устройства:', error);
		}
	};

	return (
		<View style={styles.container}>
			{/* Ваш основной интерфейс */}

			{/* В разделе настроек */}
			{deviceId && (
				<TelegramSettingsComponent
					deviceId={deviceId}
					userId={telegramIntegration.userId}
				/>
			)}
		</View>
	);
};

export default App;
