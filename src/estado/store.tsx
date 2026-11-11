import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import {
  TECNICO,
  USUARIO,
  alertasIniciales,
  casosIniciales,
  type Alerta,
  type Caso,
  type EventoHistorial,
} from '../data/casos'
import { diagnosticoVigente, type Rol } from '../ui/comun'

/**
 * Estado del prototipo. Vive en el navegador (localStorage) para que las
 * decisiones se mantengan al recargar. No hay backend.
 */

const CLAVE = 'agrofuturo-prototipo'

/**
 * Versión de los datos de ejemplo. Si cambia la forma de los datos, se sube este
 * número y los datos guardados de una versión anterior se reemplazan por los nuevos.
 */
const VERSION_DATOS = 4

interface Estado {
  version: number
  rol: Rol
  /** Ids de notificaciones ya leídas */
  leidas?: string[]
  casos: Caso[]
  alertas: Alerta[]
}

type Accion =
  | { tipo: 'cambiarRol'; rol: Rol }
  | { tipo: 'marcarLeidas'; ids: string[] }
  // Técnico agrario
  | {
      tipo: 'validarTecnico'
      id: string
      correccion?: { problema: string; agente: string }
      derivar: boolean
      nota: string
    }
  | { tipo: 'derivar'; id: string; nota: string }
  | { tipo: 'verificarCampo'; id: string; nota: string }
  // SENASA
  | { tipo: 'tomar'; id: string }
  | { tipo: 'confirmar'; id: string; nota: string }
  | { tipo: 'corregir'; id: string; problema: string; agente: string; nota: string }
  | { tipo: 'inspeccion'; id: string; nota: string }
  | { tipo: 'descartar'; id: string; nota: string }
  | { tipo: 'emitirAlerta'; alerta: Alerta }
  | { tipo: 'cerrarAlerta'; id: string }
  // Ambos
  | { tipo: 'registrarSeguimiento'; id: string; mejoro: boolean }
  | { tipo: 'cerrar'; id: string; nota: string }
  | { tipo: 'reabrir'; id: string; nota: string }
  | { tipo: 'comentar'; id: string; texto: string }
  | { tipo: 'restablecer' }

const ahora = () => new Date().toISOString()

function actualizar(estado: Estado, id: string, f: (c: Caso) => Caso): Estado {
  return { ...estado, casos: estado.casos.map((c) => (c.id === id ? f(c) : c)) }
}

const conNota = (texto: string, nota: string) => (nota ? `${texto} ${nota}` : texto)

