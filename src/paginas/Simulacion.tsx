import { useEffect, useRef, useState } from 'react'
import Celular, { type MensajeEnChat } from '../components/Celular'
import PanelAutoridad from '../components/PanelAutoridad'
import PanelTecnico from '../components/PanelTecnico'
import { CASO_ROSA, GUION, PASOS_ANALISIS, type ModuloId } from '../data/guion'

/** Duración de la animación "escribiendo…" del análisis (ms) */
const DURACION_ANALISIS = 3000
/** Alto aproximado del celular a escala 1 (marco + pie), para calcular el zoom */
const ALTO_CELULAR = 700
/** Alto ocupado por la barra superior + título de la diapositiva + márgenes */
const ALTO_RESERVADO = 64 + 40

type Vista = 'agricultor' | 'tecnico' | 'autoridad'

interface Diapositiva {
  /** Paso del guion que debe estar alcanzado en el chat */
  paso: number
  vista: Vista
  /** Si no se da, se usan el título y la nota del paso del guion */
  titulo?: string
  nota?: string
  /** Notificación que "llega" a quien protagoniza la diapositiva */
  aviso?: string
}

// El campo `paso` sube de a uno como máximo entre diapositivas consecutivas.
const DIAPOSITIVAS: Diapositiva[] = [
  { paso: 0, vista: 'agricultor' },
  { paso: 1, vista: 'agricultor' },
  { paso: 2, vista: 'agricultor' },
  {
    paso: 2,
    vista: 'tecnico',
    titulo: 'Al técnico le llega el caso',
    nota: 'En el mismo instante, la Agencia Agraria de la zona recibe el caso con la foto de Rosa.',
    aviso: `Nuevo caso de ${CASO_ROSA.agricultora} · ${CASO_ROSA.cultivo} · ${CASO_ROSA.region}`,
  },
  { paso: 3, vista: 'agricultor' },
  {
    paso: 3,
    vista: 'tecnico',
    titulo: 'El técnico ve cómo analizó la IA',
    nota: 'Los 4 pasos del análisis quedan registrados en el caso para que el técnico los revise.',
  },
  { paso: 4, vista: 'agricultor' },
  { paso: 5, vista: 'agricultor' },
  {
    paso: 5,
    vista: 'tecnico',
    titulo: 'El caso espera validación',
    nota: 'El técnico revisa la foto y el prediagnóstico. Puede validarlo o corregirlo.',
    aviso: 'Caso pendiente de validar · riesgo alto',
  },
  { paso: 6, vista: 'tecnico' },
  {
    paso: 6,
    vista: 'autoridad',
    titulo: 'SENASA se entera',
    nota: 'El caso validado entra al tablero nacional: Huancavelica aparece en rojo como foco de rancha.',
    aviso: `Alerta fitosanitaria · rancha validada en ${CASO_ROSA.region}`,
  },
  { paso: 7, vista: 'agricultor' },
  { paso: 8, vista: 'agricultor' },
  { paso: 9, vista: 'agricultor' },
  {
    paso: 9,
    vista: 'autoridad',
    titulo: 'El mapa nacional se actualiza',
    nota: 'Caso cerrado: el punto de Huancavelica pasa de rojo a verde en el tablero de SENASA.',
    aviso: `Caso cerrado en ${CASO_ROSA.region} · cultivo recuperado`,
  },
]

const QUIEN: Record<Vista, string> = {
  agricultor: 'Agricultora',
  tecnico: 'Técnico agrario',
  autoridad: 'SENASA',
}
/** Color de cada protagonista: etiqueta y punto de la línea de tiempo */
const COLOR: Record<Vista, { etiqueta: string; punto: string }> = {
  agricultor: { etiqueta: 'bg-campo-100 text-campo-800', punto: 'bg-campo-600' },
  tecnico: { etiqueta: 'bg-amber-100 text-amber-800', punto: 'bg-amber-500' },
  autoridad: { etiqueta: 'bg-sky-100 text-sky-800', punto: 'bg-sky-600' },
}

const mensajesDelPaso = (i: number): MensajeEnChat[] =>
  GUION[i].mensajes.map((mensaje) => ({ origen: 'guion', paso: i, mensaje }))

/** Ancho del celular a escala 1 */
const ANCHO_CELULAR = 380

