const os = require('os');

async function getHealthStatus() {
	const memoryUsage = process.memoryUsage();

	return {
		status: 'ok',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		memory: {
			used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
			total: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
		},
		system: {
			platform: os.platform(),
			arch: os.arch(),
			nodeVersion: process.version
		}
	};
}

module.exports = {
	getHealthStatus
};
