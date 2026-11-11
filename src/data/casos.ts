/**
 * DATOS SIMULADOS DEL PROTOTIPO PARA SENASA
 *
 * Casos, alertas, regiones y catálogo de diagnósticos. Todo es ficticio.
 * Las fechas se calculan respecto al momento en que se abre el prototipo,
 * para que siempre se vean recientes.
 */

export type Riesgo = 'alto' | 'medio' | 'bajo'

export type EstadoCasoSenasa =
  | 'por_revisar' // derivado por el técnico, nadie de SENASA lo tomó
  | 'en_revision' // un especialista lo tomó
  | 'inspeccion' // se pidió inspección en campo o muestra para laboratorio
  | 'seguimiento' // dictamen emitido; se espera la foto de seguimiento del día 7
  | 'cerrado' // el cultivo mejoró y SENASA cerró el caso
  | 'descartado' // no corresponde a plaga o enfermedad de importancia

export type FotoId =
  | 'papa_rancha'
  | 'cacao_monilia'
  | 'cafe_roya'
  | 'arroz_pyricularia'
  | 'maiz_cogollero'
  | 'quinua_mildiu'
  | 'palta_fitoftora'
  | 'citrico_fumagina'

export interface EventoHistorial {
  fecha: string // ISO
  autor: string
  rol: 'productor' | 'ia' | 'tecnico' | 'senasa' | 'sistema'
  texto: string
}

export interface Caso {
  id: string
  fecha: string // ISO, fecha del reporte del productor
  productor: string
  telefono: string
  region: string
  provincia: string
  distrito: string
  altitud: string
  superficie: string
  cultivo: string
  variedad: string
  foto: FotoId
  sintomasReportados: string
  prediagnostico: {
    problema: string
    agente: string
    confianza: number // 0-100
    sintomas: string[]
  }
  riesgo: Riesgo
  plagaRegulada: boolean
  tecnico: string
  agencia: string
  notaTecnico: string
  estado: EstadoCasoSenasa
  asignadoA?: string
  dictamen?: {
    tipo: 'confirmado' | 'corregido' | 'descartado'
    problema: string
    agente: string
    nota: string
    fecha: string
    autor: string
  }
  /** Foto de seguimiento del día 7 (si ya llegó) */
  seguimiento?: { fecha: string; mejoro: boolean; nota: string }
  historial: EventoHistorial[]
}

export interface Alerta {
  id: string
  fecha: string
  titulo: string
  problema: string
  cultivo: string
  regiones: string[]
  nivel: Riesgo
  mensaje: string
  estado: 'activa' | 'cerrada'
  emitidaPor: string
  casoOrigen?: string
  productoresAlcanzados: number
}

// ---------- Usuario del prototipo ----------

export const USUARIO = {
  nombre: 'Blga. Ana Mendoza',
  nombreCorto: 'Ana',
  cargo: 'Especialista en Sanidad Vegetal',
  institucion: 'SENASA',
  sede: 'Dirección de Sanidad Vegetal · Lima',
  iniciales: 'AM',
}

// ---------- Regiones ----------

/** Ubicación en el mapa (lon, lat), productores registrados (simulado) y lado de la etiqueta */
export const REGIONES: Record<
  string,
  { lon: number; lat: number; productores: number; etiqueta: 'izq' | 'der' | 'abajo' }
> = {
  // Posiciones esquemáticas (no exactas) para que los puntos no se encimen en el mapa
  Amazonas: { lon: -77.5, lat: -5.5, productores: 48200, etiqueta: 'der' },
  Apurímac: { lon: -72.9, lat: -14.3, productores: 71500, etiqueta: 'abajo' },
  Arequipa: { lon: -72.0, lat: -16.2, productores: 39800, etiqueta: 'izq' },
  Ayacucho: { lon: -74.2, lat: -13.9, productores: 82300, etiqueta: 'izq' },
  Cajamarca: { lon: -78.6, lat: -7.5, productores: 140100, etiqueta: 'izq' },
  Cusco: { lon: -71.8, lat: -12.9, productores: 109600, etiqueta: 'der' },
  Huancavelica: { lon: -75.4, lat: -12.7, productores: 63400, etiqueta: 'izq' },
  Huánuco: { lon: -76.2, lat: -9.9, productores: 85700, etiqueta: 'der' },
  Junín: { lon: -75.3, lat: -11.4, productores: 97200, etiqueta: 'der' },
  'La Libertad': { lon: -78.5, lat: -8.9, productores: 86900, etiqueta: 'izq' },
  Lambayeque: { lon: -80.1, lat: -6.6, productores: 41500, etiqueta: 'izq' },
  Piura: { lon: -80.4, lat: -5.0, productores: 92400, etiqueta: 'izq' },
  Puno: { lon: -70.1, lat: -15.4, productores: 164800, etiqueta: 'der' },
  'San Martín': { lon: -76.6, lat: -7.2, productores: 74300, etiqueta: 'der' },
  Ucayali: { lon: -74.5, lat: -8.6, productores: 21900, etiqueta: 'der' },
}

