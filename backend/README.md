# Scape Backend (Render)

## Variables requeridas
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- FRONTEND_URL
- PORT (opcional, default 4000)

## Endpoints
- GET /health
- POST /rooms/create
- POST /rooms/join
- GET /rooms/:roomId/players
- GET /rooms/:roomId/status
- POST /rooms/:roomId/start
- POST /progress/save

## Socket events
- Cliente -> servidor: join_room, leave_room
- Servidor -> cliente: room_updated, player_joined, room_started, progress_updated

## Desarrollo local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```
