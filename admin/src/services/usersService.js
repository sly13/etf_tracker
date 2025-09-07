import api from '../utils/api';

const usersService = {
	getUsers: async (page = 1, limit = 50, search = '') => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (search) {
				params.append('search', search);
			}

			const response = await api.get(`/users/admin/all?${params.toString()}`);
			return response.data;
		} catch (error) {
			console.error('Error fetching users:', error);
			throw error;
		}
	},

	getUser: async (id) => {
		try {
			const response = await api.get(`/users/admin/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error fetching user:', error);
			throw error;
		}
	},

	updateUserStatus: async (id, isActive) => {
		try {
			const response = await api.put(`/users/admin/${id}/status?isActive=${isActive}`);
			return response.data;
		} catch (error) {
			console.error('Error updating user status:', error);
			throw error;
		}
	},

	deleteUser: async (id) => {
		try {
			const response = await api.delete(`/users/admin/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error deleting user:', error);
			throw error;
		}
	},
};

export default usersService;