function reducer(estado: Estado, a: Accion): Estado {
  // Quien actúa depende del rol activo
  const esTecnico = estado.rol === 'tecnico'
  const yo = esTecnico ? TECNICO.nombre : USUARIO.nombre
  const ev = (texto: string, rol: EventoHistorial['rol'] = esTecnico ? 'tecnico' : 'senasa', autor = yo): EventoHistorial => ({
    fecha: ahora(),
    autor,
    rol,
    texto,
  })
  const sistema = (texto: string) => ev(texto, 'sistema', 'Sistema')
  const seguimientoProgramado = () => sistema('Seguimiento programado: el productor enviará una nueva foto en 7 días.')

  switch (a.tipo) {
    case 'cambiarRol':
      return { ...estado, rol: a.rol }
    case 'marcarLeidas':
      return { ...estado, leidas: [...new Set([...(estado.leidas ?? []), ...a.ids])] }

    // ----- Técnico -----
    case 'validarTecnico':
      return actualizar(estado, a.id, (c) => {
        const corr = a.correccion
        const accion = corr
          ? `Corrigió el prediagnóstico de la IA: ${corr.problema} (${corr.agente}).`
          : `Validó el prediagnóstico: ${c.prediagnostico.problema}.`
        return {
          ...c,
          correccionTecnico: corr,
          notaTecnico: a.nota,
          estado: a.derivar ? 'por_revisar' : 'seguimiento',
          derivado: a.derivar,
          historial: [
            ...c.historial,
            ev(conNota(a.derivar ? `${accion} Derivó el caso a SENASA.` : accion, a.nota)),
            sistema('Se notificó al productor por WhatsApp: "Recomendación validada por el técnico de la Agencia Agraria."'),
            ...(a.derivar ? [] : [seguimientoProgramado()]),
          ],
        }
      })
    case 'derivar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'por_revisar',
        derivado: true,
        seguimiento: undefined,
        notaTecnico: a.nota || c.notaTecnico,
        historial: [...c.historial, ev(conNota('Derivó el caso a SENASA.', a.nota))],
      }))
    case 'verificarCampo':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        historial: [...c.historial, ev(conNota('Visitó la parcela y verificó la mejora en campo.', a.nota))],
      }))

    // ----- SENASA -----
    case 'tomar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'en_revision',
        asignadoA: USUARIO.nombre,
        historial: [...c.historial, ev('Tomó el caso para revisión.')],
      }))
    case 'confirmar':
      return actualizar(estado, a.id, (c) => {
        const d = diagnosticoVigente(c)
        return {
          ...c,
          estado: 'seguimiento',
          asignadoA: c.asignadoA ?? USUARIO.nombre,
          dictamen: { tipo: 'confirmado', ...d, nota: a.nota, fecha: ahora(), autor: USUARIO.nombre },
          historial: [
            ...c.historial,
            ev(conNota(`Confirmó el diagnóstico: ${d.problema}.`, a.nota)),
            sistema('Se notificó al productor y al técnico por WhatsApp.'),
            seguimientoProgramado(),
          ],
        }
      })
    case 'corregir':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'seguimiento',
        asignadoA: c.asignadoA ?? USUARIO.nombre,
        dictamen: { tipo: 'corregido', problema: a.problema, agente: a.agente, nota: a.nota, fecha: ahora(), autor: USUARIO.nombre },
        historial: [
          ...c.historial,
          ev(conNota(`Corrigió el diagnóstico: ${a.problema} (${a.agente}).`, a.nota)),
          sistema('Se notificó al productor y al técnico por WhatsApp.'),
          seguimientoProgramado(),
        ],
      }))
    case 'inspeccion':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'inspeccion',
        asignadoA: c.asignadoA ?? USUARIO.nombre,
        historial: [...c.historial, ev(conNota('Solicitó inspección en campo y toma de muestra para laboratorio.', a.nota))],
      }))
    case 'descartar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'descartado',
        asignadoA: c.asignadoA ?? USUARIO.nombre,
        dictamen: {
          tipo: 'descartado',
          problema: 'Sin plaga o enfermedad de importancia',
          agente: '—',
          nota: a.nota,
          fecha: ahora(),
          autor: USUARIO.nombre,
        },
        historial: [
          ...c.historial,
          ev(conNota('Descartó plaga o enfermedad de importancia. Devuelto a la Agencia Agraria.', a.nota)),
        ],
      }))
    case 'emitirAlerta': {
      const conAlerta = { ...estado, alertas: [a.alerta, ...estado.alertas] }
      const origen = a.alerta.casoOrigen
      if (!origen) return conAlerta
      return actualizar(conAlerta, origen, (c) => ({
        ...c,
        historial: [...c.historial, ev(`Emitió la alerta ${a.alerta.id}.`)],
      }))
    }
    case 'cerrarAlerta':
      return {
        ...estado,
        alertas: estado.alertas.map((al) => (al.id === a.id ? { ...al, estado: 'cerrada' } : al)),
      }

    // ----- Ambos roles -----
    case 'registrarSeguimiento':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        seguimiento: {
          fecha: ahora(),
          mejoro: a.mejoro,
          nota: a.mejoro
            ? 'Las lesiones no avanzan y los brotes nuevos están sanos.'
            : 'Las lesiones siguen avanzando respecto a la foto inicial.',
        },
        historial: [
          ...c.historial,
          ev('Envió la foto de seguimiento (día 7).', 'productor', c.productor),
          ev(
            a.mejoro
              ? 'Comparación con la foto inicial: el cultivo mejoró.'
              : 'Comparación con la foto inicial: el problema sigue avanzando.',
            'ia',
            'AGROFUTURO IA',
          ),
        ],
      }))
    case 'cerrar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'cerrado',
        historial: [...c.historial, ev(conNota('Cerró el caso: el cultivo mejoró.', a.nota))],
      }))
    case 'reabrir':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'en_revision',
        seguimiento: undefined,
        historial: [...c.historial, ev(conNota('Reabrió el caso para nueva evaluación.', a.nota))],
      }))
    case 'comentar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        historial: [...c.historial, ev(`Nota: ${a.texto}`)],
      }))
    case 'restablecer':
      return inicial(estado.rol === 'tecnico' ? 'tecnico' : 'senasa')
  }
}

