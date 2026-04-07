# IMPLEMENTACIÓN PASO A PASO: Backend Escape Room

**Estado**: Fase 4 - Implementación en Producción  
**Tiempo Estimado**: 10-15 min  

---

## 1️⃣ HABILITAR RLS Y TRIGGERS EN SUPABASE (5 min)

### Paso 1: Acceder a SQL Editor
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Click en **SQL Editor** (lado izquierdo)
3. Click en **New Query**

### Paso 2: Copiar & Ejecutar Script
1. Abre el archivo `supabase/rls_and_triggers.sql` (está en tu repo)
2. **Selecciona TODO el contenido** (Ctrl+A)
3. **Copia** (Ctrl+C)
4. **Pega en Supabase SQL Editor** (Ctrl+V)
5. Click en **RUN** (botón verde arriba)

✅ Deberías ver: "Consultas ejecutadas exitosamente"

### Paso 3: Habilitar Realtime
1. Ve a **Database > Realtime** (lado izquierdo)
2. Click en **Enable Realtime** (si no está)
3. Selecciona tablas:
   - ✅ `rooms`
   - ✅ `players`
   - ✅ `player_progress`
4. Click **Save**

---

## 2️⃣ VERIFICAR VARIABLES DE ENTORNO EN VERCEL (3 min)

### Paso 1: Vercel Dashboard
1. Ve a [vercel.com](https://vercel.com) > Tu proyecto
2. Click en **Settings > Environment Variables**

### Paso 2: Verificar Existan
Debe haber (estén creadas):
- `VITE_SUPABASE_URL` = tu URL de Supabase
- `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase

❓ **¿No existen?** Cópialas desde Supabase:
1. Ve a **Supabase > Project Settings > API**
2. Copia `Project URL` → pega en `VITE_SUPABASE_URL`
3. Copia `anon key` (con rol `anon`) → pega en `VITE_SUPABASE_ANON_KEY`

### Paso 3: Redeploy
1. En Vercel, click en **Deployments** arriba
2. Click el ⋮ (tres puntos) del último deploy
3. Click **Redeploy**
4. Espera a que diga "Ready" (1-3 min)

---

## 3️⃣ TESTING LOCAL (3-5 min)

### Prueba 1: Crear Sala
```bash
npm run dev
# Abre http://localhost:5173
1. Click "Crear Sala"
2. Escribe nombre (ej: "Prof. Laura")
3. Click "Crear y Entrar al Lobby"
✅ Debería redireccionarte AL LOBBY casi instantaneamente
❌ Si se queda cargando >3s: hay error en Supabase
```

### Prueba 2: Múltiples Navegadores (Realtime)
```bash
1. Abre la app en navegador A → Crea sala → Copia código
2. Abre la app en navegador B (incógnito) → Únete a sala
3. En navegador A, verifica que aparece "2 Agentes Conectados" INSTANTÁNEAMENTE
✅ Si aparece sin refrescar: ¡Realtime funciona!
❌ Si no: algo falla en subscriptions
```

### Prueba 3: Iniciar Partida
```bash
1. En navegador A (host): Click "Iniciar Misión"
2. En navegador B (guest): Debería cambiar a Story SIN refrescar
✅ Transición automática = sincronización funciona
```

---

## 4️⃣ TESTING EN PRODUCCIÓN (Vercel)

Repite las 3 pruebas anteriores pero en tu URL de Vercel (ej: `https://tu-app.vercel.app`)

✅ **Si todo funciona**: ¡Felicidades! Backend está listo  
❌ **Si algo falla**: Ve a **Troubleshooting** abajo

---

## 🚨 TROUBLESHOOTING

### Problema: Se sigue congelando al crear sala

**Solución 1: Verifica RLS**
```sql
-- En Supabase SQL Editor, ejecuta:
SELECT * FROM pg_policies WHERE tablename = 'rooms';
```
Debe retornar al menos 3 policies. Si retorna 0 → RLS no está habilitado.

**Solución 2: Verifica variables en Vercel**
- Abre DevTools (F12) → Console
- Intenta crear sala
- Si ves error rojo: copia el error completo

**Solución 3: Verifica Supabase está online**
- Dashboard Supabase > Status page (esquina superior derecha)
- ¿Algún servicio en rojo? Espera a que se recupere

---

### Problema: Crea sala pero otros no ven código/jugadores

**Causa**: Realtime no funciona o políticas RLS deniegan SELECT

**Solución**:
```sql
-- Verifica permisos SELECT en players
SELECT * FROM pg_policies WHERE tablename = 'players';
-- Debe haber policy "allow_read_players"
```

---

### Problema: Error "Tiempo de espera agotado"

**Significa**: Supabase tarda >2.5s o no responde

**Pasos**:
1. Incia Supabase CLI localmente:
   ```bash
   supabase start
   ```
2. Prueba local con DB local
3. Si funciona local pero no en producción → problema de configuración en Supabase cloud

---

## ✅ VALIDACIÓN FINAL

Cuando esté listo, verifica:

```
✅ Crear sala → Redirecciona a Lobby <3s (sin congelarse)
✅ Múltiples navegadores ven misma sala
✅ Host inicia → Guests ven transición automática
✅ Progreso se sincroniza (si juegas en A, aparece en B)
✅ Desconexión = fallback graceful (no crash)
```

---

## 📋 CHECKLIST DE DESPLIEGUE

- [ ] Script SQL ejecutado en Supabase
- [ ] Realtime habilitado en tablas
- [ ] Variables VITE_* en Vercel
- [ ] Vercel redeployed
- [ ] Pruebas locales pasando
- [ ] Pruebas en Vercel pasando

---

## 🎯 PRÓXIMOS PASOS (OPTIONAL)

Si quieres más funcionalidades:

1. **Leaderboard**: Endpoint `/api/results` que retorna ranking
2. **Persistencia de sesiones**: Guard para no perder progreso
3. **Notificaciones**: Toast cuando alguien se une
4. **Admin Dashboard**: Ver todas las salas activas

Para eso, abre un nuevo issue/prompt con el requerimiento.

---

**¡Listo!** Si siguiste todos los pasos, tu backend está operativo. 🚀
