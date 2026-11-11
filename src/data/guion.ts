/**
 * GUION DE LA DEMO — AGROFUTURO IA
 *
 * Todo lo que se muestra en la demo está escrito aquí. No hay IA real,
 * ni WhatsApp, ni backend. Para cambiar un texto, edite este archivo.
 */

// ---------- Tipos ----------

export type Pestana = 'tecnico' | 'especialista' | 'autoridad'

export type ModuloId =
  | 'sinavifa'
  | 'agroconsulta'
  | 'agroalerta'
  | 'agroproduce'
  | 'agromercado'
  | 'agrogestion'

export type Ilustracion = 'hojaEnferma' | 'hojaSana' | 'cacao'

export type EstadoCaso =
  | 'sin_caso' // todavía no llega nada al técnico
  | 'nuevo' // foto recibida, caso creado
  | 'analizando' // la IA está procesando (4 pasos)
  | 'prediagnostico' // la IA ya tiene un prediagnóstico
  | 'por_validar' // el caso fue enviado al técnico, botón "Validar" activo
  | 'validado' // el técnico validó
  | 'seguimiento' // 7 días después, esperando nueva foto
  | 'cerrado' // el cultivo mejoró, caso cerrado

export type Mensaje =
  | { autor: 'bot'; tipo: 'texto'; texto: string; boton?: string }
  | { autor: 'rosa'; tipo: 'texto'; texto: string }
  | { autor: 'bot'; tipo: 'menu'; texto: string }
  | { autor: 'rosa'; tipo: 'foto'; imagen: Ilustracion; pie: string }
  | { autor: 'bot'; tipo: 'resultado'; boton: string }
  | { autor: 'bot'; tipo: 'recomendaciones'; items: string[]; cierre: string }
  | { tipo: 'separador'; texto: string }

export interface Paso {
  /** Título corto que ve el presentador en la barra de control */
  titulo: string
  /** Nota para quien presenta (qué explicar en este paso) */
  nota: string
  /** Mensajes que se agregan al chat en este paso */
  mensajes: Mensaje[]
  /** Pestaña del lado derecho que se activa en este paso */
  pestana?: Pestana
  /** Estado del caso de Rosa que ve el técnico */
  estadoCaso: EstadoCaso
  /** Si es true, el bot muestra "escribiendo…" ~3 s y el técnico ve los 4 pasos de análisis */
  analisis?: boolean
  /** Color del punto de Huancavelica en el mapa de la autoridad */
  puntoHuancavelica: 'rojo' | 'verde'
}

// ---------- Identidad ----------

export const NOMBRE = 'AGROFUTURO IA'
export const SUBTITULO =
  'Sistema Nacional de Asistencia Técnica y Vigilancia Fitosanitaria Digital para la Agricultura Familiar'
export const MENSAJE_CENTRAL = 'Un técnico agrario inteligente en el bolsillo de cada productor'
export const ETIQUETA_DEMO = 'Demo conceptual — datos simulados'

// ---------- Módulos ----------

export interface Modulo {
  id: ModuloId
  nombre: string
  icono: string
  descripcion: string
  /** Texto del botón en el menú del chat */
  opcion: string
  /** Respuesta de ejemplo cuando se elige en el chat (los módulos secundarios) */
  respuesta?: string
}

export const MODULOS: Modulo[] = [
  {
    id: 'sinavifa',
    nombre: 'SINAVIFA',
    icono: '🔍',
    descripcion: 'Diagnóstico de plagas y enfermedades por foto',
    opcion: '📷 Diagnosticar mi cultivo',
  },
  {
    id: 'agroconsulta',
    nombre: 'AGROCONSULTA',
    icono: '💬',
    descripcion: 'Consultas técnicas',
    opcion: '💬 Hacer una consulta',
    respuesta:
      'Puede preguntarme sobre siembra, riego, abonos o cosecha. Por ejemplo: ¿cuándo aporco mi papa?',
  },
  {
    id: 'agroalerta',
    nombre: 'AGROALERTA',
    icono: '⚠️',
    descripcion: 'Alertas de clima y plagas',
    opcion: '⚠️ Ver alertas',
    respuesta:
      '⚠️ Alerta de helada para su zona esta noche. Riegue por la tarde y cubra sus almácigos.',
  },
  {
    id: 'agroproduce',
    nombre: 'AGROPRODUCE',
    icono: '🌱',
    descripcion: 'Prácticas sostenibles',
    opcion: '🌱 Prácticas sostenibles',
    respuesta: 'Le enseño a preparar abonos naturales como el biol o el compost.',
  },
  {
    id: 'agromercado',
    nombre: 'AGROMERCADO',
    icono: '🧺',
    descripcion: 'Precios y compradores',
    opcion: '🧺 Precios del mercado',
    respuesta: 'Precio de referencia de la papa hoy en su mercado: S/ — (dato simulado).',
  },
  {
    id: 'agrogestion',
    nombre: 'AGROGESTIÓN',
    icono: '📒',
    descripcion: 'Registro de la chacra e historial',
    opcion: '📒 Mi chacra',
    respuesta: 'Mi chacra: 2 parcelas · papa y habas · 1 caso atendido.',
  },
]

