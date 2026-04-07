# Rescate del Archivo Central

## Fase 1. Entendimiento del Proyecto

### Objetivo
Construir un MVP de escape room virtual educativo enfocado en comprensión lectora. Un anfitrión crea una sala, otras personas se unen con un código, esperan en un lobby y luego avanzan por 4 retos secuenciales de lectura hasta formar una clave final.

### Alcance
El producto debe cubrir solo lo esencial: crear sala, unirse por código, lobby, inicio de partida, historia, lectura, 4 niveles de preguntas, validación de respuestas, cálculo de puntaje, clave final y registro de progreso en Supabase.

### Restricciones técnicas
Frontend con React + Vite, estilos con CSS simple o CSS modular, persistencia con Supabase, preguntas y narrativa en archivo local JSON o TypeScript, sin backend separado, sin microservicios, sin login por correo, sin chat, sin videollamada, sin tiempo real complejo y sin librerías pesadas si no son estrictamente necesarias.

### Restricciones pedagógicas
Cada pregunta debe medir una habilidad distinta de comprensión lectora: literal, inferencial, crítica y aplicada. Las preguntas deben ser coherentes con el texto, no triviales y no depender de adivinanza. Una respuesta correcta desbloquea el siguiente nivel; una incorrecta bloquea el avance.

### Qué sí va en el MVP
Sala con código, registro básico del jugador, lobby, narrativa, lectura, 4 retos, feedback inmediato, fragmentos de clave, resultado final, puntaje, tiempo y persistencia del progreso.

### Qué no va en el MVP
No va panel administrativo avanzado, no va multijugador colaborativo sobre una misma respuesta, no va 3D, no va SaaS, no va sistema de cuentas, no va chat, no va videollamada, no va backend propio.

## Fase 2. Arquitectura Propuesta

### Por qué React + Vite + Supabase
React + Vite permite una interfaz rápida de construir, modular y liviana. Supabase cubre autenticación futura, base de datos y persistencia sin levantar un backend separado. Esta combinación reduce complejidad y acelera el MVP.

### Cómo se conectan frontend, Supabase y lógica local
La UI vive en React. La lógica pedagógica, narrativa y preguntas vive en archivos locales TypeScript/JSON. Supabase almacena salas, jugadores, progreso y eventos clave. El frontend consulta y escribe en Supabase mediante un cliente único y centralizado. La validación de respuestas se resuelve en el cliente contra un banco local de preguntas para evitar sobreingeniería.

### Arquitectura simple y mantenible
1. Capa de presentación: pantallas y componentes reutilizables.
2. Capa de dominio: reglas de juego, estados, puntaje y ensamblaje de la clave.
3. Capa de datos: Supabase como persistencia y archivo local para preguntas.
4. Capa de infraestructura: cliente Supabase y utilidades de tiempo/código.

## Fase 3. Modelo de Datos

### rooms
Propósito: representar cada sala creada por un anfitrión.

Campos sugeridos:
room_id uuid primary key, room_code text unique, host_name text, status text, created_at timestamptz, started_at timestamptz nullable, finished_at timestamptz nullable, final_code text nullable.

Relación: una sala tiene muchos jugadores y muchos progresos.

### players
Propósito: registrar cada participante dentro de una sala.

Campos sugeridos:
player_id uuid primary key, room_id uuid foreign key, player_name text, is_host boolean, joined_at timestamptz, last_active_at timestamptz, current_level int default 0, score int default 0, completed boolean default false.

Relación: pertenece a una room y puede tener múltiples intentos o un progreso consolidado.

### player_progress
Propósito: guardar el estado de avance por jugador y partida.

Campos sugeridos:
progress_id uuid primary key, player_id uuid foreign key, room_id uuid foreign key, story_seen boolean, reading_seen boolean, level_1_status text, level_2_status text, level_3_status text, level_4_status text, key_fragments text[], final_code text nullable, score int, elapsed_seconds int, updated_at timestamptz.

Relación: uno a uno con un jugador por partida activa, o uno a muchos si se guarda historial.

### attempts
Útil si se quiere auditar intentos.

Campos sugeridos:
attempt_id uuid primary key, player_id uuid foreign key, room_id uuid foreign key, level int, selected_option text, is_correct boolean, created_at timestamptz, response_time_ms int.