export const LISTA_REGIONES = Object.keys(REGIONES).sort((a, b) => a.localeCompare(b, 'es'))

export const CULTIVOS = ['Papa', 'Cacao', 'Café', 'Arroz', 'Maíz', 'Quinua', 'Palta', 'Cítricos']

/** Diagnósticos posibles por cultivo, para "corregir diagnóstico" y "nueva alerta" */
export const CATALOGO: Record<string, { problema: string; agente: string }[]> = {
  Papa: [
    { problema: 'Rancha (tizón tardío)', agente: 'Phytophthora infestans' },
    { problema: 'Gorgojo de los Andes', agente: 'Premnotrypes spp.' },
    { problema: 'Polilla de la papa', agente: 'Phthorimaea operculella' },
    { problema: 'Alternariosis (tizón temprano)', agente: 'Alternaria solani' },
  ],
  Cacao: [
    { problema: 'Moniliasis', agente: 'Moniliophthora roreri' },
    { problema: 'Escoba de bruja', agente: 'Moniliophthora perniciosa' },
    { problema: 'Mazorca negra', agente: 'Phytophthora palmivora' },
  ],
  Café: [
    { problema: 'Roya amarilla', agente: 'Hemileia vastatrix' },
    { problema: 'Broca del café', agente: 'Hypothenemus hampei' },
    { problema: 'Ojo de gallo', agente: 'Mycena citricolor' },
  ],
  Arroz: [
    { problema: 'Piricularia (quemado del arroz)', agente: 'Pyricularia oryzae' },
    { problema: 'Sogata', agente: 'Tagosodes orizicolus' },
    { problema: 'Manchado de grano', agente: 'Complejo de hongos' },
  ],
  Maíz: [
    { problema: 'Gusano cogollero', agente: 'Spodoptera frugiperda' },
    { problema: 'Mancha de asfalto', agente: 'Phyllachora maydis' },
    { problema: 'Roya común', agente: 'Puccinia sorghi' },
  ],
  Quinua: [
    { problema: 'Mildiu', agente: 'Peronospora variabilis' },
    { problema: 'Polilla de la quinua', agente: 'Eurysacca melanocampta' },
  ],
  Palta: [
    { problema: 'Tristeza del palto', agente: 'Phytophthora cinnamomi' },
    { problema: 'Queresa', agente: 'Fiorinia fioriniae' },
  ],
  Cítricos: [
    { problema: 'Fumagina asociada a mosca blanca', agente: 'Capnodium spp.' },
    { problema: 'Huanglongbing (HLB)', agente: 'Candidatus Liberibacter spp.' },
    { problema: 'Mosca de la fruta', agente: 'Ceratitis capitata' },
  ],
}

// ---------- Utilidades de fecha ----------

const haceHoras = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

// ---------- Casos ----------

type CasoBase = Omit<Caso, 'historial' | 'fecha'> & { horas: number; extra?: EventoHistorial[] }

function armar(c: CasoBase): Caso {
  const { horas, extra = [], ...resto } = c
  const historial: EventoHistorial[] = [
    {
      fecha: haceHoras(horas),
      autor: c.productor,
      rol: 'productor',
      texto: `Envió foto por WhatsApp: "${c.sintomasReportados}"`,
    },
    {
      fecha: haceHoras(horas - 0.02),
      autor: 'AGROFUTURO IA',
      rol: 'ia',
      texto: `Prediagnóstico: ${c.prediagnostico.problema} (confianza ${c.prediagnostico.confianza} %). Recomendaciones enviadas al productor.`,
    },
    {
      fecha: haceHoras(horas - 1.5),
      autor: c.tecnico,
      rol: 'tecnico',
      texto: `Derivó el caso a SENASA. ${c.notaTecnico}`,
    },
    ...extra,
  ]
  return { ...resto, fecha: haceHoras(horas), historial }
}

