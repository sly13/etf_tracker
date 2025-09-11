module.exports = {
	apps: [
		{
			name: "etf-admin-panel",
			script: "npm",
			args: "start",
			cwd: "/var/www/etf_tracker_app/admin",
			env: {
				PORT: 3065,
				NODE_ENV: "development",
				REACT_APP_API_URL: "http://localhost:3066/api"
			}
		},
		{
			name: "etf-admin-panel-serve",
			script: "npx",
			args: "serve -s build -l 3065",
			cwd: "/var/www/etf_tracker_app/admin",
			env_production: {
				PORT: 3065,
				NODE_ENV: "production"
			}
		}
	]
};