Relación: un jugador puede tener varios intentos por nivel si se desea trazabilidad futura.

## Fase 4. Estructura de Carpetas

```text
src/
  app/
    App.tsx
    routes.tsx
  assets/
  components/
    ui/
    game/
  data/
    escapeRoom.ts
  features/
    room/
    game/
    progress/
  hooks/
  lib/
    supabase.ts
    storage.ts
  types/
    game.ts
  utils/
    codes.ts
    timing.ts
  styles/
    globals.css
```

Estructura mínima, clara y fácil de escalar sin caer en arquitectura pesada.

## Fase 5. Flujo Funcional Pantalla por Pantalla

### Inicio
Presenta el nombre del juego, una breve promesa de valor, y dos acciones primarias: crear sala o unirse a sala.

### Crear sala
El anfitrión ingresa su nombre. El sistema genera un código, crea la sala en Supabase y lo lleva al lobby.

### Unirse a sala
El jugador ingresa su nombre y el código. Si la sala existe y está abierta, entra al lobby.

### Lobby
Se muestra el código de la sala, lista de jugadores y estado de espera. Solo el anfitrión ve el botón para iniciar.

### Historia
Se presenta el briefing narrativo: el archivo central está bloqueado y el equipo debe recuperar el acceso.

### Lectura
Se muestra el texto base completo, legible y con scroll cómodo. El usuario confirma que leyó antes de pasar al primer reto.

### Nivel 1
Pregunta literal. Si responde bien, recibe la primera parte de la clave y avanza.

### Nivel 2
Pregunta inferencial. La validación bloquea si falla y explica por qué la opción correcta se deduce del texto.

### Nivel 3
Pregunta crítica. Se pide valorar la decisión de la directora, no solo repetir hechos.

### Nivel 4
Pregunta aplicada. El jugador traslada el aprendizaje a un caso nuevo.

### Resultado final
Se muestra la clave armada, puntaje, tiempo total, estado final y una llamada a reiniciar o volver al inicio.

## Fase 6. Definición de Estados y Lógica

### Estado de sala
Open, waiting, in_progress, finished, archived.

### Estado de jugador
Joined, ready, reading, answering, blocked, completed.

### Estado del juego
Idle, lobby, story, reading, level_1, level_2, level_3, level_4, result.

### Estado de respuestas
Pending, correct, incorrect, locked.

### Lógica de bloqueo y desbloqueo
Solo una respuesta correcta habilita el siguiente nivel. Si falla, el nivel queda bloqueado hasta que el jugador reintente correctamente. El avance es secuencial y sin saltos.

### Cálculo de puntaje
Base de 100 por nivel correcto. Bonificación por rapidez si se responde en menos tiempo del umbral definido. Penalización mínima por errores repetidos, sin frustrar la experiencia.

### Ensamblaje de la clave final
Cada acierto entrega un fragmento. La clave final se forma concatenando los 4 fragmentos en orden. La visualización final debe mostrar la clave completa y la evidencia de qué parte aportó cada nivel.

## Fase 7. Diseño Pedagógico

### Historia inicial
“El Archivo Central de San Gabriel quedó bloqueado tras una falla crítica. Los registros esenciales para recuperar el acceso están dispersos en cuatro pruebas de comprensión. Solo quienes interpreten con precisión el texto podrán restaurar la entrada.”

### Texto base
“La biblioteca del barrio San Gabriel había perdido visitantes durante varios meses. Al principio, algunos vecinos pensaron que los jóvenes ya no querían leer. Sin embargo, la directora decidió investigar antes de sacar conclusiones. Descubrió que muchos estudiantes evitaban ir porque el lugar tenía pocos computadores y una conexión a internet inestable. Entonces, la biblioteca amplió su horario en época de exámenes, instaló nuevos equipos y organizó talleres de lectura. Dos meses después, la asistencia aumentó un 35%, especialmente entre estudiantes de secundaria. El cambio mostró que, antes de juzgar a los usuarios, era necesario comprender qué obstáculos enfrentaban.”

### Pregunta 1. Nivel literal
Enunciado: ¿Cuál fue una de las principales razones por las que muchos estudiantes evitaban ir a la biblioteca?

Opciones:
1. Porque la biblioteca cobraba entrada.
2. Porque el lugar tenía pocos computadores y una conexión a internet inestable.
3. Porque no había libros impresos suficientes.
4. Porque la directora había cerrado la biblioteca por obras.

