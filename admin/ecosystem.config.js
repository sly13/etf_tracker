module.exports = {
	apps: [
		{
			name: "my-react-app",
			script: "react-scripts",
			args: "start",
			env: {
				PORT: 3065,
				NODE_ENV: "development"
			}
		}
	]
};