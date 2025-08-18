# Настройка базы данных

## 1. Создание .env файла

Создайте файл `.env` в корне проекта:

```env
# Database configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session configuration  
SESSION_SECRET=your-super-secret-session-key

# Environment
NODE_ENV=development
```

## 2. Настройка PostgreSQL

### Вариант A: Neon (рекомендуется для разработки)
1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string в `DATABASE_URL`

### Вариант B: Supabase
1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. В настройках проекта найдите connection string

### Вариант C: Локальный PostgreSQL
1. Установите PostgreSQL
2. Создайте базу данных
3. Используйте connection string: `postgresql://username:password@localhost:5432/database_name`

## 3. Применение миграций

После настройки `DATABASE_URL`, выполните:

```bash
# Применить схему к базе данных
npm run db:push

# Или создать и применить миграции
npm run db:generate
npm run db:migrate
```

## 4. Проверка подключения

Запустите сервер:

```bash
npm run dev
```

В логах должно появиться:
- "Using PostgreSQL storage with DATABASE_URL" - если БД настроена
- "Using in-memory storage (no DATABASE_URL provided)" - если БД не настроена

## 5. Тестирование

1. Откройте приложение в браузере
2. Создайте несколько блюд
3. Перезапустите сервер
4. Данные должны сохраниться (если используется БД)

## Troubleshooting

### Ошибка подключения к БД
- Проверьте правильность `DATABASE_URL`
- Убедитесь, что база данных доступна
- Проверьте credentials

### Ошибка миграций
- Убедитесь, что у пользователя есть права на создание таблиц
- Проверьте, что база данных существует

### Данные не сохраняются
- Проверьте логи сервера на наличие ошибок
- Убедитесь, что используется `PgStorage` (не `MemStorage`)
