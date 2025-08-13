# Деплой на Render

## Настройка в Render Dashboard

### 1. Создать новый Web Service
- Connect your GitHub repository
- Выбрать репозиторий `meal-planner`

### 2. Настройки сервиса:
- **Name**: `meal-planner` (или любое другое)
- **Environment**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Plan**: Free (или платный)

### 3. Переменные окружения:
Добавить в Environment Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=production
```

### 4. База данных
- Создать PostgreSQL database в Render
- Или использовать внешнюю (Neon, Supabase)
- Скопировать DATABASE_URL в переменные окружения

### 5. Деплой
- Нажать "Create Web Service"
- Render автоматически запустит build и deploy

## Проверка деплоя

После успешного деплоя:
1. Открыть URL приложения
2. Проверить работу API: `https://your-app.onrender.com/api/dishes`
3. Проверить работу фронтенда

## Troubleshooting

### Если build падает:
- Проверить логи в Render Dashboard
- Убедиться, что все зависимости установлены

### Если приложение не запускается:
- Проверить переменные окружения
- Убедиться, что DATABASE_URL корректный
- Проверить логи сервера

### Если база данных недоступна:
- Проверить подключение к базе данных
- Убедиться, что IP адреса разрешены
- Проверить credentials 