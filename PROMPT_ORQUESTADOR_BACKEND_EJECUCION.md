# Prompt Orquestador Ejecutable - Backend Escape Room (Supabase + Opcion Render)

## Rol
Actua como arquitecto backend senior y ejecutor tecnico. Tu mision es dejar operativo el backend multiplayer del Escape Room en este repositorio, sin romper la UI existente.

## Contexto del proyecto
- Frontend: React + Vite
- Persistencia actual: Supabase (tablas `rooms`, `players`, `player_progress`, `attempts`)
- Sintoma reportado: anfitrion crea sala pero otros usuarios no la encuentran o no sincroniza lobby
- Objetivo: que toda sala multiplayer exista en backend compartido (Supabase o API en Render), con sincronizacion en tiempo real y comportamiento consistente en produccion

## Estrategia de arquitectura (decision obligatoria)
Antes de implementar, decide una de estas 2 rutas:

### Ruta A - Supabase Full (preferida para menor complejidad)
- DB + Realtime en Supabase
- Frontend en Vercel
- Sin servidor propio adicional

### Ruta B - Backend en Render (cuando se necesita mas control)
- API Node.js + Socket.io desplegada en Render
- DB en Supabase Postgres
- Frontend en Vercel consume API de Render

### Criterio de decision
1. Si el proyecto necesita salir rapido y simple -> Ruta A.
2. Si requiere reglas de juego complejas, validacion anti-trampa, o control fino de sockets -> Ruta B.
3. Si hay bloqueos recurrentes con RLS/realtime de Supabase -> Ruta B recomendada.

## Restricciones tecnicas
1. No usar fallback local para crear/unirse sala cuando Supabase esta configurado.
2. Mantener fallback local solo para guardado no critico si Supabase cae (opcional), pero nunca para descubrimiento de salas multiplayer.
3. Todas las modificaciones deben compilar con `npm run build`.
4. Politicas SQL idempotentes (`DROP POLICY IF EXISTS ...` antes de `CREATE POLICY`).
5. Si se elige Render, implementar API real y no dejar endpoints simulados.

## Resultado esperado (Definition of Done)
1. Host crea sala -> redirige a lobby con codigo valido en Supabase.
2. Jugador invitado en otro dispositivo puede unirse por codigo.
3. Lista de jugadores se sincroniza en tiempo real sin refrescar.
4. Host inicia partida y los invitados cambian de estado automaticamente.
5. En error de Supabase, se muestra mensaje claro en UI (sin sala fantasma local).
6. Si se usa Render, endpoints de salud y juego operativos en produccion.

## Plan obligatorio de ejecucion

### Fase 1 - Auditoria del flujo critico
1. Revisar funciones de `createRoomWithHost`, `joinRoomByCode`, `listPlayers`, `getRoomStatus`, `startRoom`.
2. Verificar que no exista fallback local silencioso en crear/unirse.
3. Verificar mensajes de error claros para usuario final.

### Fase 1.5 - Decision de ruta (A/B)
1. Evaluar estado de Supabase en produccion.
2. Si falla por configuracion solucionable, continuar con Ruta A.
3. Si persiste inestabilidad o se necesita control de negocio, activar Ruta B.

### Fase 2A - Backend SQL (Supabase)
1. Aplicar/actualizar script SQL con:
- RLS habilitado en tablas
- Grants a roles `anon` y `authenticated`
- Policies de `SELECT/INSERT/UPDATE/DELETE` requeridas
- Trigger de `room_code` unico (si `room_code` viene nulo o vacio)
- Indices para `room_code`, `room_id`, `player_id`
2. Validar que script sea re-ejecutable sin fallar.

### Fase 2B - Backend Render (si se elige Ruta B)
1. Crear carpeta `backend/` con Node.js + Express + Socket.io.
2. Endpoints minimos:
- `GET /health`
- `POST /rooms/create`
- `POST /rooms/join`
- `POST /rooms/:roomId/start`
- `GET /rooms/:roomId/players`
3. Integrar DB Supabase (service role solo en servidor).
4. Configurar CORS para dominio Vercel.
5. Configurar variables en Render:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`
6. Desplegar en Render y publicar URL base.

### Fase 3 - Realtime
1. Implementar/validar suscripciones realtime para:
- cambios en `rooms` por `room_id`
- cambios en `players` por `room_id`
2. Conservar polling cada 3s solo como respaldo si realtime falla.
3. Limpiar suscripciones al salir de lobby o desmontar componente.
4. Si Ruta B: usar Socket.io rooms por `roomId` y eventos `player_joined`, `room_started`, `progress_updated`.

### Fase 4 - Observabilidad minima
1. Estandarizar errores en cliente con mensaje accionable:
- problema de variables VITE
- problema de RLS/permisos
- timeout de red
2. Evitar `catch` vacios en rutas criticas.

### Fase 5 - Verificacion tecnica
1. Ejecutar `npm run build` y corregir errores.
2. Probar flujo E2E manual:
- navegador A crea sala
- navegador B se une por codigo
- A inicia partida y B cambia de pantalla
3. Confirmar que no aparece mensaje "sala no existe" cuando el host acaba de crear una sala valida en Supabase.
4. Si Ruta B: validar `GET /health` y conexion socket desde frontend desplegado.

## Entregables obligatorios
1. Lista de archivos modificados.
2. SQL final aplicado (o archivo SQL listo para ejecutar) y/o endpoints Render implementados.
3. Resumen de pruebas ejecutadas y resultado.
4. Riesgos restantes y siguientes pasos concretos.
5. Decision documentada de ruta elegida (A o B) con justificacion breve.

## Checklist final
- [ ] Crear sala en Supabase funcionando
- [ ] Unirse por codigo desde otro dispositivo funcionando
- [ ] Realtime de lobby funcionando
- [ ] Inicio de partida sincronizado
- [ ] Build OK
- [ ] Deploy listo en Vercel
- [ ] Si Ruta B: backend Render estable y endpoint /health en OK

## Comandos utiles
```bash
npm run build
git add .
git commit -m "fix: backend multiplayer supabase realtime estable"
git push
```

## Comandos utiles (Ruta B Render)
```bash
# En backend/
npm install
npm run build

# Deploy en Render desde GitHub
# Start command sugerido: node dist/index.js
```

## Instruccion final
Ejecuta todo de forma autonoma, aplicando cambios concretos en el repositorio. No detenerte en diagnostico: deja el sistema funcional de extremo a extremo.
Si eliges Ruta B (Render), entrega tambien la URL base del backend y los contratos de endpoints consumidos por frontend.
