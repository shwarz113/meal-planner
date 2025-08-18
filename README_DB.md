# Настройка базы данных для Meal Planner

## Быстрая настройка

1. **Создайте файл `.env`** в корне проекта:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

2. **Настройте PostgreSQL** (один из вариантов):
   - **Neon** (бесплатно): https://neon.tech
   - **Supabase** (бесплатно): https://supabase.com
   - **Локальный PostgreSQL**

3. **Примените схему к БД**:
```bash
npm run db:push
```

4. **Запустите сервер**:
```bash
npm run dev
```

## Проверка работы

В логах сервера должно появиться:
- `"Using PostgreSQL storage with DATABASE_URL"` - если БД настроена
- `"Using in-memory storage (no DATABASE_URL provided)"` - если БД не настроена

## Что изменилось

✅ **Добавлено**:
- `PgStorage` класс для работы с PostgreSQL
- Автоматический выбор хранилища по `DATABASE_URL`
- Поддержка Drizzle ORM с Neon
- Загрузка переменных окружения
- Исправлены типы для работы с БД

✅ **Сохранено**:
- `MemStorage` для разработки без БД
- Все существующие API endpoints
- Типизация и валидация

## Файлы для настройки

- `.env` - переменные окружения (создайте сами)
- `.env.example` - пример файла
- `DATABASE_SETUP.md` - подробная инструкция
- `server/storage.ts` - логика выбора хранилища