export const TEXTO_VOLVER_MENU = 'Volver al menú'
export const TEXTO_MENU_OTRA_VEZ = '¿En qué más le puedo ayudar?'

// ---------- Caso de Rosa (SINAVIFA) ----------

export const CASO_ROSA = {
  agricultora: 'Rosa Ccanto',
  cultivo: 'Papa',
  region: 'Huancavelica',
  distrito: 'Acoria',
  problema: 'Rancha (tizón tardío)',
  agente: 'Phytophthora infestans',
  riesgo: 'alto' as const,
  confianza: '92 %',
  tecnico: 'Ing. Luis Quispe',
  agencia: 'Agencia Agraria Huancavelica',
  recomendaciones: [
    'Retire las hojas afectadas y sáquelas de la chacra.',
    'No riegue por aspersión; riegue al pie de la planta.',
    'Revise las plantas vecinas cada dos días.',
  ],
}

/** Los 4 pasos que se marcan mientras la IA analiza la foto */
export const PASOS_ANALISIS = [
  'Foto recibida',
  'Cultivo identificado: papa',
  'Problema detectado',
  'Recomendaciones listas',
]

// ---------- Caso del especialista (estático) ----------

export const CASO_ESPECIALISTA = {
  cultivo: 'Cacao',
  region: 'San Martín',
  distrito: 'Juanjuí',
  productor: 'Asociación de cacaoteros del Huallaga',
  problema: 'Moniliasis',
  agente: 'Moniliophthora roreri',
  riesgo: 'alto' as const,
  derivadoPor: 'Ing. María Torres — Agencia Agraria Mariscal Cáceres',
  motivo: 'El técnico solicita confirmación por riesgo de brote en la zona.',
  institucion: 'SENASA / INIA',
}

// ---------- Tablero de la autoridad ----------

export interface PuntoMapa {
  id: string
  cultivo: string
  region: string
  /** Coordenadas aproximadas (longitud, latitud) */
  lon: number
  lat: number
  estado: 'alto' | 'proceso' | 'cerrado'
}

export const PUNTOS_MAPA: PuntoMapa[] = [
  { id: 'huancavelica', cultivo: 'Papa', region: 'Huancavelica', lon: -75.0, lat: -12.8, estado: 'alto' },
  { id: 'sanmartin', cultivo: 'Cacao', region: 'San Martín', lon: -76.4, lat: -6.9, estado: 'proceso' },
  { id: 'junin', cultivo: 'Café', region: 'Junín', lon: -75.3, lat: -11.1, estado: 'cerrado' },
  { id: 'lambayeque', cultivo: 'Arroz', region: 'Lambayeque', lon: -79.9, lat: -6.7, estado: 'proceso' },
  { id: 'cusco', cultivo: 'Maíz', region: 'Cusco', lon: -72.0, lat: -13.5, estado: 'cerrado' },
  { id: 'puno', cultivo: 'Quinua', region: 'Puno', lon: -70.1, lat: -15.8, estado: 'alto' },
]

export const INDICADORES_BASE = {
  atendidos: 1247,
  validados: 1092,
  alertas: 7,
}

// ---------- La historia, paso a paso ----------

