# Qtunes-v2

## Tech Stack

- Frontend : Vue.js (Vite, TypeScript, Pinia)
- Backend : Deno (Hono)

## Setup

- You should put `.env` in `./server`.

```sh
TRAQ_CLIENT_ID=XXXX
TRAQ_REDIRECT_URL="http://localhost:8000/api/auth/callback"
TRAQ_CHANNEL_ID=XXXX
```

- commands : 

```sh
# server
Deno task dev:server

# client
Deno task def:client

```