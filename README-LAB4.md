# Лабораторная работа №4 — React (useState, useEffect, localStorage)

Клиентская часть курсового проекта «Анализ рекламных кампаний».

## Запуск

```bash
cd client
npm install
npm run dev
```

Откройте URL из консоли (обычно `http://localhost:5173`).

## Что реализовано

- Vite + React (`client/`)
- Компонент `CampaignList.jsx` — список кампаний
- `useState`: массив кампаний, форма, фильтр, сортировка
- `useLocalStorage` — загрузка при монтировании и сохранение при изменениях
- `useEffect`:
  - изменение `document.title` от количества кампаний
  - debounce-автосохранение (500 мс)
  - имитация загрузки (1 с)
- CRUD: добавление, редактирование, удаление
- Фильтр по статусу и сортировка (название / бюджет)
- Статистика: всего, active, сумма бюджета

## Ключ localStorage

`ad-campaigns-v1`

## Проверка

1. Добавьте кампанию → обновите страницу → данные остались.
2. DevTools → Application → Local Storage → ключ `ad-campaigns-v1`.
3. Проверьте фильтр/сортировку и редактирование.

## Связь с backend

В ЛР №5 `useLocalStorage` можно заменить на запросы к REST API (`/campaigns`) с JWT.
