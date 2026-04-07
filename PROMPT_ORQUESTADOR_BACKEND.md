# Prompt Orquestador: Backend de Escape Room Multiplayer
**Fecha:** 2026-04-07  
**Estado:** Crítico - Bloqueante  
**Objetivo:** Implementar sincronización en tiempo real y persistencia robusta para salas de juego  

---

## 🎯 PROBLEMA IDENTIFICADO

### Síntoma Principal
- Usuario intenta crear sala → página se queda bloqueada o sin respuesta
- Fallback a modo LOCAL inadecuado para funcionalidad multiplayer
- Falta de señalización entre jugadores en tiempo real

### Causa Raíz
1. **Persistencia Local Insuficiente**: LocalStorage no puede sincronizar estado entre pestañas/dispositivos
2. **Supabase No Operativo**: Variables de entorno no llegan a Vercel o políticas RLS rechaza operaciones
3. **Sin WebSockets**: No hay canal de comunicación servidor → cliente para notificar cambios
4. **Sin Validación Servidor**: El cliente crea salas válidas localmente pero no las persiste globalmente

---

## 📋 REQUERIMIENTOS DEL BACKEND

### Funcionalidades Críticas

#### 1. **Gestión de Salas (Rooms)**
```
POST   /api/rooms/create        → { roomCode, roomId, status }
GET    /api/rooms/:roomId       → { room, players, status }
PATCH  /api/rooms/:roomId       → update status (waiting → in_progress → finished)
POST   /api/rooms/:roomId/start → iniciar partida
```

#### 2. **Gestión de Jugadores (Players)**
```
POST   /api/rooms/:roomId/players     → { playerId, playerName, isHost }
GET    /api/rooms/:roomId/players     → [ players ]
PATCH  /api/players/:playerId         → update level, score, last_active
GET    /api/players/:playerId/progress → { currentLevel, score, fragments }
```

#### 3. **Sincronización en Tiempo Real (Critical)**
```
WebSocket realtime/rooms/:roomId
  Events:
  - player_joined
  - player_left
  - room_status_changed (waiting → in_progress)
  - progress_synced (para leaderboard/sincronización)
  - room_finished

Reconnection Logic:
  - Timeout: 30s sin activity → pong/ping check
  - Fallback: REST polling cada 3s si WebSocket falla
```

#### 4. **Persistencia de Progreso**
```
POST   /api/progress         → { playerId, roomId, level, score, fragments, time }
GET    /api/progress/:roomId → [ { player, progress } ]  (para resultados finales)
```

#### 5. **Validaciones en Servidor**
```
- Código de sala: 6 caracteres, único, generado server-side
- Jugador duplicado: no permitir mismo nombre en sala
- Estado de sala: transiciones válidas (waiting → in_progress → finished)
- RLS/Auth: Solo host puede iniciar partida; solo jugadores en sala pueden enviar progreso
```

---

## 🏗️ ARQUITECTURA RECOMENDADA

### Opción A: Supabase + Realtime (PREFERIDA - Menor Costo)
```
┌─────────────────────────────────────────────────────┐
│ Vercel (Frontend React + Vite)                      │
│  └─ src/lib/supabase.ts (cliente)                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│ Supabase (PostgreSQL + Realtime)                    │
│  ├─ tables: rooms, players, player_progress        │
│  ├─ realtime subscriptions: rooms.*                 │
│  └─ RLS policies: row-level security                │
└─────────────────────────────────────────────────────┘
```

**Ventajas:**
- Ya existe schema SQL en `supabase/schema.sql`
- Realtime gratuito hasta X conexiones
- No requiere servidor backend Node/Python separado
- Escala automáticamente

**Trabajo Necesario:**
1. Validar & fijar RLS policies (actualmente abiertas/rechazadoras)
2. Triggers para generar room_code único server-side
3. Verificar CORS y headers en Supabase
4. Realtime subscriptions en cliente (`src/lib/supabase.ts`)

---

### Opción B: Node.js/Express Backend + Socket.io (ROBUSTA - Mayor Control)
```
┌──────────────────────────────────┐
│ Vercel (Frontend)                │
└──────────────┬───────────────────┘
               │ HTTP + WebSocket
               ▼
┌──────────────────────────────────┐
│ Railway/Render/Heroku            │
│ Node.js Express + Socket.io      │
└──────────────┬───────────────────┘
               │ SQL/NoSQL
               ▼
┌──────────────────────────────────┐
│ PostgreSQL / MongoDB             │
└──────────────────────────────────┘
```

**Ventajas:**
- Control total sobre lógica de negocio
- Mejor para debugging
- Escalabilidad explícita

**Desventaja:**
- Requiere hosting adicional (~$5-10/mes)
- Más código que mantener

---

