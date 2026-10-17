# GREEN-API Chat

Текстовый чат на React + GREEN-API. Базовая поддержка WhatsApp, переключатель мессенджеров: WhatsApp / MAX / Telegram.

## Возможности

- Вход по `idInstance` + `apiTokenInstance` с выбором мессенджера.
- Один сайдбар с вкладками «Чаты» и «Контакты», поиск и ленивая подгрузка списков.
- Создание чата по номеру телефона и запуск переписки прямо из контакта.
- Обмен текстовыми сообщениями, приём входящих через long polling.
- Статусы исходящих сообщений: Отправлено / Доставлено / Прочитано.
- Удалённое сообщение остаётся в переписке как «Сообщение удалено» с временем оригинала.
- Ответы на сообщения, эмодзи, копирование, скелетоны вместо спиннеров.
- Номера телефонов не показываются в списках чатов и контактов (только имя, последнее сообщение и дата); номер виден в шапке открытого чата.
- Светлая и тёмная темы.

## Стек

- React 19 + TypeScript, Vite
- Zustand (состояние, persist в `localStorage`)
- TanStack Query (запросы и кэш)
- React Router, React Hook Form, Zod
- Tailwind CSS
- Структура по FSD (`app` / `pages` / `widgets` / `features` / `entities` / `shared`)

## Локальный запуск

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Откройте `http://localhost:5173`.

Если используется `npm`:

```bash
npm install
npm run dev
```

## Переменные окружения

| Переменная | Описание |
| --- | --- |
| `VITE_GREEN_API_BASE_URL` | Необязательный переопределяющий URL GREEN-API. Если не задан, хост определяется автоматически по `idInstance` (например, `710722770785` → `https://7107.api.greenapi.com`) |
| `VITE_DEFAULT_MESSENGER` | Мессенджер по умолчанию: `whatsapp`, `max` или `telegram` |
| `VITE_POLL_RECEIVE_TIMEOUT_SEC` | Таймаут long polling для `receiveNotification` |
| `VITE_POLL_IDLE_DELAY_MS` | Пауза между итерациями polling, когда уведомлений нет |
| `VITE_POLL_BACKOFF_BASE_MS` | Базовая задержка экспоненциального backoff при ошибках polling |
| `VITE_POLL_BACKOFF_MAX_MS` | Максимальная задержка backoff |
| `VITE_HISTORY_PAGE_SIZE` | Количество сообщений, запрашиваемых при загрузке истории чата |

## Настройка инстанса GREEN-API

Приложение работает в режиме HTTP API: запросы идут напрямую из браузера, поэтому внешний webhook не нужен.

1. Создайте инстанс в личном кабинете GREEN-API.
2. Авторизуйте номер (для WhatsApp — сканирование QR).
3. Очистите `webhookUrl`.
4. Включите `incomingWebhook`, `outgoingWebhook`, `stateWebhook` и `deletedMessageWebhook`.
5. Введите `idInstance` и `apiTokenInstance` на странице входа.

Настройки вебхуков применяются автоматически при входе (метод `setSettings`), но при проблемах с доставкой уведомлений проверьте их в личном кабинете вручную.

Входящие сообщения забираются двумя способами: long polling (`receiveNotification` / `deleteNotification`) и подписка на вебхуки. Для WhatsApp статусы сообщений и удаление обрабатываются через `outgoingMessageStatus` и `deletedMessage`, для MAX/Telegram доступные методы определяются по профилю мессенджера.

## Скрипты

| Команда | Назначение |
| --- | --- |
| `pnpm dev` | Локальный dev-сервер Vite |
| `pnpm build` | Типизация (`tsc -b`) и production-сборка |
| `pnpm preview` | Предпросмотр production-сборки |
| `pnpm typecheck` | Проверка типов без сборки |
| `pnpm test` | Юнит-тесты (Vitest, однократный запуск) |
| `pnpm test:watch` | Юнит-тесты в watch-режиме |

Перед коммитом рекомендуется выполнить:

```bash
pnpm typecheck && pnpm test && pnpm build
```

## Структура

```
src/
  app/          роутинг и провайдеры
  pages/        страницы (login, chats)
  widgets/      крупные блоки UI (sidebar, chat-window, chat-list, contact-item)
  features/     сценарии (receive-messages, auth)
  entities/     доменные модели и API-хуки (chat, message, contact, credentials)
  shared/       UI-кит, api-клиент, утилиты, конфиг
```

## Деплой

Проект можно развернуть на Vercel. Импортируйте репозиторий, добавьте переменные окружения и используйте стандартную команду сборки `pnpm build`.
