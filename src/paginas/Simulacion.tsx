import { useCallback, useEffect, useRef, useState } from 'react'
import Celular, { type MensajeEnChat } from '../components/Celular'
import PanelAutoridad from '../components/PanelAutoridad'
import PanelEspecialista from '../components/PanelEspecialista'
import PanelTecnico from '../components/PanelTecnico'
import { GUION, PASOS_ANALISIS, type ModuloId, type Pestana } from '../data/guion'

/** Duración de la animación "escribiendo…" del análisis (ms) */
const DURACION_ANALISIS = 3000

const PESTANAS: { id: Pestana; nombre: string; icono: string; rol: string }[] = [
  { id: 'tecnico', nombre: 'Técnico agrario', icono: '👨‍🌾', rol: 'Agencia Agraria' },
  { id: 'especialista', nombre: 'Especialista', icono: '🔬', rol: 'SENASA / INIA' },
  { id: 'autoridad', nombre: 'Autoridad', icono: '🏛️', rol: 'Tablero nacional' },
]

const mensajesDelPaso = (i: number): MensajeEnChat[] =>
  GUION[i].mensajes.map((mensaje) => ({ origen: 'guion', paso: i, mensaje }))

export default function Simulacion() {
  const [paso, setPaso] = useState(0)
  const [chat, setChat] = useState<MensajeEnChat[]>(() => mensajesDelPaso(0))
  const [pestana, setPestana] = useState<Pestana>('tecnico')
  const [escribiendo, setEscribiendo] = useState(false)
  const [pasosMarcados, setPasosMarcados] = useState(0)
  const [especialistaConfirmado, setEspecialistaConfirmado] = useState(false)
  const timers = useRef<number[]>([])

  const limpiarTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => limpiarTimers, [])

  const actual = GUION[paso]
  const esUltimo = paso === GUION.length - 1
  const ultimoDesvio = chat.reduce((acc, m) => (m.origen === 'desvio' ? m.indice : acc), -1)

  const siguiente = useCallback(() => {
    if (escribiendo || paso >= GUION.length - 1) return
    const n = paso + 1
    const p = GUION[n]
    setPaso(n)
    setChat((c) => [...c, ...mensajesDelPaso(n)])
    if (p.pestana) setPestana(p.pestana)

    if (p.analisis) {
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
  }, [escribiendo, paso])

  const reiniciar = () => {
    limpiarTimers()
    setPaso(0)
    setChat(mensajesDelPaso(0))
    setPestana('tecnico')
    setEscribiendo(false)
    setPasosMarcados(0)
    setEspecialistaConfirmado(false)
  }

  const elegirModulo = (modulo: ModuloId) => {
    setChat((c) => [...c, { origen: 'desvio', indice: ultimoDesvio + 1, modulo, volvio: false }])
  }

  const volverMenu = () => {
    setChat((c) => c.map((m) => (m.origen === 'desvio' && m.indice === ultimoDesvio ? { ...m, volvio: true } : m)))
  }

  // Atajos de teclado para presentar: → / espacio = siguiente, R = reiniciar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        siguiente()
      } else if (e.key === 'r' || e.key === 'R') {
        reiniciar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-[1400px] px-6 pt-6">
        <h1 className="text-2xl font-bold text-stone-900">Simulación del flujo</h1>
        <p className="mt-1 max-w-3xl text-stone-600">
          Recorrido completo de un caso real de punta a punta: Rosa, productora de papa en Huancavelica, envía una
          foto por el chat, la IA hace el prediagnóstico, el técnico lo valida y el caso se cierra tras el
          seguimiento. Use <strong>Siguiente paso</strong> o la flecha derecha del teclado.
        </p>
      </div>

      {/* Barra de control de la historia */}
      <div className="sticky top-16 z-30 mt-4 border-y border-campo-200 bg-campo-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-1" aria-label="Progreso">
            {GUION.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-full transition-all ${
                  i === paso ? 'w-8 bg-campo-600' : i < paso ? 'w-2.5 bg-campo-600' : 'w-2.5 bg-stone-300'
                }`}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold text-stone-900">
              Paso {paso + 1} de {GUION.length}: {actual.titulo}
            </div>
            <div className="text-stone-600">{actual.nota}</div>
          </div>
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-xl border-2 border-stone-300 bg-white px-5 py-2.5 text-lg font-semibold text-stone-700 hover:bg-stone-100"
          >
            ↺ Reiniciar
          </button>
          <button
            type="button"
            onClick={siguiente}
            disabled={escribiendo || esUltimo}
            className={`rounded-xl px-6 py-2.5 text-lg font-bold shadow transition ${
              escribiendo || esUltimo
                ? 'cursor-default bg-stone-300 text-stone-500'
                : 'bg-campo-600 text-white hover:bg-campo-700'
            }`}
          >
            {esUltimo ? 'Historia completa ✔' : escribiendo ? 'Analizando…' : 'Siguiente paso →'}
          </button>
        </div>
      </div>

      {/* Zona principal */}
      <main className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 lg:grid-cols-[380px_1fr]">
        <section>
          <h2 className="mb-3 text-center text-lg font-semibold uppercase tracking-wide text-campo-800">
            📱 Agricultor
          </h2>
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
        </section>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2" role="tablist">
            {PESTANAS.map((t) => {
              const activa = t.id === pestana
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => setPestana(t.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-left transition ${
                    activa
                      ? 'bg-campo-700 text-white shadow-md'
                      : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-campo-50'
                  }`}
                >
                  <span className="text-2xl">{t.icono}</span>
                  <span className="leading-tight">
                    <span className="block text-lg font-bold">{t.nombre}</span>
                    <span className={`block text-sm ${activa ? 'text-campo-100' : 'text-stone-500'}`}>{t.rol}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="min-h-[560px]">
            {pestana === 'tecnico' && (
              <PanelTecnico estado={actual.estadoCaso} pasosMarcados={pasosMarcados} onValidar={siguiente} />
            )}
            {pestana === 'especialista' && (
              <PanelEspecialista
                confirmado={especialistaConfirmado}
                onConfirmar={() => setEspecialistaConfirmado(true)}
              />
            )}
            {pestana === 'autoridad' && (
              <PanelAutoridad
                huancavelicaVerde={actual.puntoHuancavelica === 'verde'}
                rosaValidado={paso >= 6}
              />
            )}
          </div>
        </section>
      </main>

    </div>
  )
}

