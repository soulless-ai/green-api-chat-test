# GREEN-API Chat

Текстовый чат на React + GREEN-API. Базовая поддержка WhatsApp, переключатель мессенджеров: WhatsApp / MAX / Telegram.

## Локальный запуск

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Откройте `http://localhost:5173`.

## Переменные окружения

| Переменная | Описание |
| --- | --- |
| `VITE_GREEN_API_BASE_URL` | Базовый URL GREEN-API (по умолчанию `https://api.green-api.com`) |
| `VITE_DEFAULT_MESSENGER` | Мессенджер по умолчанию |
| `VITE_POLL_RECEIVE_TIMEOUT_SEC` | Таймаут long polling |
| `VITE_HISTORY_PAGE_SIZE` | Размер истории чата |

## Настройка инстанса GREEN-API

1. Создайте инстанс в личном кабинете GREEN-API.
2. Авторизуйте номер.
3. Очистите `webhookUrl` (для HTTP API mode).
4. Включите `incomingWebhook`, `outgoingWebhook`, `stateWebhook`.
5. Введите `idInstance` и `apiTokenInstance` на странице входа.

## Сборка

```bash
pnpm build
pnpm preview
```

## Деплой

Проект можно развернуть на Vercel. Импортируйте репозиторий, добавьте переменные окружения и используйте стандартную команду сборки `pnpm build`.
