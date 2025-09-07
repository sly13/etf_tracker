// Тестовый скрипт для проверки интеграции с backend
import applicationsService from './services/applicationsService';

async function testIntegration() {
  console.log('🧪 Тестирование интеграции с backend...\n');

  try {
    // 1. Тест получения списка приложений
    console.log('1️⃣ Тестирование получения списка приложений...');
    const applications = await applicationsService.getApplications();
    console.log('✅ Список приложений:', applications);

    // 2. Тест создания приложения
    console.log('\n2️⃣ Тестирование создания приложения...');
    const newApp = {
      name: 'test-app-' + Date.now(),
      displayName: 'Test Application',
      description: 'Тестовое приложение',
      isActive: true
    };
    
    const createdApp = await applicationsService.createApplication(newApp);
    console.log('✅ Приложение создано:', createdApp);

    // 3. Тест обновления приложения
    if (createdApp.success && createdApp.application) {
      console.log('\n3️⃣ Тестирование обновления приложения...');
      const updatedApp = await applicationsService.updateApplication(
        createdApp.application.id,
        { displayName: 'Updated Test Application', description: 'Обновленное описание' }
      );
      console.log('✅ Приложение обновлено:', updatedApp);

      // 4. Тест получения информации о приложении
      console.log('\n4️⃣ Тестирование получения информации о приложении...');
      const appInfo = await applicationsService.getApplication(createdApp.application.id);
      console.log('✅ Информация о приложении:', appInfo);

      // 5. Тест удаления приложения
      console.log('\n5️⃣ Тестирование удаления приложения...');
      const deletedApp = await applicationsService.deleteApplication(createdApp.application.id);
      console.log('✅ Приложение удалено:', deletedApp);
    }

    console.log('\n🎉 Все тесты прошли успешно!');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    console.log('\n💡 Возможные причины:');
    console.log('- Backend сервер не запущен (npm run start:dev)');
    console.log('- Неверный JWT токен в localStorage');
    console.log('- Проблемы с сетью или CORS');
  }
}

// Запуск тестов
testIntegration();