const inicial = (rol: Rol = 'senasa'): Estado => ({
  version: VERSION_DATOS,
  rol,
  casos: casosIniciales(),
  alertas: alertasIniciales(),
})

/** Los datos son de la versión actual y tienen la forma esperada */
function esValido(e: Partial<Estado> | null | undefined): e is Estado {
  return (
    !!e &&
    e.version === VERSION_DATOS &&
    Array.isArray(e.casos) &&
    e.casos.length > 0 &&
    e.casos.every((c) => typeof c.derivado === 'boolean' && Array.isArray(c.historial)) &&
    Array.isArray(e.alertas)
  )
}

function cargar(): Estado {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (crudo) {
      const e = JSON.parse(crudo) as Estado
      if (esValido(e)) return { ...e, rol: e.rol === 'tecnico' ? 'tecnico' : 'senasa' }
    }
    // Limpiar datos de versiones anteriores del prototipo
    ;['agrofuturo-senasa-v1', 'agrofuturo-senasa-v2', 'agrofuturo-prototipo-v3'].forEach((k) => localStorage.removeItem(k))
  } catch {
    /* sin almacenamiento: se usan los datos de ejemplo */
  }
  return inicial()
}

// ---------- Contexto ----------

interface Aviso {
  id: number
  texto: string
}

interface Ctx extends Estado {
  despachar: (a: Accion) => void
  avisar: (texto: string) => void
  avisos: Aviso[]
  /** Casos que ve el rol activo */
  misCasos: Caso[]
  /** Usuario del rol activo */
  usuario: { nombre: string; nombreCorto: string; cargo: string; sede: string; iniciales: string }
}

const Contexto = createContext<Ctx | null>(null)

export function ProveedorEstado({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducer, undefined, cargar)
  const [avisos, setAvisos] = useState<Aviso[]>([])

  // Si el estado en memoria quedó de una versión anterior (por ejemplo, tras una
  // recarga en caliente durante el desarrollo), se reemplaza por los datos de ejemplo.
  const valido = esValido(estado)
  useEffect(() => {
    if (!valido) despachar({ tipo: 'restablecer' })
  }, [valido])

  useEffect(() => {
    if (!valido) return
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      /* ignorar */
    }
  }, [estado])

  const avisar = useCallback((texto: string) => {
    const id = Date.now() + Math.random()
    setAvisos((a) => [...a, { id, texto }])
    window.setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3500)
  }, [])

  const misCasos =
    estado.rol === 'senasa' ? estado.casos.filter((c) => c.derivado) : estado.casos.filter((c) => c.tecnico === TECNICO.nombre)
  const usuario = estado.rol === 'senasa' ? USUARIO : TECNICO

  return (
    <Contexto.Provider value={{ ...estado, despachar, avisar, avisos, misCasos, usuario }}>{children}</Contexto.Provider>
  )
}

export function useEstado() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useEstado fuera de ProveedorEstado')
  return c
}

/** Siguiente número de alerta */
export function nuevoIdAlerta(alertas: Alerta[]) {
  const max = alertas.reduce((m, a) => Math.max(m, Number(a.id.split('-')[2]) || 0), 0)
  return `AL-2026-${String(max + 1).padStart(3, '0')}`
}