Respuesta correcta: 2.
Fragmento de clave: 3.
Feedback correcto: Identificaste un dato explícito del texto.
Feedback incorrecto: Revisa la información mencionada de forma directa en el texto; la respuesta está expresada sin necesidad de inferir.

### Pregunta 2. Nivel inferencial
Enunciado: ¿Qué se puede inferir sobre la decisión de la directora de investigar antes de sacar conclusiones?

Opciones:
1. Que buscaba culpar a los estudiantes por no asistir.
2. Que quiso entender las causas reales antes de tomar medidas.
3. Que pensó que el problema era solo de publicidad.
4. Que prefería esperar a que los usuarios volvieran solos.

Respuesta correcta: 2.
Fragmento de clave: 8.
Feedback correcto: Deduciste la intención de la directora a partir de sus acciones.
Feedback incorrecto: No basta con repetir un hecho; debes interpretar la lógica de su decisión.

### Pregunta 3. Nivel crítico
Enunciado: ¿Cuál valoración es más acertada sobre la respuesta de la biblioteca al problema?

Opciones:
1. Fue inadecuada porque cambió demasiado tarde.
2. Fue acertada porque atendió barreras reales de acceso y uso.
3. Fue incorrecta porque solo debió aumentar el horario.
4. Fue innecesaria porque la asistencia aumentaría de todos modos.

Respuesta correcta: 2.
Fragmento de clave: 1.
Feedback correcto: Hiciste un juicio razonado basado en evidencia del texto.
Feedback incorrecto: El nivel crítico evalúa la calidad de la respuesta institucional, no solo el dato observado.

### Pregunta 4. Nivel aplicado
Enunciado: Si una escuela detecta baja participación en su biblioteca digital por problemas de acceso a internet, ¿qué acción sigue mejor la lógica del texto?

Opciones:
1. Castigar a los estudiantes por no ingresar.
2. Mantener la plataforma sin cambios para evitar costos.
3. Investigar las barreras de acceso y ajustar recursos o horarios.
4. Eliminar la biblioteca digital.

Respuesta correcta: 3.
Fragmento de clave: 5.
Feedback correcto: Aplicaste la idea central a un caso nuevo.
Feedback incorrecto: Debes transferir la solución del texto a una situación distinta, no copiar una reacción punitiva o pasiva.

### Clave final
3 - 8 - 1 - 5

## Fase 8. Plan de Desarrollo por Etapas

### Etapa 1. Setup del proyecto
Crear el proyecto con React + Vite, TypeScript y CSS simple. Configurar variables de entorno, scripts base y estructura de carpetas.

### Etapa 2. Instalación de dependencias
Instalar solo lo imprescindible: supabase-js, opcionalmente react-router-dom si se decide separar pantallas por rutas. Evitar librerías de estado global innecesarias.

### Etapa 3. Creación de pantallas
Construir Inicio, Crear sala, Unirse a sala, Lobby, Historia, Lectura, Nivel 1 a 4 y Resultado final.

### Etapa 4. Conexión con Supabase
Crear cliente, consultas de lectura, inserción de sala, registro de jugadores y persistencia de progreso.

### Etapa 5. Lógica de sala
Generar código, validar unión, manejar anfitrión, iniciar partida y reflejar estado del lobby.

### Etapa 6. Lógica de preguntas
Mapear el texto base, las preguntas, las opciones, la validación y el desbloqueo por niveles.

### Etapa 7. Persistencia
Guardar avances, puntajes, intentos y resultado final por jugador.

### Etapa 8. UI mínima
Aplicar layout claro, paneles legibles, tipografía sobria, estados visuales y feedback inmediato.

### Etapa 9. Pruebas
Verificar creación y unión a sala, secuencia de niveles, validación de respuestas, ensamblaje de clave y persistencia.

## Fase 9. Generación de Código

Base inicial a generar:
1. `src/app/App.tsx` para orquestar vistas.
2. `src/data/escapeRoom.ts` para historia, texto y preguntas.
3. `src/lib/supabase.ts` para el cliente y operaciones de persistencia.
4. `src/types/game.ts` para tipos del dominio.
5. `src/utils/codes.ts` y `src/utils/timing.ts` para lógica de apoyo.
6. `src/components/` para controles, tarjetas y feedback.

