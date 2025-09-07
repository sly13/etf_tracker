import api from '../utils/api';

class ApplicationsService {
  // Получение списка всех приложений
  async getApplications() {
    try {
      const response = await api.get('/applications/admin/all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Получение информации о приложении по ID
  async getApplication(id) {
    try {
      const response = await api.get(`/applications/admin/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Создание нового приложения
  async createApplication(applicationData) {
    try {
      const response = await api.post('/applications/admin/create', applicationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Обновление приложения
  async updateApplication(id, applicationData) {
    try {
      const response = await api.put(`/applications/admin/${id}`, applicationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Удаление приложения
  async deleteApplication(id) {
    try {
      const response = await api.delete(`/applications/admin/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Обработка ошибок
  handleError(error) {
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.message || 'Неверные данные запроса');
        case 401:
          return new Error('Необходима авторизация');
        case 403:
          return new Error('Доступ запрещен');
        case 404:
          return new Error('Приложение не найдено');
        case 409:
          return new Error(data.message || 'Конфликт данных');
        case 500:
          return new Error('Внутренняя ошибка сервера');
        default:
          return new Error(data.message || 'Произошла ошибка');
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен
      return new Error('Сервер недоступен. Проверьте подключение к интернету.');
    } else {
      // Что-то пошло не так при настройке запроса
      return new Error('Ошибка настройки запроса');
    }
  }
}

const applicationsService = new ApplicationsService();
export default applicationsService;