export const GUION: Paso[] = [
  {
    titulo: 'Rosa abre el chat',
    nota: 'El asistente saluda por su nombre y ofrece los 6 módulos. Pruebe otro módulo si desea: responde con un ejemplo.',
    estadoCaso: 'sin_caso',
    puntoHuancavelica: 'rojo',
    mensajes: [
      {
        autor: 'bot',
        tipo: 'menu',
        texto: '¡Buenos días, Rosa! Soy AGROFUTURO IA, su asistente agrario. ¿En qué le puedo ayudar?',
      },
    ],
  },
  {
    titulo: 'Rosa elige "Diagnosticar mi cultivo"',
    nota: 'El bot le pide una foto con instrucciones simples: de cerca y con buena luz.',
    estadoCaso: 'sin_caso',
    puntoHuancavelica: 'rojo',
    mensajes: [
      { autor: 'rosa', tipo: 'texto', texto: '📷 Diagnosticar mi cultivo' },
      {
        autor: 'bot',
        tipo: 'texto',
        texto: 'Tome una foto de la hoja que le preocupa, de cerca y con buena luz.',
        boton: '📷 Tomar foto',
      },
    ],
  },
  {
    titulo: 'Rosa envía la foto',
    nota: 'En ese mismo instante el caso aparece en la bandeja del técnico de la zona.',
    estadoCaso: 'nuevo',
    pestana: 'tecnico',
    puntoHuancavelica: 'rojo',
    mensajes: [{ autor: 'rosa', tipo: 'foto', imagen: 'hojaEnferma', pie: 'Hoja de mi papa' }],
  },
  {
    titulo: 'La IA analiza la foto',
    nota: 'El análisis toma segundos. A la derecha se ven los 4 pasos que sigue la IA.',
    estadoCaso: 'analizando',
    pestana: 'tecnico',
    analisis: true,
    puntoHuancavelica: 'rojo',
    mensajes: [{ autor: 'bot', tipo: 'texto', texto: 'Recibí su foto. La estoy analizando…' }],
  },
  {
    titulo: 'Prediagnóstico: rancha, riesgo alto',
    nota: 'Es un PREDIAGNÓSTICO de la IA. Todavía no está validado por un técnico.',
    estadoCaso: 'prediagnostico',
    puntoHuancavelica: 'rojo',
    mensajes: [{ autor: 'bot', tipo: 'resultado', boton: '¿Qué hago ahora?' }],
  },
  {
    titulo: 'Recomendaciones y envío al técnico',
    nota: 'Tres acciones simples. El caso pasa a la Agencia Agraria para su validación.',
    estadoCaso: 'por_validar',
    pestana: 'tecnico',
    puntoHuancavelica: 'rojo',
    mensajes: [
      { autor: 'rosa', tipo: 'texto', texto: '¿Qué hago ahora?' },
      {
        autor: 'bot',
        tipo: 'recomendaciones',
        items: CASO_ROSA.recomendaciones,
        cierre: 'Su caso fue enviado al técnico de su zona. Le aviso cuando lo revise.',
      },
    ],
  },
  {
    titulo: 'El técnico valida el caso',
    nota: 'La IA no reemplaza al técnico: él revisa la foto y el prediagnóstico, y lo valida (o lo corrige).',
    estadoCaso: 'validado',
    pestana: 'tecnico',
    puntoHuancavelica: 'rojo',
    mensajes: [],
  },
  {
    titulo: 'Rosa recibe la validación',
    nota: 'La productora sabe que detrás de la respuesta hay una persona de la Agencia Agraria.',
    estadoCaso: 'validado',
    puntoHuancavelica: 'rojo',
    mensajes: [
      {
        autor: 'bot',
        tipo: 'texto',
        texto: '✅ Recomendación validada por el técnico de la Agencia Agraria.',
      },
    ],
  },
  {
    titulo: '7 días después: seguimiento',
    nota: 'El sistema no se olvida del caso. Vuelve a preguntar y pide una nueva foto.',
    estadoCaso: 'seguimiento',
    puntoHuancavelica: 'rojo',
    mensajes: [
      { tipo: 'separador', texto: '7 días después' },
      {
        autor: 'bot',
        tipo: 'texto',
        texto: '¿Cómo va su cultivo, Rosa? Envíeme una nueva foto, por favor.',
        boton: '📷 Enviar nueva foto',
      },
    ],
  },
  {
    titulo: 'El cultivo mejoró: caso cerrado',
    nota: 'El punto de Huancavelica pasa de rojo a verde en el tablero de la autoridad.',
    estadoCaso: 'cerrado',
    pestana: 'autoridad',
    puntoHuancavelica: 'verde',
    mensajes: [
      { autor: 'rosa', tipo: 'foto', imagen: 'hojaSana', pie: 'Mi papa ahora' },
      {
        autor: 'bot',
        tipo: 'texto',
        texto: '¡Su cultivo mejoró! Cerramos el caso. Siga revisando sus plantas y escríbame cuando necesite.',
      },
    ],
  },
]
