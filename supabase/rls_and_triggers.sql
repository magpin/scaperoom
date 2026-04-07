-- ============================================================
-- FASE 2: RLS POLICIES Y TRIGGERS PARA SUPABASE
-- Ejecuta esto en Supabase SQL Editor
-- ============================================================

-- 1. HABILITAR RLS EN TABLAS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos explicitos a roles anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE players TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE player_progress TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE attempts TO anon, authenticated;

-- ============================================================
-- 2. POLICIES PARA TABLA "rooms"
-- ============================================================

-- Permitir crear sala sin autenticación
DROP POLICY IF EXISTS "allow_create_room_anonymous" ON rooms;
CREATE POLICY "allow_create_room_anonymous" ON rooms
  FOR INSERT WITH CHECK (true);

-- Permitir leer todas las salas (public)
DROP POLICY IF EXISTS "allow_read_rooms" ON rooms;
CREATE POLICY "allow_read_rooms" ON rooms
  FOR SELECT USING (true);

-- Permitir actualizar sala (cualquiera puede, por ahora - refinar si es necesario)
DROP POLICY IF EXISTS "allow_update_rooms" ON rooms;
CREATE POLICY "allow_update_rooms" ON rooms
  FOR UPDATE USING (true);

-- Permitir eliminar sala (refinar si necesario)
DROP POLICY IF EXISTS "allow_delete_rooms" ON rooms;
CREATE POLICY "allow_delete_rooms" ON rooms
  FOR DELETE USING (true);

-- ============================================================
-- 3. POLICIES PARA TABLA "players"
-- ============================================================

-- Permitir crear jugador sin auth
DROP POLICY IF EXISTS "allow_create_player" ON players;
CREATE POLICY "allow_create_player" ON players
  FOR INSERT WITH CHECK (true);

-- Permitir leer jugadores de cualquier sala
DROP POLICY IF EXISTS "allow_read_players" ON players;
CREATE POLICY "allow_read_players" ON players
  FOR SELECT USING (true);

-- Permitir actualizar jugador desde cliente
DROP POLICY IF EXISTS "allow_update_player" ON players;
CREATE POLICY "allow_update_player" ON players
  FOR UPDATE USING (true);

-- Permitir eliminar jugador
DROP POLICY IF EXISTS "allow_delete_player" ON players;
CREATE POLICY "allow_delete_player" ON players
  FOR DELETE USING (true);

-- ============================================================
-- 4. POLICIES PARA TABLA "player_progress"
-- ============================================================

-- Permitir crear progreso
DROP POLICY IF EXISTS "allow_create_progress" ON player_progress;
CREATE POLICY "allow_create_progress" ON player_progress
  FOR INSERT WITH CHECK (true);

-- Permitir leer progreso
DROP POLICY IF EXISTS "allow_read_progress" ON player_progress;
CREATE POLICY "allow_read_progress" ON player_progress
  FOR SELECT USING (true);

-- Permitir actualizar progreso
DROP POLICY IF EXISTS "allow_update_progress" ON player_progress;
CREATE POLICY "allow_update_progress" ON player_progress
  FOR UPDATE USING (true);

-- ============================================================
-- 5. POLICIES PARA TABLA "attempts"
-- ============================================================

-- Permitir insertar intentos
DROP POLICY IF EXISTS "allow_create_attempt" ON attempts;
CREATE POLICY "allow_create_attempt" ON attempts
  FOR INSERT WITH CHECK (true);

-- Permitir leer intentos
DROP POLICY IF EXISTS "allow_read_attempt" ON attempts;
CREATE POLICY "allow_read_attempt" ON attempts
  FOR SELECT USING (true);

-- ============================================================
-- 6. TRIGGER: GENERAR room_code UNIQUE AUTOMÁTICAMENTE
-- ============================================================

-- Crear función que genera código único
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TRIGGER AS $$
DECLARE
  v_code text;
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_loop_count int := 0;
BEGIN
  -- Intentar generar código único máximo 10 veces
  LOOP
    v_loop_count := v_loop_count + 1;
    
    -- Generar código aleatorio de 6 caracteres
    v_code := '';
    FOR i IN 1..6 LOOP
      v_code := v_code || substr(v_alphabet, floor(random() * length(v_alphabet))::int + 1, 1);
    END LOOP;
    
    -- Verificar que no exista
    IF NOT EXISTS (SELECT 1 FROM rooms WHERE room_code = v_code) THEN
      NEW.room_code := v_code;
      RETURN NEW;
    END IF;
    
    -- Fallback si no encuentra código después de 10 intentos
    IF v_loop_count >= 10 THEN
      RAISE EXCEPTION 'No se pudo generar código de sala único después de 10 intentos';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que ejecuta la función antes de INSERT
DROP TRIGGER IF EXISTS room_code_trigger ON rooms;
CREATE TRIGGER room_code_trigger
BEFORE INSERT ON rooms
FOR EACH ROW
WHEN (NEW.room_code IS NULL OR NEW.room_code = '')
EXECUTE FUNCTION generate_room_code();

-- ============================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_progress_room_id ON player_progress(room_id);
CREATE INDEX IF NOT EXISTS idx_progress_player_id ON player_progress(player_id);

-- ============================================================
-- 8. ENNEBLE REALTIME SUBSCRIPTIONS
-- ============================================================

-- Supabase realtime se habilita vía dashboard, pero aquí está la estructura:
-- Dashboard > Realtime > Add existing table > Seleccionar:
--   - rooms (para cambios en status, players)
--   - players (para cambios en lista de jugadores)
--   - player_progress (para cambios en progreso)

-- ============================================================
-- Listo: Ahora el cliente React puede usar Realtime
-- ============================================================
