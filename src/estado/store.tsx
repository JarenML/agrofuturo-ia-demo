import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import {
  USUARIO,
  alertasIniciales,
  casosIniciales,
  type Alerta,
  type Caso,
  type EventoHistorial,
} from '../data/casos'

/**
 * Estado del prototipo. Vive en el navegador (localStorage) para que las
 * decisiones del especialista se mantengan al recargar. No hay backend.
 */

const CLAVE = 'agrofuturo-senasa-v2'

interface Estado {
  casos: Caso[]
  alertas: Alerta[]
}

type Accion =
  | { tipo: 'tomar'; id: string }
  | { tipo: 'confirmar'; id: string; nota: string }
  | { tipo: 'corregir'; id: string; problema: string; agente: string; nota: string }
  | { tipo: 'inspeccion'; id: string; nota: string }
  | { tipo: 'descartar'; id: string; nota: string }
  | { tipo: 'registrarSeguimiento'; id: string; mejoro: boolean }
  | { tipo: 'cerrar'; id: string; nota: string }
  | { tipo: 'reabrir'; id: string; nota: string }
  | { tipo: 'comentar'; id: string; texto: string }
  | { tipo: 'emitirAlerta'; alerta: Alerta }
  | { tipo: 'cerrarAlerta'; id: string }
  | { tipo: 'restablecer' }

const ahora = () => new Date().toISOString()

const evento = (texto: string, rol: EventoHistorial['rol'] = 'senasa', autor = USUARIO.nombre): EventoHistorial => ({
  fecha: ahora(),
  autor,
  rol,
  texto,
})

const notificar = evento('Se notificó al productor y al técnico por WhatsApp.', 'sistema', 'Sistema')

function actualizar(estado: Estado, id: string, f: (c: Caso) => Caso): Estado {
  return { ...estado, casos: estado.casos.map((c) => (c.id === id ? f(c) : c)) }
}

function reducer(estado: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'tomar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'en_revision',
        asignadoA: USUARIO.nombre,
        historial: [...c.historial, evento('Tomó el caso para revisión.')],
      }))
    case 'confirmar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'seguimiento',
        asignadoA: c.asignadoA ?? USUARIO.nombre,
        dictamen: {
          tipo: 'confirmado',
          problema: c.prediagnostico.problema,
          agente: c.prediagnostico.agente,
          nota: a.nota,
          fecha: ahora(),
          autor: USUARIO.nombre,
        },
        historial: [
          ...c.historial,
          evento(`Confirmó el diagnóstico: ${c.prediagnostico.problema}.${a.nota ? ' ' + a.nota : ''}`),
          { ...notificar, fecha: ahora() },
          evento('Seguimiento programado: el productor enviará una nueva foto en 7 días.', 'sistema', 'Sistema'),
        ],
      }))
    case 'corregir':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'seguimiento',
        asignadoA: c.asignadoA ?? USUARIO.nombre,
        dictamen: {
          tipo: 'corregido',
          problema: a.problema,
          agente: a.agente,
          nota: a.nota,
          fecha: ahora(),
          autor: USUARIO.nombre,
        },
        historial: [
          ...c.historial,
          evento(`Corrigió el diagnóstico de la IA: ${a.problema} (${a.agente}).${a.nota ? ' ' + a.nota : ''}`),
          { ...notificar, fecha: ahora() },
          evento('Seguimiento programado: el productor enviará una nueva foto en 7 días.', 'sistema', 'Sistema'),
        ],
      }))
    case 'inspeccion':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'inspeccion',
        asignadoA: c.asignadoA ?? USUARIO.nombre,
        historial: [
          ...c.historial,
          evento(`Solicitó inspección en campo y toma de muestra para laboratorio.${a.nota ? ' ' + a.nota : ''}`),
        ],
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
          evento(`Descartó plaga o enfermedad de importancia. Devuelto a la Agencia Agraria.${a.nota ? ' ' + a.nota : ''}`),
        ],
      }))
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
          evento('Envió la foto de seguimiento (día 7).', 'productor', c.productor),
          evento(
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
        historial: [...c.historial, evento(`Cerró el caso: el cultivo mejoró.${a.nota ? ' ' + a.nota : ''}`)],
      }))
    case 'reabrir':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        estado: 'en_revision',
        seguimiento: undefined,
        historial: [...c.historial, evento(`Reabrió el caso para nueva evaluación.${a.nota ? ' ' + a.nota : ''}`)],
      }))
    case 'comentar':
      return actualizar(estado, a.id, (c) => ({
        ...c,
        historial: [...c.historial, evento(`Nota interna: ${a.texto}`)],
      }))
    case 'emitirAlerta': {
      const conAlerta = { ...estado, alertas: [a.alerta, ...estado.alertas] }
      const origen = a.alerta.casoOrigen
      if (!origen) return conAlerta
      return actualizar(conAlerta, origen, (c) => ({
        ...c,
        historial: [...c.historial, evento(`Emitió la alerta ${a.alerta.id}.`)],
      }))
    }
    case 'cerrarAlerta':
      return {
        ...estado,
        alertas: estado.alertas.map((al) => (al.id === a.id ? { ...al, estado: 'cerrada' } : al)),
      }
    case 'restablecer':
      return inicial()
  }
}

const inicial = (): Estado => ({ casos: casosIniciales(), alertas: alertasIniciales() })

function cargar(): Estado {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (crudo) {
      const e = JSON.parse(crudo) as Estado
      if (Array.isArray(e.casos) && Array.isArray(e.alertas)) return e
    }
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
}

const Contexto = createContext<Ctx | null>(null)

export function ProveedorEstado({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducer, undefined, cargar)
  const [avisos, setAvisos] = useState<Aviso[]>([])

  useEffect(() => {
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

  return <Contexto.Provider value={{ ...estado, despachar, avisar, avisos }}>{children}</Contexto.Provider>
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
