module.exports = {
	apps: [
		{
			name: "etf-admin-panel",
			script: "node_modules/.bin/react-scripts",
			args: "start",
			cwd: "/var/www/etf_tracker_app/admin",
			env: {
				PORT: 3065,
				NODE_ENV: "development"
			}
		}
	]
};