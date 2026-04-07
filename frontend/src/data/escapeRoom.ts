import type { EscapeRoomContent } from '../types/game'

export const escapeRoomContent: EscapeRoomContent = {
  title: 'Crisis en el Archivo Central',
  missionTitle: 'Operacion de Restauracion Critica',
  story:
    'A las 14:32 del martes, el Archivo Central de San Gabriel colapso. Un fallo en cascada fragmento todos sus registros en cuatro sectores codificados. La ciudad depende de estos datos para servicios esenciales: salud, educacion, infraestructura. Un equipo clandestino de hackers descubrio que cada respuesta correcta a preguntas sobre un informe critico desbloquea un fragmento del codigo maestro. Tienes 4 intentos para restaurar el acceso completo. El tiempo corre. Los fragmentos no se pueden recuperar dos veces. Cada error hace que el sistema se resellea automaticamente. ¿Podras descifrar la contraseña antes de que sea demasiado tarde?',
  readingTitle: 'INFORME CLASIFICADO: El Colapso de los Servicios en San Gabriel',
  readingText:
    'SAN GABRIEL - CRISIS URBANA (Informe Confidencial)\n\n[ANTECEDENTES]\nLa biblioteca del barrio San Gabriel funcionaba como nucleode informacion publica durante mas de 30 anos. Sin embargo, en los ultimos 6 meses, su asistencia cayo dramaticamente un 58%. Los administradores del sistema urbano notaron que otros servicios comunitarios tambien se desconectaban: los jovenes no solicitaban becas, el acceso a cursos en linea decayo, y la alfabetizacion digital se detuvo.\n\n[PROBLEMA INICIAL IDENTIFICADO]\nLa directora de la biblioteca, Maria Gomez, decidio iniciar una investigacion empırica en lugar de asumir culpabilidad. Distribuyeron encuestas anonimas y realizo entrevistas con estudiantes ausentes. Los resultado fueron reveladores: no era que los jovenes rechazaran los servicios, sino que NO PODIAN acceder a ellos.\n\n[BARRERA CRITICA ENCONTRADA]\nLa raız del problema fue explicita: 90% de los computadores estaban obsoletos (con 8+ anos de uso), la conexion a internet colapsaba en horas pico, y el horario limitado (cierre a las 5 PM) coincidıa exactamente con cuando los estudiantes salıan de clases. Mas alarmante aun: 45% de los usuarios potenciales vivian en zonas donde necesitaban transporte publico, que dejaba de funcionar a las 6 PM.\n\n[ACCION ESTRATEGICA IMPLEMENTADA]\nEl diagnostico llevo a acciones concretas y coordinadas:\n- Ampliacion del horario hasta las 9 PM (cubriendo las 2 horas criticas de transporte)\n- Renovacion completa de equipamiento (48 nuevas computadoras)\n- Mejora de infraestructura de conectividad (fibra optica dedicada)\n- Creacion de programas nocturnos de tutor ía e iniciacion digital\n\n[RESULTADOS EN TIEMPO REAL]\nA los 30 dıas: +25% de asistencia\nA los 60 dıas: +35% de asistencia\nA los 90 dıas: +52% de asistencia, y expansión de demas servicios urbanos (becas: +40%, acceso a cursos: +38%)\n\n[CONCLUSION ESTRATEGICA]\nEsta crisis urbana revelo un principio fundamental: los problemas de participacion rara vez son resultado de desinteres. Son el sintoma visible de barreras invisibles. La solucion no fue culpar a usuarios, sino ELIMINAR LOS OBSTACULOS que les impedıan participar. Cuando se removieron las barreras reales, el cambio fue inmediato y medible.',
  questions: [
    {
      id: 1,
      levelType: 'literal',
      levelLabel: '',
      prompt:
        'Según el informe, ¿cual fue el factor MENOS secundario en la baja asistencia de estudiantes a la biblioteca?',
      options: [
        { id: 'a', text: 'La ampliacion del horario hasta las 9 PM fue lo que principalmente revirtió la caida.' },
        {
          id: 'b',
          text: 'La combinacion de equipamiento obsoleto (8+ años), internet colapsado en horas pico, y horarios que no coincidian con disponibilidad de transporte publico (que cerraba a las 6 PM).',
        },
        { id: 'c', text: 'El aumento de +35% se debio principalmente a la renovacion de computadores, no a otros factores.' },
        { id: 'd', text: 'El transporte publico fue la unica barrera que Maria Gomez necesitaba resolver.' },
      ],
      correctOptionId: 'b',
      explanation:
        '✓ CORRECTO - Fragmento 1 DESBLOQUEADO\n\nIdentificaste el SISTEMA COMPLEJO de barreras. No fue un solo factor.\n\nEl informe es explicito en [BARRERA CRITICA ENCONTRADA]:\n\n→ 90% de computadores OBSOLETOS (con 8+ años de uso)\n→ Conexion COLAPSABA en horas pico (no era continua)\n→ Horario limitado (cierre 5 PM) COINCIDÍA con salida de estudiantes\n→ 45% vivian en zonas donde NECESITABAN transporte (que cerraba 6 PM)\n\nFue una INTERSECCION de tres barreras simultáneas, no una sola. Las opciones A, C y D hacen énfasis en un único factor, lo cual simplifica demasiado.',
      incorrectFeedback:
        '✗ RESPUESTA INCORRECTA\n\nAtrapaste una trampa sutil. Vuelve a leer [BARRERA CRITICA ENCONTRADA].\n\nLa respuesta A es parcialmente cierta (el horario SÍ se amplió), pero NO fue "lo que principalmente revirtio la caida".\nLa respuesta C es falsa: el aumento fue por la COMBINACION de mejoras.\nLa respuesta D omite dos problemas criticos: equipos obsoletos e internet colapsado.\n\nEl diagnostico de Maria Gomez fue INTEGRAL:\n✓ Renovacion completa de equipamiento (48 nuevas computadoras)\n✓ Mejora de infraestructura de conectividad (fibra optica dedicada)\n✓ Ampliacion del horario hasta las 9 PM\n✓ Programas nocturnos de tutoria\n\nFue la ELIMINACION SIMULTANEA de múltiples barreras lo que funcionó. El sistema te RESELLÓ.',
      keyFragment: '1',
    },
    {
      id: 2,
      levelType: 'inferencial',
      levelLabel: '',
      prompt:
        '¿Cual es la implicacion MAS PROFUNDA de que Maria Gomez haya hecho encuestas ANONIMAS a los estudiantes ausentes?',
      options: [
        { id: 'a', text: 'Queria que los estudiantes se sintieran comodos siendo honestos sin miedo a represalias o vergüenza, revelando obstaculos reales que tal vez no mencionarian en publico.' },
        { id: 'b', text: 'Para proteger su propia privacidad como directora ante posibles criticas sobre su gestion.' },
        { id: 'c', text: 'Porque los estudiantes eran menores de edad y la ley lo requeria.' },
        { id: 'd', text: 'Simplemente para ahorrar tiempo en lugar de hacer entrevistas cara a cara.' },
      ],
      correctOptionId: 'a',
      explanation:
        '✓ CORRECTO - Fragmento 2 DESBLOQUEADO\n\n¡Pensamiento sofisticado! Captaste una estrategia psicologica CRITICA.\n\nEl anonimato permanecia una barrera PSICOLOGICA frecuente:\n- Les permitia a estudiantes admitir "No voy porque..." SIN:\n  → Sentirse mal por criticar un servicio publico\n  → Temer represalias sociales\n  → Avergonzarse de razones economicas (no tengo costo de transporte)\n\nMaria no solo recopilo DATOS. Creo un ESPACIO SEGURO para verdad.\n\nEsta es una leccion de investigacion cualitativa: diseñar el metodo para que la gente revele lo que REALMENTE obstaculiza su acceso, no lo que CREE que deberia responder.',
      incorrectFeedback:
        '✗ RESPUESTA INCORRECTA\n\nTrapaste una asuncion superficial. Relée [PROBLEMA INICIAL IDENTIFICADO]:\n\n"Distribuyeron encuestas anonimas y realizó entrevistas con estudiantes ausentes"\n\nNota: AMBAS acciones se hicieron (encuestas ANONIMAS + entrevistas).\n\nLa respuesta B asume intención defensiva (no esta en el texto).\nLa respuesta C sobre menores: el texto no menciona esto.\nLa respuesta D sobre "ahorrar tiempo": es falso, hace AMBAS cosas.\n\nLa implicacion profunda es PSICOLOGICA:\nEl anonimato permite que la gente sea honesta sobre obstaculos reales sin:\n- Vergüenza social\n- Miedo a represalias\n- Presion de respuestas "aceptables"\n\nEsta es tu SEGUNDA oportunidad. Piensa en que CREA Maria Gomez que necesitaban sus estudiantes para ser honestos.',
      keyFragment: '2',
    },
    {
      id: 3,
      levelType: 'critico',
      levelLabel: '',
      prompt:
        '¿Por que el informe muestra cambios en OTROS SERVICIOS urbanos (becas +40%, cursos +38%) cuando solo se mejoro la biblioteca?',
      options: [
        { id: 'a', text: 'Porque todos esos servicios estaban en el mismo lugar fisico, la biblioteca, y por eso mejoraron juntos.' },
        { id: 'b', text: 'Porque cuando removieron las barreras de ACCESO a herramientas (internet, equipamiento, horarios), estudiantes los usaron para acceder a OTROS servicios, generando efecto cascada en el sistema urbano.' },
        { id: 'c', text: 'Porque Maria Gomez tambien mejoro esos servicios al mismo tiempo como parte de su plan integral.' },
        { id: 'd', text: 'Es una coincidencia estadistica: los numeros subieron accidentalmente en otros servicios.' },
      ],
      correctOptionId: 'b',
      explanation:
        '✓ CORRECTO - Fragmento 3 DESBLOQUEADO\n\n¡PENSAMIENTO SISTEMICO ACTIVADO! Reconociste un efecto MULTIPLICADOR.\n\nEsta es la revelacion critica del informe:\n\nMejorar acceso a una HERRAMIENTA (internet, equipamiento) no beneficia solo a esa institucion. HABILITA acceso a muchos servicios que DEPENDEN de esa herramienta.\n\nCausa efecto:\nEstudiantes ahora pueden:\n✓ Investigar becas en linea → +40% solicitudes de becas\n✓ Acceder a plataformas de cursos → +38% matriculas en cursos\n✓ Usar computadores sin horario limitado → mas tiempo para todo\n\nNo fue que Maria Gomez mejorara esos otros servicios.\nFue que al remover LA BARRERA TECNICA primero, los estudiantes tuvieron acceso a TODO lo que esos servicios ofrecian.\n\nEsta es la leccion de ARQUITECTURA DE SISTEMAS URBANOS.',
      incorrectFeedback:
        '✗ RESPUESTA INCORRECTA\n\nNo capturaste la logica de SISTEMAS INTERCONECTADOS.\n\nRelée [RESULTADOS EN TIEMPO REAL]:\nLos numeros de becas y cursos subieron cuando se mejoro la BIBLIOTECA.\n\nLa respuesta A es falsa: los servicios (becas, cursos) no estan en la biblioteca, son separados.\nLa respuesta C es falsa: el informe no dice que Maria Gomez mejorara esos servicios.\nLa respuesta D rechaza la evidencia claros (no es "coincidencia").\n\nLa verdad CRITICA:\nBecas y cursos requieren ACCESO A INTERNET Y EQUIPAMIENTO.\nCuando estudiantes obtuvieron herramientas para navegar esos servicios, la participacion subio en CASCADA.\n\nEntendiste el sistema como silos separados. Pero estan conectados por INFRAESTRUCTURA BASICA (internet, equipos).\n\nEsta es tu TERCERA oportunidad. El código se reselló.',
      keyFragment: '3',
    },
    {
      id: 4,
      levelType: 'aplicado',
      levelLabel: '',
      prompt:
        'Un hospital rural reporta que solo 20% de mujeres embarazadas asisten a controles prenatales. Utilizando el METODO específico de Maria Gomez (no solo sus conclusiones), ¿que preguntas deberia priorizar en una PRIMERA encuesta anonima?',
      options: [
        { id: 'a', text: 'Preguntas abiertas genéricas como "¿Por qué no vienes?" que dejan que mujeres desarrollen sus propias explicaciones de barreras percibidas.' },
        { id: 'b', text: 'Enfocarse en preguntas sobre ACCESO: distancia al hospital, horario de atencion vs. disponibilidad personal, costo, confiabilidad de transporte, capacidad de dejar a otros hijos bajo cuidado, miedo o barreras culturales/religiosas.' },
        { id: 'c', text: 'Hacer una encuesta sobre satisfaccion general del servicio de salud para mejorar la reputación del hospital.' },
        { id: 'd', text: 'Preguntar directamente "¿No te importa tu salud o tu bebe?" para identificar mujeres desinteresadas.' },
      ],
      correctOptionId: 'b',
      explanation:
        '✓ CORRECTO - Fragmento FINAL DESBLOQUEADO\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCÓDIGO MAESTRO RESTAURADO: 3-8-1-5\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n¡DEMOSTRASTE COMPRENSION PROFUNDA DEL METODO!\n\nNo asumiste "desinteres". Replicaste el DIAGNOSTICO ESTRUCTURADO de Maria:\n\n✓ En [PROBLEMA INICIAL] ella noto: "no era que rechazaran, sino que NO PODIAN acceder"\n✓ En [BARRERA CRITICA] ella ESPECIFICO: equipos, internet, horarios, transporte\n✓ En [ACCION] ella remedio CADA barrera identificada\n\nTu respuesta B pregunta por EXACTAMENTE eso:\n- Distancia (barrera geografica)\n- Horario vs disponibilidad (barrera temporal)\n- Costo (barrera economica)\n- Transporte (barrera logistica)\n- Cuidado de otros hijos (barrera familia-hogar)\n- Miedo/cultural (barrera psicologica-social)\n\nNo es generico. Es ESPECIFICO. Esto permite diseñar soluciones REALES.\n\nEl Archivo Central está restaurado. La ciudad accede a todos sus servicios. Tu equipo de hackers lo logro.',
      incorrectFeedback:
        '✗ RESPUESTA INCORRECTA\n\nNo aplicaste ESPECIFICIDAD del metodo de Maria Gomez.\n\nRelée [ACCION ESTRATEGICA]:\nElla no pregunto genero. Pregunto sobre:\n• Equipos (¿estan obsoletos?)\n• Horarios (¿falta coincidencia de cuando pueden venir?)\n• Transporte (¿necesitan desplazarse?)\n\nLa respuesta A es vaga: "preguntas abiertas genéricas" = no es investigacion sistematica.\nLa respuesta C ignora la investigacion: "satisfaccion general" no descubre BARRERAS.\nLa respuesta D es culpabilización: es lo OPUESTO al metodo (asumir desinteres).\n\nMaria Gomez TUVO HIPOTESIS sobre donde podian estar las barreras:\n✓ Tecnologia (computadores viejos, internet deficiente)\n✓ Tiempo/Horario (cierre temprano, conflicto con transporte)\n✓ Distancia (ubicacion inaccesible)\n\nDiseño preguntas PARA PROBAR esas hipótesis, no preguntas genéricas.\n\nPara el hospital:\nD:¿Que tan lejos queda el hospital de tu casa?\nD:¿A qué hora atiende el hospital vs. cuando PUEDES ir?\nD:¿Tienes como llegar? ¿Cuesta dinero?\nD:¿Quien cuidaria a tus otros hijos?\n\nEsta es tu ULTIMA OPORTUNIDAD. Piensa en BARRERAS ESPECIFICAS, no diagnosticos vagos.',
      keyFragment: '4',
    },
  ],
}
