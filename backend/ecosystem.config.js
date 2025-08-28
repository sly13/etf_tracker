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
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3066,
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
