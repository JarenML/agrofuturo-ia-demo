import { useEffect, useRef, type ReactNode } from 'react'
import {
  CASO_ROSA,
  MODULOS,
  TEXTO_MENU_OTRA_VEZ,
  TEXTO_VOLVER_MENU,
  type Mensaje,
  type ModuloId,
} from '../data/guion'
import { Imagen } from '../ilustraciones/Ilustraciones'
import { EtiquetaRiesgo } from './EtiquetaRiesgo'

/** Un mensaje ya ubicado en la línea de tiempo del chat */
export type MensajeEnChat =
  | { origen: 'guion'; paso: number; mensaje: Mensaje }
  | { origen: 'desvio'; indice: number; modulo: ModuloId; volvio: boolean }

interface Props {
  mensajes: MensajeEnChat[]
  pasoActual: number
  escribiendo: boolean
  /** true cuando el menú del chat puede usarse (solo en el primer paso) */
  menuActivo: boolean
  ultimoDesvio: number
  onSiguiente: () => void
  onElegirModulo: (id: ModuloId) => void
  onVolverMenu: () => void
}

const HORA = '9:41'

export default function Celular(props: Props) {
  const { mensajes, escribiendo } = props
  const fondoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = fondoRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [mensajes.length, escribiendo])

  return (
    <div className="mx-auto w-[360px] max-w-full">
      {/* Marco del teléfono */}
      <div className="rounded-[2.6rem] bg-stone-900 p-[10px] shadow-2xl ring-1 ring-stone-700">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-chat-fondo" style={{ height: 640 }}>
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-stone-900" />

          {/* Cabecera del chat */}
          <div className="flex items-center gap-3 bg-campo-700 px-4 pb-3 pt-8 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-campo-100 text-2xl">
              🌱
            </div>
            <div className="leading-tight">
              <div className="font-bold">AGROFUTURO IA</div>
              <div className="text-xs text-campo-100">Asistente agrario · en línea</div>
            </div>
            <div className="ml-auto text-xs text-campo-100">{HORA}</div>
          </div>

          {/* Mensajes */}
          <div
            ref={fondoRef}
            className="chat-scroll absolute inset-x-0 bottom-14 top-[88px] overflow-y-auto px-3 py-3"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(107,74,43,0.12) 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          >
            <div className="flex flex-col gap-2">
              {mensajes.map((m, i) => (
                <Burbuja key={i} item={m} {...props} />
              ))}
              {escribiendo && <Escribiendo />}
            </div>
          </div>

          {/* Barra de entrada (decorativa) */}
          <div className="absolute inset-x-0 bottom-0 flex h-14 items-center gap-2 bg-stone-100 px-3">
            <div className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-stone-400">
              Escriba un mensaje
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-campo-600 text-white">
              🎤
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-sm text-stone-500">
        Agricultora: <strong>{CASO_ROSA.agricultora}</strong> · {CASO_ROSA.cultivo} · {CASO_ROSA.region}
      </div>
    </div>
  )
}

// ---------- Burbujas ----------