Explicación breve: esta separación mantiene el dominio aislado, facilita pruebas y evita que la lógica pedagógica se mezcle con la presentación.

## Fase 10. Validación Final

### Checklist funcional
La sala se crea y genera código, los jugadores pueden unirse, el lobby espera al anfitrión, la partida inicia, cada nivel desbloquea el siguiente con respuesta correcta, la clave final se construye y el progreso queda registrado en Supabase.

### Checklist pedagógico
Las preguntas cubren literal, inferencial, crítico y aplicado. El texto base sostiene las respuestas. No hay preguntas triviales.

### Checklist técnico
No hay sobreingeniería, no hay backend propio, no hay estado global excesivo, no hay dependencias pesadas, y el MVP es realista de construir.

### Checklist de producto
La experiencia es clara, simple, educativa y suficientemente inmersiva para la narrativa de rescate del archivo central.

---

## Sistema Visual Propuesto

### Fase 1. Concepto visual general
Dirección artística: panel educativo nocturno, elegante y técnico, con atmósfera de misión y bloqueo de sistema. Debe transmitir claridad, lectura cómoda y una tensión ligera de escape room, sin caer en estética gamer exagerada.

### Fase 2. Sistema visual
Paleta: fondo principal muy oscuro, superficies en azul grisáceo, acento cyan o verde tecnológico, estados de éxito en verde suave y error en rojo controlado. Tipografías: una sans moderna y legible para interfaz, y una variante con más personalidad para títulos. Botones: primario sólido con alto contraste, secundario con borde y fondo discreto. Tarjetas: fondo semitransparente, borde sutil, sombra suave. Inputs: amplios, limpios, con foco visible. Feedback: chips y paneles con icono, color y microcopy claro.

### Fase 3. Arquitectura visual de pantallas
Layout general: encabezado con marca y estado, área central con tarjeta principal, pie reducido con progreso o clave. En responsive, todo debe apilarse en una sola columna, con lectura prioritaria y botones de ancho completo en móvil.

### Fase 4. Diseño de componentes
Botón primario: acción principal, sólido y destacado. Botón secundario: acción complementaria. Input: borde suave, label visible, ayuda opcional. Tarjeta de jugador: nombre, estado y rol. Tarjeta de pregunta: nivel, enunciado, opciones y respuesta. Panel de feedback: estado correcto o incorrecto con explicación. Barra de progreso: avance por 4 niveles. Insignia de nivel: literal, inferencial, crítico o aplicado. Módulo de clave final: fragmentos visibles y clave ensamblada.

### Fase 5. UI pantalla por pantalla
Inicio: branding centrado, texto breve y dos CTAs claros.
Crear sala: formulario corto con confirmación inmediata del código.
Unirse a sala: dos campos, validación simple y entrada al lobby.
Lobby: código muy visible, lista de jugadores, estado de espera e inicio solo para anfitrión.
Historia: tarjeta narrativa con sensación de briefing.
Lectura: bloque de texto grande, cómodo y muy legible.
Preguntas: encabezado de nivel, opciones tipo lista o cards, feedback inmediato y fragmento ganado.
Resultado final: clave completa, puntaje, tiempo y cierre satisfactorio.

### Fase 6. Microcopy
Bienvenida: “Accede al Archivo Central y recupera la clave.”
Espera en lobby: “La sala está lista. Esperando al anfitrión.”
Misión inicial: “Lee el informe, resuelve cada nivel y desbloquea la salida.”
Lectura: “Analiza el texto con atención: cada detalle importa.”
Acierto: “Respuesta correcta. Se ha desbloqueado una parte de la clave.”
Error: “Respuesta incorrecta. Revisa el texto y vuelve a intentarlo.”
Finalización: “Acceso restaurado. Misión completada.”

### Fase 7. Recomendaciones de implementación
Usar CSS simple con variables, grid y flex, sin sistemas de diseño pesados. Reutilizar componentes. Mantener un máximo de dos o tres niveles visuales por pantalla. Priorizar legibilidad, estados claros y feedback inmediato.

---

## Decisión Final
La implementación óptima es un MVP secuencial, centrado en lectura y validación individual, con Supabase solo como persistencia y React + Vite como capa principal de experiencia. Todo lo demás debe esperar a una versión posterior.