# Исправление проблемы с localhost в production

## Проблема
В production версии админ-панели используется `http://localhost:3066/api` вместо `https://api-etf.vadimsemenko.ru/api`.

## Причина
Переменные окружения React (`REACT_APP_*`) встраиваются в код **во время сборки**, а не во время выполнения. Если образ был собран без правильной переменной окружения, используется fallback значение из кода.

## Решение

### 1. Пересоберите образ без кэша

```bash
# Удалите старый образ и пересоберите
docker-compose -f docker-compose.prod.yml build --no-cache admin

# Или пересоберите все сервисы
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 2. Проверьте, что переменная передается

Во время сборки вы должны увидеть в логах:
```
Building with REACT_APP_API_URL=https://api-etf.vadimsemenko.ru/api
```

### 3. Проверьте встроенную переменную в собранном приложении

После сборки проверьте файл `admin/build/static/js/main.*.js` - там должна быть ваша переменная, а не localhost.

### 4. Альтернативное решение (runtime конфигурация)

Если нужно менять API URL без пересборки, можно использовать runtime конфигурацию через `window` объект:

1. Создайте файл `admin/public/config.js`:
```javascript
window.REACT_APP_API_URL = 'https://api-etf.vadimsemenko.ru/api';
```

2. Подключите его в `admin/public/index.html`:
```html
<script src="%PUBLIC_URL%/config.js"></script>
```

3. Обновите `admin/src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: window.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3066/api',
  timeout: 10000,
});
```

Но для production лучше использовать build-time переменные, так как это более безопасно и правильно.

## Проверка

После пересборки проверьте:
1. Откройте браузерную консоль
2. Проверьте Network tab - запросы должны идти на `https://api-etf.vadimsemenko.ru/api`
3. Если все еще localhost - очистите кэш браузера или используйте инкогнито режим