## 🔧 PLAN DE IMPLEMENTACIÓN

### Fase 1: Diagnosticar Supabase (1-2 horas)
**Skills Recomendadas:** Explora contenersDB, SQL validation

```bash
1. Conectar a Supabase dashboard
2. Verificar schema está creado correctamente
3. Revisar RLS policies en tablas (rooms, players, player_progress)
4. Probar INSERT/SELECT directamente desde editor SQL
5. Verificar CORS en Supabase settings
6. Testear WebSocket realtime con test client
```

**Deliverable:** Documento de estado de Supabase + checklist de fixes

---

### Fase 2: Fijar RLS & Triggers (2-4 horas)
**Skills Recomendadas:** SQL expertise, Supabase docs

```sql
-- RLS: Permitir crear sala sin auth (anonyme)
CREATE POLICY "allow_create_room_anonymous" ON rooms
  FOR INSERT WITH CHECK (true);

-- RLS: Permitir listar salas públicamente
CREATE POLICY "allow_read_rooms" ON rooms
  FOR SELECT USING (true);

-- RLS: Solo host puede actualizar estado
CREATE POLICY "host_can_update_room" ON rooms
  FOR UPDATE USING (host_id = auth.uid());

-- Trigger: Generar room_code unique antes de INSERT
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TRIGGER AS $$
BEGIN
  LOOP
    NEW.room_code := TO_CHAR(RANDOM() * 1000000, '999999');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE room_code = NEW.room_code);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER room_code_trigger
BEFORE INSERT ON rooms
FOR EACH ROW
EXECUTE FUNCTION generate_room_code();
```

**Deliverable:** Script SQL con RLS + triggers aplicados

---

### Fase 3: Actualizar Cliente (React) (2-3 horas)
**Skills Recomendadas:** React hooks, Supabase realtime

```typescript
// src/lib/supabase.ts
import { RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToRoomChanges(roomId: string, callback: (update: any) => void) {
  const channel: RealtimeChannel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'rooms', filter: `room_id=eq.${roomId}` },
      (payload) => callback(payload)
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
      (payload) => callback(payload)
    )
    .subscribe();

  return () => channel.unsubscribe();
}
```

**Deliverable:** Cliente React con Realtime subscriptions funcionales

---

### Fase 4: Testing E2E (1-2 horas)
**Skills Recomendadas:** Jest/Vitest, Puppeteer

```bash
1. Test crear sala → debe generar código único  
2. Test unirse a sala → debe sincronizar lista de jugadores en tiempo real
3. Test iniciar partida → anfitrión dispara transición, otros jugadores lo ven
4. Test progreso → cambios sincronizan a <500ms
5. Test desconexión → fallback a polling, reconexión automática
```

---

## ⚙️ PASOS INMEDIATOS (Próximos 15 min)

### Para Resolver YA:

1. **Verifica Supabase está realmente conectada:**
   ```bash
   npm run build
   # Abre app en navegador, abre DevTools → Console
   # Intenta crear sala y revisa si hay error de tipo "Supabase not initialized"
   ```

2. **Revisa si el problema es RLS:**
   - Entra a Supabase dashboard > Rooms table > Row Level Security tab
   - Si dice "RLS is OFF" → Enciéndelo (protege tabla)
   - Si está ON revisa políticas específicas

3. **Fallback Inmediato:**
   - Si Supabase sigue sin funcionar, cambia a modo local puro (sin intentos de Supabase)
   - Permite jugar localmente en una sola máquina
   - Luego arreglas Supabase en paralelo

---

## 📞 CHECK-IN PUNTOS

Después de cada fase:
- ¿La app permite crear sala SIN se bloquee?
- ¿Múltiples navegadores/dispositivos ven la misma sala?
- ¿El host puede iniciar sin errores?
- ¿Realtime sincronización <1s?

---

## 🎓 SKILLS & HERRAMIENTAS RECOMENDADAS

| Tarea | Skill/Tool |
|-------|-----------|
| Diagnosticar DB | Supabase CLI + psql (PostgreSQL client) |
| Escribir RLS/Triggers | SQL + Supabase Dashboard |
| Actualizar cliente | React Hooks + @supabase/supabase-js realtime |
| Testing | Jest + Supabase local mode |
| Monitoring | Error tracking (Sentry) + logs |

---

## 🚀 SUCCESS CRITERIA

✅ Crear sala → Redirecciona a Lobby en <3s  
✅ Múltiples jugadores ven la misma sala (realtime)  
✅ Host inicia → Todos ven transición a Story  
✅ Desconexión → Fallback sin crash  
✅ Progreso sincroniza → Resultados finales compartidos  

---

**Próximo Paso:** ¿Quieres que empecemos por diagnosticar Supabase o prefieres ir directo a fijar RLS?
