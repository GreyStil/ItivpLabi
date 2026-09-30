# Лабораторная работа №3 — JWT-аутентификация

Документ описывает **только код, добавленный в третьей лабораторной**: регистрация, вход, JWT, middleware и ролевая модель (RBAC).  
Лабораторные №1 (Express CRUD) и №2 (PostgreSQL + Sequelize) остаются основой проекта.

---

## Что появилось в проекте

| Компонент | Назначение |
|-----------|------------|
| `models/user.js` | Модель пользователя в PostgreSQL |
| `migrations/20260930133644-create-user.js` | Таблица `Users` |
| `controllers/authController.js` | Регистрация и вход |
| `controllers/profileController.js` | Профиль текущего пользователя |
| `routes/auth.js` | `POST /auth/register`, `POST /auth/login` |
| `routes/profile.js` | `GET /profile` |
| `middleware/auth.js` | Проверка JWT |
| `middleware/isAdmin.js` | Проверка роли `admin` (RBAC) |
| `scripts/create_admin.js` | Создание тестового user/admin |
| изменения в `server.js`, `routes/campaignRoutes.js` | Подключение auth и защита маршрутов |

Зависимости: `jsonwebtoken`, `bcrypt`.

---

## Переменные окружения

В `.env.local` (или `.env`) должны быть:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=длинная_случайная_строка
PORT=3000
```

- **`JWT_SECRET`** — секрет для подписи и проверки токенов. Без него сервер не запустится.
- Пароли пользователей в БД **не хранятся** в открытом виде, только хеш.

---

## Модель `User`

Файл: `models/user.js`

Поля:

- `id` — первичный ключ;
- `email` — уникальный, обязательный, с проверкой формата email;
- `passwordHash` — хеш пароля (bcrypt), обязательный;
- `role` — `user` или `admin` (по умолчанию `user`).

**Важно:** в обычных запросах Sequelize **не отдаёт** `passwordHash` (`defaultScope` исключает поле).  
Для входа используется scope `withPassword`, чтобы прочитать хеш и сравнить пароль.

Миграция:

```bash
npm run db:migrate
```

---

## Регистрация — `POST /auth/register`

Файл: `controllers/authController.js` → `register`.

**Тело запроса (JSON):**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Логика:**

1. Проверка, что `email` и `password` переданы; пароль не короче 6 символов.
2. Поиск пользователя с таким email — если есть, ответ **409**.
3. `bcrypt.hash(password, 10)` → сохранение в `passwordHash`.
4. Создание записи с `role: 'user'`.
5. Ответ **201** без пароля: `{ id, email, role }`.

Пароль в ответе и в БД в чистом виде **никогда** не возвращается.

---

## Вход — `POST /auth/login`

Файл: `controllers/authController.js` → `login`.

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Логика:**

1. Пользователь ищется по email (с scope `withPassword`).
2. `bcrypt.compare(password, passwordHash)` — если не совпало, **401** (общая формулировка ошибки).
3. Генерация JWT:

```javascript
jwt.sign(
  { id, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

4. Ответ **200**:

```json
{
  "token": "eyJhbG...",
  "user": { "id": 1, "email": "...", "role": "user" }
}
```

В payload токена попадают `id`, `email` и `role` — они же потом доступны в `req.user` после middleware.

---

## Middleware `authenticate`

Файл: `middleware/auth.js`.

1. Читает заголовок `Authorization`.
2. Ожидает формат: `Bearer <token>`.
3. `jwt.verify(token, JWT_SECRET)` — при успехе кладёт decoded payload в **`req.user`** и вызывает `next()`.
4. При отсутствии или неверном токене — **401**.

Использование в маршрутах:

```javascript
router.get('/', authenticate, controller.getProfile);
```

---

## Профиль — `GET /profile`

Файлы: `routes/profile.js`, `controllers/profileController.js`.

- Только для авторизованных (`authenticate`).
- По `req.user.id` загружает пользователя из БД.
- Возвращает: `id`, `email`, `role`, `createdAt` (без пароля).

---

## RBAC — дополнительный механизм безопасности

Файл: `middleware/isAdmin.js`.

- Проверяет `req.user.role === 'admin'`.
- Иначе **403** `Admin access required`.

Подходит для курсового проекта аналитики: обычный пользователь управляет своими данными, администратор — критичными операциями (например, удаление кампаний).

---

## Защита маршрутов кампаний

Файл: `routes/campaignRoutes.js` (изменён в ЛР №3).

| Маршрут | Доступ |
|---------|--------|
| `GET /campaigns` | публичный |
| `GET /campaigns/:id` | публичный |
| `POST /campaigns` | JWT (`authenticate`) |
| `PUT /campaigns/:id` | JWT |
| `DELETE /campaigns/:id` | JWT + **`isAdmin`** |

Цепочка middleware для DELETE:

```javascript
router.delete('/:id', authenticate, isAdmin, controller.remove);
```

Сначала проверяется токен, затем роль admin.

---

## Подключение в `server.js`

```javascript
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/campaigns', campaignRoutes);
```

При старте проверяются `DATABASE_URL` и **`JWT_SECRET`**.

---

## Проверка в Postman

### 1. Регистрация

- **POST** `http://localhost:3000/auth/register`
- Body → raw → JSON:

```json
{ "email": "new@lab.local", "password": "Pass1234" }
```

### 2. Вход

- **POST** `http://localhost:3000/auth/login`
- Скопировать `token` из ответа.

### 3. Заголовок для защищённых запросов

Вкладка **Authorization** → Type: **Bearer Token** → вставить token.

Или вручную:

```
Authorization: Bearer eyJhbG...
```

### 4. Профиль

- **GET** `http://localhost:3000/profile` (с Bearer token)

### 5. Создание кампании

- **POST** `http://localhost:3000/campaigns` + JSON-тело (как в ЛР №1) + Bearer token.

### 6. Удаление кампании

- С токеном **user** → ожидается **403**.
- С токеном **admin** → **204**.

---

## Тестовые пользователи (скрипт)

```bash
node scripts/create_admin.js admin@lab.local Admin12345 admin
node scripts/create_admin.js user@lab.local User12345 user
```

Скрипт создаёт или обновляет пользователя с заданной ролью.

---

## Схема потока запроса (защищённый маршрут)

```
Клиент
  → Authorization: Bearer <JWT>
  → middleware/auth.js (verify, req.user)
  → [optional] middleware/isAdmin.js
  → controller
  → ответ JSON
```

---

## Частые ошибки

| Ответ | Причина |
|-------|---------|
| `Authorization token required` | Нет заголовка Bearer |
| `Invalid or expired token` | Токен просрочен (>1 ч) или неверный JWT_SECRET |
| `Admin access required` | DELETE без роли admin |
| `Email already registered` | Повторная регистрация |
| Сервер не стартует | Нет `JWT_SECRET` в `.env.local` |

---

## Запуск

```bash
npm install
npm run db:migrate
npm run dev
```

Проект: REST API анализа рекламных кампаний (`/campaigns`) + аутентификация (`/auth`, `/profile`).