export function casosIniciales(): Caso[] {
  return [
    armar({
      id: 'SV-2026-04817',
      horas: 3,
      productor: 'Hilario Mamani Condori',
      telefono: '+51 951 *** 214',
      region: 'Puno',
      provincia: 'Chucuito',
      distrito: 'Juli',
      altitud: '3 870 m s. n. m.',
      superficie: '0,8 ha',
      cultivo: 'Quinua',
      variedad: 'Salcedo INIA',
      foto: 'quinua_mildiu',
      sintomasReportados: 'Las hojas tienen manchas amarillas y por debajo un polvo plomo',
      prediagnostico: {
        problema: 'Mildiu',
        agente: 'Peronospora variabilis',
        confianza: 88,
        sintomas: ['Manchas cloróticas irregulares en el haz', 'Esporulación gris en el envés', 'Defoliación inicial'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Téc. Rubén Apaza',
      agencia: 'Agencia Agraria Chucuito',
      notaTecnico: 'Lluvias continuas en la zona. Hay 6 reportes parecidos en Juli esta semana.',
      estado: 'por_revisar',
    }),
    armar({
      id: 'SV-2026-04812',
      horas: 5,
      productor: 'Asociación de cacaoteros del Huallaga',
      telefono: '+51 942 *** 087',
      region: 'San Martín',
      provincia: 'Mariscal Cáceres',
      distrito: 'Juanjuí',
      altitud: '280 m s. n. m.',
      superficie: '3,5 ha',
      cultivo: 'Cacao',
      variedad: 'CCN-51',
      foto: 'cacao_monilia',
      sintomasReportados: 'Las mazorcas se manchan de marrón y salen con polvo blanco',
      prediagnostico: {
        problema: 'Moniliasis',
        agente: 'Moniliophthora roreri',
        confianza: 91,
        sintomas: ['Manchas necróticas en mazorca', 'Micelio blanco-crema', 'Deformación de frutos'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Ing. María Torres',
      agencia: 'Agencia Agraria Mariscal Cáceres',
      notaTecnico: 'Solicita confirmación por riesgo de brote: 40 % de mazorcas afectadas.',
      estado: 'por_revisar',
    }),
    armar({
      id: 'SV-2026-04809',
      horas: 7,
      productor: 'Elmer Huamán Ríos',
      telefono: '+51 976 *** 455',
      region: 'Piura',
      provincia: 'Sullana',
      distrito: 'Marcavelica',
      altitud: '60 m s. n. m.',
      superficie: '1,2 ha',
      cultivo: 'Cítricos',
      variedad: 'Limón sutil',
      foto: 'citrico_fumagina',
      sintomasReportados: 'Las hojas del limón están amarillas y algunas negras como hollín',
      prediagnostico: {
        problema: 'Huanglongbing (HLB)',
        agente: 'Candidatus Liberibacter spp.',
        confianza: 54,
        sintomas: ['Moteado asimétrico de hojas', 'Capa negra tipo hollín', 'Posible presencia de insecto vector'],
      },
      riesgo: 'alto',
      plagaRegulada: true,
      tecnico: 'Ing. Carlos Seminario',
      agencia: 'Agencia Agraria Sullana',
      notaTecnico: 'Baja confianza de la IA. Sospecha de plaga cuarentenaria: requiere evaluación oficial.',
      estado: 'por_revisar',
    }),
    armar({
      id: 'SV-2026-04801',
      horas: 11,
      productor: 'Rosa Ccanto Huamaní',
      telefono: '+51 964 *** 330',
      region: 'Huancavelica',
      provincia: 'Huancavelica',
      distrito: 'Acoria',
      altitud: '3 200 m s. n. m.',
      superficie: '0,5 ha',
      cultivo: 'Papa',
      variedad: 'Yungay',
      foto: 'papa_rancha',
      sintomasReportados: 'Mi papa tiene manchas oscuras en las hojas',
      prediagnostico: {
        problema: 'Rancha (tizón tardío)',
        agente: 'Phytophthora infestans',
        confianza: 92,
        sintomas: ['Lesiones necróticas con halo clorótico', 'Avance desde el borde de la hoja', 'Ambiente húmedo'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Ing. Luis Quispe',
      agencia: 'Agencia Agraria Huancavelica',
      notaTecnico: 'Validé las recomendaciones. Derivo para registro en la vigilancia regional.',
      estado: 'en_revision',
      asignadoA: USUARIO.nombre,
      extra: [
        { fecha: haceHoras(2), autor: USUARIO.nombre, rol: 'senasa', texto: 'Tomó el caso para revisión.' },
      ],
    }),
    armar({
      id: 'SV-2026-04796',
      horas: 20,
      productor: 'Teodoro Ramos Inga',
      telefono: '+51 954 *** 712',
      region: 'Junín',
      provincia: 'Chanchamayo',
      distrito: 'Perené',
      altitud: '1 150 m s. n. m.',
      superficie: '2,0 ha',
      cultivo: 'Café',
      variedad: 'Catimor',
      foto: 'cafe_roya',
      sintomasReportados: 'Polvo anaranjado debajo de las hojas del café',
      prediagnostico: {
        problema: 'Roya amarilla',
        agente: 'Hemileia vastatrix',
        confianza: 95,
        sintomas: ['Pústulas anaranjadas en el envés', 'Manchas cloróticas en el haz', 'Caída de hojas'],
      },
      riesgo: 'medio',
      plagaRegulada: false,
      tecnico: 'Ing. Pilar Ccori',
      agencia: 'Agencia Agraria Chanchamayo',
      notaTecnico: 'Incidencia aproximada de 15 %.',
      estado: 'por_revisar',
    }),
    armar({
      id: 'SV-2026-04790',
      horas: 26,
      productor: 'Juana Chávez Sánchez',
      telefono: '+51 979 *** 108',
      region: 'Lambayeque',
      provincia: 'Ferreñafe',
      distrito: 'Pítipo',
      altitud: '120 m s. n. m.',
      superficie: '4,0 ha',
      cultivo: 'Arroz',
      variedad: 'IR-43',
      foto: 'arroz_pyricularia',
      sintomasReportados: 'Manchas en forma de rombo en las hojas del arroz',
      prediagnostico: {
        problema: 'Piricularia (quemado del arroz)',
        agente: 'Pyricularia oryzae',
        confianza: 84,
        sintomas: ['Lesiones romboidales con centro gris', 'Borde marrón', 'Afecta hojas jóvenes'],
      },
      riesgo: 'medio',
      plagaRegulada: false,
      tecnico: 'Ing. Víctor Llontop',
      agencia: 'Agencia Agraria Ferreñafe',
      notaTecnico: 'Campaña grande en el valle. Conviene confirmar para alertar.',
      estado: 'inspeccion',
      asignadoA: 'Ing. Jorge Salas',
      extra: [
        { fecha: haceHoras(18), autor: 'Ing. Jorge Salas', rol: 'senasa', texto: 'Tomó el caso para revisión.' },
        {
          fecha: haceHoras(17),
          autor: 'Ing. Jorge Salas',
          rol: 'senasa',
          texto: 'Solicitó inspección en campo y toma de muestra para laboratorio.',
        },
      ],
    }),
    armar({
      id: 'SV-2026-04784',
      horas: 30,
      productor: 'Felícitas Quispe Huillca',
      telefono: '+51 984 *** 563',
      region: 'Cusco',
      provincia: 'Calca',
      distrito: 'Lamay',
      altitud: '2 950 m s. n. m.',
      superficie: '0,6 ha',
      cultivo: 'Maíz',
      variedad: 'Blanco Urubamba',
      foto: 'maiz_cogollero',
      sintomasReportados: 'Hojas comidas y con huecos en el cogollo',
      prediagnostico: {
        problema: 'Gusano cogollero',
        agente: 'Spodoptera frugiperda',
        confianza: 90,
        sintomas: ['Perforaciones irregulares', 'Excremento en el cogollo', 'Daño en hojas jóvenes'],
      },
      riesgo: 'medio',
      plagaRegulada: false,
      tecnico: 'Téc. Wilber Ccahuana',
      agencia: 'Agencia Agraria Calca',
      notaTecnico: 'Daño en 20 % de plantas.',
      estado: 'seguimiento',
      asignadoA: USUARIO.nombre,
      dictamen: {
        tipo: 'confirmado',
        problema: 'Gusano cogollero',
        agente: 'Spodoptera frugiperda',
        nota: 'Se confirma. Recomendar control etológico y biológico antes de químicos.',
        fecha: haceHoras(22),
        autor: USUARIO.nombre,
      },
      extra: [
        { fecha: haceHoras(23), autor: USUARIO.nombre, rol: 'senasa', texto: 'Tomó el caso para revisión.' },
        {
          fecha: haceHoras(22),
          autor: USUARIO.nombre,
          rol: 'senasa',
          texto: 'Confirmó el diagnóstico: Gusano cogollero. Se recomienda control etológico y biológico.',
        },
        { fecha: haceHoras(22), autor: 'Sistema', rol: 'sistema', texto: 'Se notificó al productor y al técnico por WhatsApp.' },
      ],
    }),
    armar({
      id: 'SV-2026-04779',
      horas: 38,
      productor: 'Nilo Paredes Vela',
      telefono: '+51 961 *** 274',
      region: 'Ucayali',
      provincia: 'Padre Abad',
      distrito: 'Irazola',
      altitud: '230 m s. n. m.',
      superficie: '2,5 ha',
      cultivo: 'Cacao',
      variedad: 'Nativo',
      foto: 'cacao_monilia',
      sintomasReportados: 'Mazorcas negras y podridas',
      prediagnostico: {
        problema: 'Moniliasis',
        agente: 'Moniliophthora roreri',
        confianza: 71,
        sintomas: ['Manchas oscuras en mazorca', 'Posible esporulación'],
      },
      riesgo: 'medio',
      plagaRegulada: false,
      tecnico: 'Ing. Kelly Panduro',
      agencia: 'Agencia Agraria Padre Abad',
      notaTecnico: 'La foto no es muy clara. Podría ser mazorca negra.',
      estado: 'seguimiento',
      asignadoA: 'Ing. Jorge Salas',
      dictamen: {
        tipo: 'corregido',
        problema: 'Mazorca negra',
        agente: 'Phytophthora palmivora',
        nota: 'Pudrición firme, sin micelio blanco. Corresponde a mazorca negra.',
        fecha: haceHoras(30),
        autor: 'Ing. Jorge Salas',
      },
      extra: [
        {
          fecha: haceHoras(30),
          autor: 'Ing. Jorge Salas',
          rol: 'senasa',
          texto: 'Corrigió el diagnóstico de la IA: Mazorca negra (Phytophthora palmivora).',
        },
        { fecha: haceHoras(30), autor: 'Sistema', rol: 'sistema', texto: 'Se notificó al productor y al técnico por WhatsApp.' },
      ],
    }),
    armar({
      id: 'SV-2026-04772',
      horas: 44,
      productor: 'Delia Rojas Ataucusi',
      telefono: '+51 966 *** 901',
      region: 'Ayacucho',
      provincia: 'Huamanga',
      distrito: 'Tambillo',
      altitud: '3 050 m s. n. m.',
      superficie: '0,4 ha',
      cultivo: 'Papa',
      variedad: 'Canchán',
      foto: 'papa_rancha',
      sintomasReportados: 'Manchas en las hojas de abajo',
      prediagnostico: {
        problema: 'Alternariosis (tizón temprano)',
        agente: 'Alternaria solani',
        confianza: 77,
        sintomas: ['Manchas con anillos concéntricos', 'Hojas basales afectadas'],
      },
      riesgo: 'bajo',
      plagaRegulada: false,
      tecnico: 'Téc. Edwin Gamboa',
      agencia: 'Agencia Agraria Huamanga',
      notaTecnico: 'Pocas plantas afectadas.',
      estado: 'por_revisar',
    }),
    armar({
      id: 'SV-2026-04765',
      horas: 52,
      productor: 'Marcos Silva Tello',
      telefono: '+51 948 *** 336',
      region: 'Amazonas',
      provincia: 'Utcubamba',
      distrito: 'Bagua Grande',
      altitud: '440 m s. n. m.',
      superficie: '3,0 ha',
      cultivo: 'Arroz',
      variedad: 'Capoteña',
      foto: 'arroz_pyricularia',
      sintomasReportados: 'El arroz se está quemando en las hojas',
      prediagnostico: {
        problema: 'Piricularia (quemado del arroz)',
        agente: 'Pyricularia oryzae',
        confianza: 86,
        sintomas: ['Lesiones romboidales', 'Centro gris y borde marrón'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Ing. Rocío Mego',
      agencia: 'Agencia Agraria Utcubamba',
      notaTecnico: 'Afecta varias parcelas vecinas.',
      estado: 'por_revisar',
    }),
    armar({
      id: 'SV-2026-04758',
      horas: 60,
      productor: 'Saturnino Cruz Ayala',
      telefono: '+51 973 *** 640',
      region: 'Cajamarca',
      provincia: 'Jaén',
      distrito: 'Huabal',
      altitud: '1 600 m s. n. m.',
      superficie: '1,5 ha',
      cultivo: 'Café',
      variedad: 'Caturra',
      foto: 'cafe_roya',
      sintomasReportados: 'Hojas con polvillo naranja',
      prediagnostico: {
        problema: 'Roya amarilla',
        agente: 'Hemileia vastatrix',
        confianza: 93,
        sintomas: ['Pústulas anaranjadas', 'Defoliación'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Ing. Noemí Vásquez',
      agencia: 'Agencia Agraria Jaén',
      notaTecnico: 'Incidencia de 35 % en la parcela.',
      estado: 'seguimiento',
      asignadoA: USUARIO.nombre,
      dictamen: {
        tipo: 'confirmado',
        problema: 'Roya amarilla',
        agente: 'Hemileia vastatrix',
        nota: 'Se confirma. Se emitió alerta para Jaén y San Ignacio.',
        fecha: haceHoras(50),
        autor: USUARIO.nombre,
      },
      extra: [
        {
          fecha: haceHoras(50),
          autor: USUARIO.nombre,
          rol: 'senasa',
          texto: 'Confirmó el diagnóstico: Roya amarilla.',
        },
        { fecha: haceHoras(49), autor: USUARIO.nombre, rol: 'senasa', texto: 'Emitió la alerta AL-2026-118.' },
      ],
    }),
    armar({
      id: 'SV-2026-04750',
      horas: 70,
      productor: 'Gloria Espinoza Lázaro',
      telefono: '+51 962 *** 489',
      region: 'Huánuco',
      provincia: 'Ambo',
      distrito: 'Tomay Kichwa',
      altitud: '2 100 m s. n. m.',
      superficie: '1,0 ha',
      cultivo: 'Palta',
      variedad: 'Hass',
      foto: 'palta_fitoftora',
      sintomasReportados: 'El palto se está secando de arriba y las hojas están chiquitas',
      prediagnostico: {
        problema: 'Tristeza del palto',
        agente: 'Phytophthora cinnamomi',
        confianza: 68,
        sintomas: ['Hojas pequeñas y cloróticas', 'Muerte descendente de ramas'],
      },
      riesgo: 'medio',
      plagaRegulada: false,
      tecnico: 'Ing. Abel Tucto',
      agencia: 'Agencia Agraria Ambo',
      notaTecnico: 'Suelo con mal drenaje.',
      estado: 'descartado',
      asignadoA: 'Ing. Jorge Salas',
      dictamen: {
        tipo: 'descartado',
        problema: 'Estrés hídrico por mal drenaje',
        agente: '—',
        nota: 'No se observan síntomas en raíz. Problema de manejo del riego; atención por la Agencia Agraria.',
        fecha: haceHoras(60),
        autor: 'Ing. Jorge Salas',
      },
      extra: [
        {
          fecha: haceHoras(60),
          autor: 'Ing. Jorge Salas',
          rol: 'senasa',
          texto: 'Descartó plaga o enfermedad de importancia. Devuelto a la Agencia Agraria.',
        },
      ],
    }),
    armar({
      id: 'SV-2026-04744',
      horas: 80,
      productor: 'Comunidad campesina de Pomacanchi',
      telefono: '+51 984 *** 772',
      region: 'Cusco',
      provincia: 'Acomayo',
      distrito: 'Pomacanchi',
      altitud: '3 690 m s. n. m.',
      superficie: '2,0 ha',
      cultivo: 'Papa',
      variedad: 'Nativas',
      foto: 'papa_rancha',
      sintomasReportados: 'Hay gusanos dentro de la papa',
      prediagnostico: {
        problema: 'Gorgojo de los Andes',
        agente: 'Premnotrypes spp.',
        confianza: 82,
        sintomas: ['Galerías en tubérculos', 'Larvas blancas curvadas'],
      },
      riesgo: 'medio',
      plagaRegulada: false,
      tecnico: 'Téc. Wilber Ccahuana',
      agencia: 'Agencia Agraria Acomayo',
      notaTecnico: 'Pérdidas en almacén.',
      estado: 'en_revision',
      asignadoA: 'Ing. Jorge Salas',
      extra: [{ fecha: haceHoras(70), autor: 'Ing. Jorge Salas', rol: 'senasa', texto: 'Tomó el caso para revisión.' }],
    }),
    armar({
      id: 'SV-2026-04737',
      horas: 200,
      productor: 'Victoriano Lupaca Mamani',
      telefono: '+51 951 *** 018',
      region: 'Puno',
      provincia: 'El Collao',
      distrito: 'Ilave',
      altitud: '3 850 m s. n. m.',
      superficie: '1,0 ha',
      cultivo: 'Quinua',
      variedad: 'Blanca de Juli',
      foto: 'quinua_mildiu',
      sintomasReportados: 'Hojas amarillas con polvo',
      prediagnostico: {
        problema: 'Mildiu',
        agente: 'Peronospora variabilis',
        confianza: 90,
        sintomas: ['Manchas cloróticas', 'Esporulación gris en el envés'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Téc. Rubén Apaza',
      agencia: 'Agencia Agraria El Collao',
      notaTecnico: 'Mismo patrón que en Juli.',
      estado: 'seguimiento',
      asignadoA: USUARIO.nombre,
      dictamen: {
        tipo: 'confirmado',
        problema: 'Mildiu',
        agente: 'Peronospora variabilis',
        nota: 'Se confirma. Vigilar zona circunlacustre.',
        fecha: haceHoras(190),
        autor: USUARIO.nombre,
      },
      extra: [
        { fecha: haceHoras(190), autor: USUARIO.nombre, rol: 'senasa', texto: 'Confirmó el diagnóstico: Mildiu.' },
        { fecha: haceHoras(190), autor: 'Sistema', rol: 'sistema', texto: 'Se notificó al productor y al técnico por WhatsApp.' },
        { fecha: haceHoras(20), autor: 'Victoriano Lupaca Mamani', rol: 'productor', texto: 'Envió la foto de seguimiento (día 7).' },
        { fecha: haceHoras(19.9), autor: 'AGROFUTURO IA', rol: 'ia', texto: 'Comparación con la foto inicial: las manchas no avanzan y los brotes nuevos están sanos.' },
        { fecha: haceHoras(16), autor: 'Téc. Rubén Apaza', rol: 'tecnico', texto: 'Visitó la parcela y verificó la mejora.' },
      ],
      seguimiento: {
        fecha: haceHoras(20),
        mejoro: true,
        nota: 'Las manchas no avanzan y los brotes nuevos están sanos. El técnico verificó la mejora en campo.',
      },
    }),
    armar({
      id: 'SV-2026-04729',
      horas: 260,
      productor: 'Rosendo Alvarado Cruz',
      telefono: '+51 949 *** 255',
      region: 'La Libertad',
      provincia: 'Sánchez Carrión',
      distrito: 'Huamachuco',
      altitud: '3 170 m s. n. m.',
      superficie: '0,7 ha',
      cultivo: 'Maíz',
      variedad: 'Amiláceo',
      foto: 'maiz_cogollero',
      sintomasReportados: 'El maíz tiene las hojas agujereadas',
      prediagnostico: {
        problema: 'Gusano cogollero',
        agente: 'Spodoptera frugiperda',
        confianza: 87,
        sintomas: ['Perforaciones', 'Excremento en cogollo'],
      },
      riesgo: 'bajo',
      plagaRegulada: false,
      tecnico: 'Ing. Milagros Reyes',
      agencia: 'Agencia Agraria Sánchez Carrión',
      notaTecnico: 'Daño leve.',
      estado: 'cerrado',
      asignadoA: 'Ing. Jorge Salas',
      dictamen: {
        tipo: 'confirmado',
        problema: 'Gusano cogollero',
        agente: 'Spodoptera frugiperda',
        nota: 'Daño leve; manejo por la Agencia Agraria.',
        fecha: haceHoras(250),
        autor: 'Ing. Jorge Salas',
      },
      extra: [
        { fecha: haceHoras(250), autor: 'Ing. Jorge Salas', rol: 'senasa', texto: 'Confirmó el diagnóstico.' },
        { fecha: haceHoras(250), autor: 'Sistema', rol: 'sistema', texto: 'Se notificó al productor y al técnico por WhatsApp.' },
        { fecha: haceHoras(80), autor: 'Rosendo Alvarado Cruz', rol: 'productor', texto: 'Envió la foto de seguimiento (día 7).' },
        { fecha: haceHoras(79.9), autor: 'AGROFUTURO IA', rol: 'ia', texto: 'Comparación con la foto inicial: no hay daño nuevo en el cogollo.' },
        { fecha: haceHoras(60), autor: 'Ing. Jorge Salas', rol: 'senasa', texto: 'Cerró el caso: el cultivo mejoró.' },
      ],
      seguimiento: {
        fecha: haceHoras(80),
        mejoro: true,
        nota: 'No hay daño nuevo en el cogollo.',
      },
    }),
    armar({
      id: 'SV-2026-04720',
      horas: 130,
      productor: 'Isabel Huarcaya Pillaca',
      telefono: '+51 983 *** 604',
      region: 'Apurímac',
      provincia: 'Andahuaylas',
      distrito: 'San Jerónimo',
      altitud: '2 950 m s. n. m.',
      superficie: '0,5 ha',
      cultivo: 'Papa',
      variedad: 'Única',
      foto: 'papa_rancha',
      sintomasReportados: 'Manchas negras en las hojas después de la lluvia',
      prediagnostico: {
        problema: 'Rancha (tizón tardío)',
        agente: 'Phytophthora infestans',
        confianza: 89,
        sintomas: ['Lesiones necróticas', 'Halo clorótico'],
      },
      riesgo: 'alto',
      plagaRegulada: false,
      tecnico: 'Ing. Saúl Palomino',
      agencia: 'Agencia Agraria Andahuaylas',
      notaTecnico: 'Varias chacras con el mismo síntoma.',
      estado: 'por_revisar',
    }),
  ]
}

// ---------- Alertas ----------

export function alertasIniciales(): Alerta[] {
  return [
    {
      id: 'AL-2026-118',
      fecha: haceHoras(49),
      titulo: 'Roya amarilla en café — Jaén',
      problema: 'Roya amarilla',
      cultivo: 'Café',
      regiones: ['Cajamarca'],
      nivel: 'alto',
      mensaje:
        '⚠️ Alerta SENASA: se confirmó roya amarilla en cafetales de Jaén. Revise el envés de las hojas. Si ve polvo anaranjado, avise a su técnico.',
      estado: 'activa',
      emitidaPor: USUARIO.nombre,
      casoOrigen: 'SV-2026-04758',
      productoresAlcanzados: 12_640,
    },
    {
      id: 'AL-2026-115',
      fecha: haceHoras(88),
      titulo: 'Mildiu en quinua — zona circunlacustre',
      problema: 'Mildiu',
      cultivo: 'Quinua',
      regiones: ['Puno'],
      nivel: 'alto',
      mensaje:
        '⚠️ Alerta SENASA: hay mildiu en quinua alrededor del lago. Revise sus plantas después de las lluvias y envíe una foto si ve manchas amarillas.',
      estado: 'activa',
      emitidaPor: USUARIO.nombre,
      casoOrigen: 'SV-2026-04737',
      productoresAlcanzados: 21_310,
    },
    {
      id: 'AL-2026-109',
      fecha: haceHoras(160),
      titulo: 'Heladas y rancha en papa — sierra central',
      problema: 'Rancha (tizón tardío)',
      cultivo: 'Papa',
      regiones: ['Junín', 'Huancavelica', 'Ayacucho'],
      nivel: 'medio',
      mensaje:
        '⚠️ Alerta SENASA: condiciones favorables para rancha en papa. Evite el riego por aspersión y retire las hojas con manchas.',
      estado: 'activa',
      emitidaPor: 'Ing. Jorge Salas',
      productoresAlcanzados: 38_920,
    },
    {
      id: 'AL-2026-097',
      fecha: haceHoras(400),
      titulo: 'Mosca de la fruta en cítricos — Piura',
      problema: 'Mosca de la fruta',
      cultivo: 'Cítricos',
      regiones: ['Piura'],
      nivel: 'medio',
      mensaje: '⚠️ Alerta SENASA: recoja y entierre la fruta caída para cortar el ciclo de la mosca de la fruta.',
      estado: 'cerrada',
      emitidaPor: 'Ing. Jorge Salas',
      productoresAlcanzados: 9_880,
    },
  ]
}

/** Estimación simulada de productores a los que llega una alerta */
export function estimarAlcance(regiones: string[], cultivo: string): number {
  const factor: Record<string, number> = {
    Papa: 0.42,
    Quinua: 0.18,
    Café: 0.2,
    Cacao: 0.17,
    Arroz: 0.12,
    Maíz: 0.3,
    Palta: 0.07,
    Cítricos: 0.08,
  }
  const total = regiones.reduce((s, r) => s + (REGIONES[r]?.productores ?? 0), 0)
  return Math.round(total * (factor[cultivo] ?? 0.1))
}
