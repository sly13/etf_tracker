module.exports = {
	apps: [
		{
			name: 'etf-tracker-backend',
			script: 'dist/main.js',
			instances: 1,
			autorestart: true,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'development',
				PORT: 3066,
				HOST: '0.0.0.0',
				// Настройки Puppeteer для сервера
				PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'false',
				PUPPETEER_EXECUTABLE_PATH: '/usr/bin/google-chrome-stable',
				PUPPETEER_ARGS: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-accelerated-2d-canvas --no-first-run --no-zygote --disable-gpu',
				// Путь к файлу Firebase
				FIREBASE_SERVICE_ACCOUNT_PATH: '/var/www/etf_tracker_app/backend/etf-flow-firebase.json',
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3066,
				HOST: '0.0.0.0',
				// Настройки Puppeteer для production
				PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'false',
				PUPPETEER_EXECUTABLE_PATH: '/usr/bin/google-chrome-stable',
				PUPPETEER_ARGS: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-accelerated-2d-canvas --no-first-run --no-zygote --disable-gpu',
				// Путь к файлу Firebase
				FIREBASE_SERVICE_ACCOUNT_PATH: '/var/www/etf_tracker_app/backend/etf-flow-firebase.json',
			},
			error_file: './logs/err.log',
			out_file: './logs/out.log',
			log_file: './logs/combined.log',
			time: true,
			// Автоматический перезапуск при изменении файлов
			watch: ['dist'],
			ignore_watch: ['node_modules', 'logs'],
			// Перезапуск при сбоях
			max_restarts: 10,
			min_uptime: '10s',
			// Настройки для планировщика
			kill_timeout: 5000,
			wait_ready: true,
			listen_timeout: 10000,
		},
	],
};