/** Zoom del celular para que entre completo en el alto y el ancho disponibles */
function useZoom() {
  const calcular = () => {
    const w = window.innerWidth
    // móvil: flechas abajo (más alto reservado); escritorio: flechas a los lados y, desde xl, la barra de pasos
    const altoLibre = window.innerHeight - ALTO_RESERVADO - (w < 640 ? 64 : 0)
    const anchoLibre = w - (w < 640 ? 24 : 200) - (w >= 1280 ? 288 : 0)
    return Math.min(2, Math.max(0.5, Math.min(altoLibre / ALTO_CELULAR, anchoLibre / ANCHO_CELULAR)))
  }
  const [zoom, setZoom] = useState(calcular)
  useEffect(() => {
    const onResize = () => setZoom(calcular())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return zoom
}

export default function Simulacion() {
  const [d, setD] = useState(0)
  const [paso, setPaso] = useState(0)
  const [chat, setChat] = useState<MensajeEnChat[]>(() => mensajesDelPaso(0))
  const [escribiendo, setEscribiendo] = useState(false)
  const [pasosMarcados, setPasosMarcados] = useState(0)
  const timers = useRef<number[]>([])
  const zoom = useZoom()
  // ponytail: mismo factor que el celular, un poco menor porque los paneles son más altos/anchos
  const zoomPanel = Math.min(1.5, Math.max(0.5, zoom * 0.95))

  const limpiarTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => limpiarTimers, [])

  const diapo = DIAPOSITIVAS[d]
  const actual = GUION[paso]
  const esUltima = d === DIAPOSITIVAS.length - 1
  const ultimoDesvio = chat.reduce((acc, m) => (m.origen === 'desvio' ? m.indice : acc), -1)

  /** Avanza el guion un paso, con la animación de análisis si corresponde */
  const avanzarPaso = () => {
    const n = paso + 1
    setPaso(n)
    setChat((c) => [...c, ...mensajesDelPaso(n)])
    if (GUION[n].analisis) {
      setEscribiendo(true)
      setPasosMarcados(0)
      const intervalo = DURACION_ANALISIS / PASOS_ANALISIS.length
      PASOS_ANALISIS.forEach((_, i) => {
        timers.current.push(window.setTimeout(() => setPasosMarcados(i + 1), intervalo * (i + 0.6)))
      })
      timers.current.push(window.setTimeout(() => setEscribiendo(false), DURACION_ANALISIS))
    } else if (n > 3) {
      setPasosMarcados(PASOS_ANALISIS.length)
    }
  }

  /** Salta a una diapositiva reconstruyendo el chat desde el guion (sin animación) */
  const irA = (i: number) => {
    const n = DIAPOSITIVAS[i].paso
    limpiarTimers()
    setD(i)
    setPaso(n)
    setChat(GUION.slice(0, n + 1).flatMap((_, k) => mensajesDelPaso(k)))
    setEscribiendo(false)
    setPasosMarcados(n >= 3 ? PASOS_ANALISIS.length : 0)
  }

  const siguiente = () => {
    if (escribiendo || esUltima) return
    if (DIAPOSITIVAS[d + 1].paso !== paso) avanzarPaso()
    setD(d + 1)
  }

  const anterior = () => {
    if (d > 0) irA(d - 1)
  }

  const elegirModulo = (modulo: ModuloId) => {
    setChat((c) => [...c, { origen: 'desvio', indice: ultimoDesvio + 1, modulo, volvio: false }])
  }

  const volverMenu = () => {
    setChat((c) => c.map((m) => (m.origen === 'desvio' && m.indice === ultimoDesvio ? { ...m, volvio: true } : m)))
  }

  // Atajos para presentar: → / espacio = siguiente, ← = anterior, R = reiniciar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        siguiente()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        anterior()
      } else if (e.key === 'r' || e.key === 'R') {
        irA(0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const flecha = (activa: boolean) =>
    `flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg transition sm:h-14 sm:w-14 ${
      activa ? 'bg-white text-stone-800 hover:scale-105' : 'cursor-default bg-white/50 text-stone-300'
    }`

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] overflow-hidden bg-stone-200">
      {/* Fondo plomo difuminado */}
      <div aria-hidden className="pointer-events-none absolute inset-0 scale-110 opacity-40 blur-xl grayscale">
        <div className="mx-auto max-w-[1200px] p-10">
          <PanelTecnico estado={actual.estadoCaso} pasosMarcados={pasosMarcados} onValidar={() => {}} />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-stone-100/70 to-stone-200/80" />

      {/* Pasos, discretos a un costado */}
      <nav className="relative hidden w-72 shrink-0 flex-col py-6 pl-5 pr-3 xl:flex" aria-label="Pasos del recorrido">
        <div className="mb-4 px-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Recorrido</span>
            <span className="text-xs font-semibold tabular-nums text-stone-500">
              {d + 1} / {DIAPOSITIVAS.length}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-300/70">
            <div
              className="h-full rounded-full bg-campo-600 transition-[width] duration-500 ease-out"
              style={{ width: `${((d + 1) / DIAPOSITIVAS.length) * 100}%` }}
            />
          </div>
        </div>

        <ol className="chat-scroll -mr-2 flex-1 overflow-y-auto pr-2">
          {DIAPOSITIVAS.map((s, i) => {
            const hecho = i < d
            const actualmente = i === d
            return (
              <li key={i} className="relative pl-9">
                {/* Línea que une los nodos */}
                {i < DIAPOSITIVAS.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute left-2.75 top-6 h-full w-0.5 transition-colors duration-500 ${
                      hecho ? 'bg-campo-600' : 'bg-stone-300'
                    }`}
                  />
                )}
                {/* Nodo */}
                <span
                  aria-hidden
                  className={`absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-all duration-300 ${
                    hecho
                      ? 'bg-campo-600 text-white'
                      : actualmente
                        ? 'bg-white text-campo-700 ring-[3px] ring-campo-600'
                        : 'bg-stone-100 text-stone-400 ring-1 ring-stone-300'
                  }`}
                >
                  {hecho ? '✓' : i + 1}
                </span>

                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-current={actualmente ? 'step' : undefined}
                  className={`mb-1 w-full rounded-xl px-3 py-2 text-left transition-all duration-300 ${
                    actualmente ? 'bg-white shadow-md ring-1 ring-stone-200' : 'hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      actualmente || hecho ? COLOR[s.vista].etiqueta : 'bg-stone-200/70 text-stone-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${actualmente || hecho ? COLOR[s.vista].punto : 'bg-stone-400'}`} />
                    {QUIEN[s.vista]}
                  </span>
                  <span
                    className={`mt-1 block text-[13px] leading-snug ${
                      actualmente ? 'font-semibold text-stone-900' : hecho ? 'text-stone-600' : 'text-stone-400'
                    }`}
                  >
                    {s.titulo ?? GUION[s.paso].titulo}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Diapositiva */}
      <section className="relative flex min-w-0 flex-1 flex-col items-center px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center gap-3 sm:gap-6">
          <button type="button" onClick={anterior} disabled={d === 0} aria-label="Anterior (←)" className={`${flecha(d > 0)} max-sm:hidden`}>
            <Chevron izquierda />
          </button>

          <div key={diapo.vista} className="diapo relative flex max-h-full min-w-0 max-w-6xl flex-1 justify-center">
            {diapo.aviso && (
              <div
                key={d}
                className="aviso absolute -top-2 right-0 z-10 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-base shadow-2xl ring-4 ring-amber-300/70 sm:-right-4 sm:-top-10 sm:max-w-md sm:gap-4 sm:px-5 sm:py-4 sm:text-lg"
              >
                <span className="text-3xl">🔔</span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">Notificación</div>
                  <div className="font-semibold text-stone-900">{diapo.aviso}</div>
                </div>
              </div>
            )}

            {diapo.vista === 'agricultor' ? (
              <div style={{ zoom }}>
                <Celular
                  mensajes={chat}
                  pasoActual={paso}
                  escribiendo={escribiendo}
                  menuActivo={paso === 0}
                  ultimoDesvio={ultimoDesvio}
                  onSiguiente={siguiente}
                  onElegirModulo={elegirModulo}
                  onVolverMenu={volverMenu}
                />
              </div>
            ) : (
              <div className="chat-scroll max-h-full w-full overflow-y-auto rounded-2xl shadow-2xl" style={{ zoom: zoomPanel }}>
                {diapo.vista === 'tecnico' ? (
                  <PanelTecnico estado={actual.estadoCaso} pasosMarcados={pasosMarcados} onValidar={siguiente} />
                ) : (
                  <PanelAutoridad huancavelicaVerde={actual.puntoHuancavelica === 'verde'} rosaValidado={paso >= 6} />
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={siguiente}
            disabled={escribiendo || esUltima}
            aria-label="Siguiente (→)"
            className={`${flecha(!escribiendo && !esUltima)} max-sm:hidden`}
          >
            <Chevron />
          </button>
        </div>

        {/* Progreso compacto para pantallas sin barra lateral; en móvil, con las flechas a los lados */}
        <div className="mt-3 flex items-center gap-4 xl:hidden">
          <button type="button" onClick={anterior} disabled={d === 0} aria-label="Anterior" className={`${flecha(d > 0)} sm:hidden`}>
            <Chevron izquierda />
          </button>
          <div className="flex flex-wrap justify-center gap-1" aria-hidden>
            {DIAPOSITIVAS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full ${i === d ? 'w-6 bg-campo-600' : i < d ? 'w-1.5 bg-campo-600/60' : 'w-1.5 bg-stone-300'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={siguiente}
            disabled={escribiendo || esUltima}
            aria-label="Siguiente"
            className={`${flecha(!escribiendo && !esUltima)} sm:hidden`}
          >
            <Chevron />
          </button>
        </div>
      </section>
    </div>
  )
}

/** Flecha en SVG: los caracteres ‹ › quedan descentrados por la métrica de la fuente */
function Chevron({ izquierda = false }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={izquierda ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}
