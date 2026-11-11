import { useEffect, useMemo, useRef, useState } from 'react'
import { TECNICO, type Alerta, type Caso } from '../data/casos'
import { useEstado } from '../estado/store'
import { diagnosticoVigente, haceCuanto, ir, type Rol } from '../ui/comun'

/**
 * Campana de notificaciones con panel desplegable.
 * Las notificaciones salen del historial de los casos y de las alertas,
 * según lo que le importa a cada rol en el flujo.
 */

interface Notificacion {
  id: string
  fecha: string
  icono: string
  titulo: string
  detalle: string
  destino: string
}

/** Las notificaciones de más de un día se consideran leídas */
const HORAS_NUEVA = 24
const MAXIMO = 15

function construir(casos: Caso[], alertas: Alerta[], rol: Rol): Notificacion[] {
  const lista: Notificacion[] = []
  const lugar = (c: Caso) => `${c.cultivo} · ${diagnosticoVigente(c).problema} · ${c.distrito}, ${c.region}`

  for (const c of casos) {
    c.historial.forEach((e, i) => {
      const id = `${c.id}-${i}`
      const base = { id, fecha: e.fecha, destino: `casos/${c.id}` }
      const texto = e.texto.toLowerCase()

      if (rol === 'senasa') {
        if (!c.derivado) return
        if (e.rol === 'tecnico' && texto.includes('derivó el caso a senasa')) {
          lista.push({
            ...base,
            icono: c.riesgo === 'alto' ? '🔴' : '📥',
            titulo: `${e.autor} derivó un caso${c.riesgo === 'alto' ? ' de riesgo alto' : ''}`,
            detalle: lugar(c),
          })
        } else if (e.rol === 'productor' && texto.includes('seguimiento')) {
          lista.push({ ...base, icono: '📷', titulo: 'Llegó una foto de seguimiento', detalle: `${c.productor} · ${lugar(c)}` })
        } else if (e.rol === 'tecnico' && texto.includes('verificó la mejora')) {
          lista.push({ ...base, icono: '👨‍🌾', titulo: `${e.autor} verificó la mejora en campo`, detalle: lugar(c) })
        }
      } else {
        if (c.tecnico !== TECNICO.nombre) return
        if (e.rol === 'ia' && texto.startsWith('prediagnóstico')) {
          lista.push({
            ...base,
            icono: c.riesgo === 'alto' ? '🔴' : '🤖',
            titulo: `Nuevo caso de ${c.productor}`,
            detalle: `${c.cultivo} · ${c.prediagnostico.problema} · ${c.distrito}`,
          })
        } else if (e.rol === 'senasa' && !texto.startsWith('tomó el caso')) {
          lista.push({ ...base, icono: '🔬', titulo: `SENASA respondió: ${e.texto.split('.')[0]}`, detalle: lugar(c) })
        } else if (e.rol === 'productor' && texto.includes('seguimiento')) {
          lista.push({ ...base, icono: '📷', titulo: 'Llegó una foto de seguimiento', detalle: `${c.productor} · ${lugar(c)}` })
        }
      }
    })
  }

  for (const a of alertas) {
    if (a.estado !== 'activa') continue
    if (rol === 'tecnico' && !a.regiones.includes(TECNICO.region)) continue
    lista.push({
      id: `alerta-${a.id}`,
      fecha: a.fecha,
      icono: '📣',
      titulo: rol === 'tecnico' ? 'Alerta de SENASA en su zona' : `Alerta activa: ${a.id}`,
      detalle: a.titulo,
      destino: 'alertas',
    })
  }

  return lista.sort((x, y) => y.fecha.localeCompare(x.fecha)).slice(0, MAXIMO)
}

export default function Notificaciones() {
  const { casos, alertas, rol, leidas = [], despachar } = useEstado()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  const lista = useMemo(() => construir(casos, alertas, rol), [casos, alertas, rol])
  const esLeida = (n: Notificacion) =>
    leidas.includes(n.id) || Date.now() - new Date(n.fecha).getTime() > HORAS_NUEVA * 3600_000
  const noLeidas = lista.filter((n) => !esLeida(n))

  // Cerrar al hacer clic fuera o con Escape
  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false)
    }
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  // Al cambiar de página o de rol, cerrar el panel
  useEffect(() => {
    const cerrar = () => setAbierto(false)
    window.addEventListener('hashchange', cerrar)
    return () => window.removeEventListener('hashchange', cerrar)
  }, [])
  useEffect(() => setAbierto(false), [rol])

  const abrir = (n: Notificacion) => {
    despachar({ tipo: 'marcarLeidas', ids: [n.id] })
    setAbierto(false)
    ir(n.destino)
  }

  const etiqueta = noLeidas.length
    ? `Notificaciones: ${noLeidas.length} sin leer`
    : 'Notificaciones'

  return (
    <div ref={contenedor} className="relative ml-auto lg:ml-0">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`relative rounded-lg p-2 text-xl hover:bg-stone-100 ${abierto ? 'bg-stone-100' : ''}`}
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        title={etiqueta}
      >
        🔔
        {noLeidas.length > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {noLeidas.length}
          </span>
        )}
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="aparecer absolute right-0 top-full z-50 mt-2 w-[min(92vw,400px)] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
        >
          {/* flecha del globo */}
          <span className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-stone-200 bg-white" aria-hidden />
          <div className="relative flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <div className="font-semibold text-stone-900">Notificaciones</div>
              <div className="text-xs text-stone-500">
                {noLeidas.length ? `${noLeidas.length} sin leer` : 'Está al día'}
              </div>
            </div>
            {noLeidas.length > 0 && (
              <button
                type="button"
                onClick={() => despachar({ tipo: 'marcarLeidas', ids: noLeidas.map((n) => n.id) })}
                className="text-sm font-semibold text-campo-700 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <ul className="max-h-[min(70vh,460px)] divide-y divide-stone-100 overflow-y-auto">
            {lista.map((n) => {
              const nueva = !esLeida(n)
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => abrir(n)}
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-campo-50 ${nueva ? 'bg-amber-50/60' : ''}`}
                  >
                    <span className="mt-0.5 text-lg" aria-hidden>
                      {n.icono}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${nueva ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
                        {n.titulo}
                      </span>
                      <span className="block truncate text-sm text-stone-500">{n.detalle}</span>
                      <span className="block text-xs text-stone-400">{haceCuanto(n.fecha)}</span>
                    </span>
                    {nueva && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-campo-600" aria-label="Sin leer" />}
                  </button>
                </li>
              )
            })}
            {lista.length === 0 && <li className="px-4 py-10 text-center text-stone-500">No hay notificaciones.</li>}
          </ul>

          <div className="border-t border-stone-100 px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => {
                setAbierto(false)
                ir(rol === 'tecnico' ? 'casos' : 'casos?estado=por_revisar')
              }}
              className="text-sm font-semibold text-campo-700 hover:underline"
            >
              {rol === 'tecnico' ? 'Ver mis casos' : 'Ir a la bandeja de casos'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
