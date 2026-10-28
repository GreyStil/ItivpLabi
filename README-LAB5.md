# Лабораторная работа №5 — React + REST API

Клиент из ЛР №4 подключён к серверному API (Express + PostgreSQL + JWT) из лабораторных №1–№3.

## Что добавилось

| Файл / изменение | Назначение |
|------------------|------------|
| `client/src/api.js` | axios-клиент, JWT в заголовке, retry для GET |
| `client/src/components/CampaignList.jsx` | loading / error, оптимистичные CRUD |
| `client/.env` | `VITE_API_URL=http://localhost:3000` |
| `server.js` | CORS для запросов с Vite (`localhost:5173`) |
| зависимости | `axios` (client), `cors` (server) |

## Запуск

Два терминала.

**Сервер** (корень проекта):

```bash
npm install
npm run dev
```

Ожидается: `Database connection established` и `Server running on port 3000`.

**Клиент**:

```bash
cd client
npm install
npm run dev
```

Откройте URL Vite (обычно `http://localhost:5173`).

## Учётные данные для теста

```text
admin@lab.local / Admin12345   — роль admin (можно удалять)
```

Создать / обновить админа:

```bash
node scripts/create_admin.js admin@lab.local Admin12345 admin
```

## Соответствие методичке ЛР №5

### Часть 1. Подготовка

Убедитесь, что сервер (из лабораторных №1–№3) запущен и доступен, например по адресу `http://localhost:3000`.

В React-проекте из лабораторной №4 установлен axios:

```bash
cd client
npm install axios
```

Переменные окружения клиента (`client/.env`):

```env
VITE_API_URL=http://localhost:3000
```

В методичке указано `VITE_API_URL=http://localhost:3000/api`. У нашего API маршруты корневые (`/campaigns`, `/auth/login`), поэтому суффикс `/api` не используется.

### Часть 2. Создание сервиса API

Файл `client/src/api.js`:

- `axios.create({ baseURL: import.meta.env.VITE_API_URL })`
- request-interceptor добавляет JWT: `Authorization: Bearer <token>` из `localStorage`
- функции взаимодействия с API: `fetchCampaigns`, `addCampaign`, `updateCampaign`, `deleteCampaign`, `login`
- ошибки обрабатываются через `getErrorMessage`

Аналог примера из методички (`/items` → у нас `/campaigns`):

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchCampaigns = () => api.get('/campaigns');
export const addCampaign = (item) => api.post('/campaigns', item);
export const updateCampaign = (id, updated) => api.put(`/campaigns/${id}`, updated);
export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`);
```

### Часть 3. Компонент списка

В `client/src/components/CampaignList.jsx`:

- `useState` хранит массив данных (`items`), флаги `loading` и `error`
- в `useEffect` с пустым массивом зависимостей вызывается `loadCampaigns()` → `fetchCampaigns()`
- при загрузке показывается индикатор; при ошибке — сообщение и кнопка «Повторить»

### Часть 4. CRUD с оптимистичным обновлением

| Операция | Реализация |
|----------|------------|
| **Добавление** | сразу элемент с временным ID (`tmp-…`) в state → `POST` → при успехе замена на ответ сервера; при ошибке — удаление из state и уведомление |
| **Удаление** | оптимистично убрать из списка → `DELETE`; при ошибке — вернуть предыдущий массив |
| **Редактирование** | оптимистично обновить в списке → `PUT`; при ошибке — откатить изменение |

### Часть 5. Дополнительное улучшение

Выбрано: **повтор запроса при ошибке (retry)** — функция `withRetry` в `api.js` повторяет `GET /campaigns` до 3 раз с нарастающей задержкой.

## Как работает

1. При открытии страницы `GET /campaigns` (публичный).
2. Вход: `POST /auth/login` → JWT в `localStorage`.
3. Создание / изменение: `POST` / `PUT /campaigns` с `Authorization: Bearer …`.
4. Удаление: только роль `admin`.
5. При ошибке сети — сообщение и кнопка «Повторить»; GET повторяется до 3 раз (`withRetry`).
6. Добавление / удаление / правка — оптимистичное обновление списка с откатом при ошибке.

## Переменные окружения

**Сервер** (`.env.local`):

- `DATABASE_URL` — PostgreSQL (Neon)
- `JWT_SECRET` — секрет JWT

**Клиент** (`client/.env`):

- `VITE_API_URL=http://localhost:3000`

## Проверка

1. Список загружается без входа.
2. Без токена POST возвращает 401.
3. После входа можно добавить / изменить кампанию.
4. Admin может удалить; user получает 403.
5. При остановленном сервере видны ошибка и «Повторить».