function Burbuja({ item, ...p }: { item: MensajeEnChat } & Props) {
  if (item.origen === 'desvio') {
    const modulo = MODULOS.find((m) => m.id === item.modulo)!
    const esUltimo = item.indice === p.ultimoDesvio
    return (
      <>
        <Rosa>{modulo.opcion}</Rosa>
        <Bot>
          <p>{modulo.respuesta}</p>
          {!item.volvio && (
            <BotonChat activo={esUltimo && p.menuActivo} onClick={p.onVolverMenu}>
              {TEXTO_VOLVER_MENU}
            </BotonChat>
          )}
        </Bot>
        {item.volvio && (
          <Bot>
            <p>{TEXTO_MENU_OTRA_VEZ}</p>
            <Menu activo={esUltimo && p.menuActivo} {...p} />
          </Bot>
        )}
      </>
    )
  }

  const { mensaje, paso } = item
  const esPasoActual = paso === p.pasoActual

  switch (mensaje.tipo) {
    case 'separador':
      return (
        <div className="my-2 flex justify-center">
          <span className="rounded-full bg-stone-200/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
            {mensaje.texto}
          </span>
        </div>
      )
    case 'texto':
      if (mensaje.autor === 'rosa') return <Rosa>{mensaje.texto}</Rosa>
      return (
        <Bot>
          <p>{mensaje.texto}</p>
          {mensaje.boton && (
            <BotonChat activo={esPasoActual && !p.escribiendo} onClick={p.onSiguiente}>
              {mensaje.boton}
            </BotonChat>
          )}
        </Bot>
      )
    case 'menu':
      return (
        <Bot>
          <p>{mensaje.texto}</p>
          <Menu activo={p.menuActivo && p.ultimoDesvio < 0} {...p} />
        </Bot>
      )
    case 'foto':
      return (
        <Rosa foto>
          <Imagen tipo={mensaje.imagen} className="h-44 w-44 rounded-lg" />
          <div className="mt-1 text-sm">{mensaje.pie}</div>
        </Rosa>
      )
    case 'resultado':
      return (
        <Bot>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-campo-700">
            Prediagnóstico de la IA
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
            <div className="text-sm text-stone-500">Problema</div>
            <div className="text-lg font-bold leading-tight text-stone-900">{CASO_ROSA.problema}</div>
            <div className="mt-2 text-sm text-stone-500">Riesgo</div>
            <EtiquetaRiesgo nivel={CASO_ROSA.riesgo} />
          </div>
          <p className="mt-2 text-sm text-stone-600">
            Un técnico de su zona revisará este resultado.
          </p>
          <BotonChat activo={esPasoActual} onClick={p.onSiguiente}>
            {mensaje.boton}
          </BotonChat>
        </Bot>
      )
    case 'recomendaciones':
      return (
        <Bot>
          <p className="font-semibold">Le recomiendo:</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            {mensaje.items.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          <p className="mt-2">{mensaje.cierre}</p>
        </Bot>
      )
  }
}

function Menu({ activo, ...p }: { activo: boolean } & Props) {
  return (
    <div className="mt-2 grid gap-1.5">
      {MODULOS.map((m) => (
        <BotonChat
          key={m.id}
          activo={activo}
          destacado={m.id === 'sinavifa'}
          onClick={() => (m.id === 'sinavifa' ? p.onSiguiente() : p.onElegirModulo(m.id))}
        >
          {m.opcion}
        </BotonChat>
      ))}
    </div>
  )
}

function Bot({ children }: { children: ReactNode }) {
  return (
    <div className="aparecer flex justify-start">
      <div className="relative max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[15px] leading-snug shadow-sm">
        {children}
        <div className="mt-1 text-right text-[10px] text-stone-400">{HORA}</div>
      </div>
    </div>
  )
}

function Rosa({ children, foto = false }: { children: ReactNode; foto?: boolean }) {
  return (
    <div className="aparecer flex justify-end">
      <div
        className={`max-w-[85%] rounded-2xl rounded-tr-sm bg-chat-rosa text-[15px] leading-snug shadow-sm ${
          foto ? 'p-1.5' : 'px-3 py-2'
        }`}
      >
        {children}
        <div className="mt-1 text-right text-[10px] text-stone-500">{HORA} ✓✓</div>
      </div>
    </div>
  )
}

function BotonChat({
  children,
  activo,
  destacado = false,
  onClick,
}: {
  children: ReactNode
  activo: boolean
  destacado?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={!activo}
      onClick={onClick}
      className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-left text-[15px] font-medium transition
        ${
          activo
            ? destacado
              ? 'border-campo-600 bg-campo-600 text-white hover:bg-campo-700'
              : 'border-campo-600 bg-white text-campo-700 hover:bg-campo-50'
            : 'cursor-default border-stone-200 bg-stone-100 text-stone-400'
        }`}
    >
      {children}
    </button>
  )
}

function Escribiendo() {
  return (
    <div className="aparecer flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
        <span className="puntito block h-2.5 w-2.5 rounded-full bg-stone-400" />
        <span className="puntito block h-2.5 w-2.5 rounded-full bg-stone-400" />
        <span className="puntito block h-2.5 w-2.5 rounded-full bg-stone-400" />
        <span className="ml-2 text-xs text-stone-500">analizando la foto…</span>
      </div>
    </div>
  )
}
