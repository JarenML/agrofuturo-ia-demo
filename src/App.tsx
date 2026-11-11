import { useEffect, useState, type ReactNode } from 'react'
import { USUARIO } from './data/casos'
import { ETIQUETA_DEMO, NOMBRE } from './data/guion'
import { ProveedorEstado, useEstado } from './estado/store'
import { ListaAlertas, NuevaAlerta } from './paginas/Alertas'
import Bandeja from './paginas/Bandeja'
import DetalleCaso from './paginas/DetalleCaso'
import Inicio from './paginas/Inicio'
import Mapa from './paginas/Mapa'
import Simulacion from './paginas/Simulacion'
import Sistema from './paginas/Sistema'
import { ir, useRuta } from './ui/comun'

export default function App() {
  return (
    <ProveedorEstado>
      <Aplicacion />
    </ProveedorEstado>
  )
}

function Aplicacion() {
  const { partes, consulta } = useRuta()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const seccion = partes[0] ?? 'inicio'

  useEffect(() => setMenuAbierto(false), [partes.join('/')])

  let pagina: ReactNode
  const clave = partes.join('/') + '?' + consulta.toString()
  switch (seccion) {
    case 'casos':
      pagina = partes[1] ? <DetalleCaso id={partes[1]} /> : <Bandeja key={clave} consulta={consulta} />
      break
    case 'mapa':
      pagina = <Mapa key={clave} consulta={consulta} />
      break
    case 'alertas':
      pagina = partes[1] === 'nueva' ? <NuevaAlerta key={clave} consulta={consulta} /> : <ListaAlertas />
      break
    case 'simulacion':
      pagina = <Simulacion />
      break
    case 'sistema':
      pagina = <Sistema />
      break
    default:
      pagina = <Inicio />
  }

  return (
    <div className="min-h-screen lg:flex">
      <MenuLateral seccion={seccion} abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="min-w-0 flex-1">
        <BarraSuperior onMenu={() => setMenuAbierto(true)} />
        {seccion === 'simulacion' ? (
          <main>{pagina}</main>
        ) : (
          <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{pagina}</main>
        )}
      </div>
      <Avisos />
    </div>
  )
}

// ---------- Menú lateral ----------

function MenuLateral({ seccion, abierto, onCerrar }: { seccion: string; abierto: boolean; onCerrar: () => void }) {
  const { casos, alertas } = useEstado()
  const porRevisar = casos.filter((c) => c.estado === 'por_revisar').length
  const alertasActivas = alertas.filter((a) => a.estado === 'activa').length

  const items = [
    { id: 'inicio', texto: 'Panel de vigilancia', icono: '📊' },
    { id: 'casos', texto: 'Bandeja de casos', icono: '📥', contador: porRevisar },
    { id: 'mapa', texto: 'Mapa de vigilancia', icono: '🗺️' },
    { id: 'alertas', texto: 'Alertas fitosanitarias', icono: '📣', contador: alertasActivas },
  ]
  const otros = [
    { id: 'simulacion', texto: 'Simulación del flujo', icono: '▶️' },
    { id: 'sistema', texto: 'Acerca del sistema', icono: 'ℹ️' },
  ]

  const Item = ({ id, texto, icono, contador }: { id: string; texto: string; icono: string; contador?: number }) => {
    const activo = seccion === id
    return (
      <a
        href={`#/${id}`}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition ${
          activo ? 'bg-white text-campo-800 shadow-sm' : 'text-campo-50 hover:bg-white/10'
        }`}
        aria-current={activo ? 'page' : undefined}
      >
        <span aria-hidden className="w-5 text-center">
          {icono}
        </span>
        <span className="flex-1">{texto}</span>
        {!!contador && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
              activo ? 'bg-campo-700 text-white' : 'bg-amber-400 text-amber-950'
            }`}
          >
            {contador}
          </span>
        )}
      </a>
    )
  }

  return (
    <>
      {abierto && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onCerrar} aria-hidden />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-campo-800 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <a href="#/inicio" className="flex items-center gap-3 px-5 py-5">
          <img src="/logo.png" alt="" className="h-11 w-11 shrink-0 rounded-full bg-white object-contain" />
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">{NOMBRE}</span>
            <span className="block text-xs text-campo-100">SENASA · Vigilancia fitosanitaria</span>
          </span>
        </a>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((i) => (
            <Item key={i.id} {...i} />
          ))}
          <div className="px-3 pb-1 pt-6 text-xs font-semibold uppercase tracking-wider text-campo-100/70">Demostración</div>
          {otros.map((i) => (
            <Item key={i.id} {...i} />
          ))}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-lg bg-white/10 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-campo-100 font-bold text-campo-800">
            {USUARIO.iniciales}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-semibold">{USUARIO.nombre}</span>
            <span className="block truncate text-xs text-campo-100">{USUARIO.cargo}</span>
            <span className="block truncate text-xs text-campo-100">{USUARIO.sede}</span>
          </span>
        </div>
      </aside>
    </>
  )
}

// ---------- Barra superior ----------

function BarraSuperior({ onMenu }: { onMenu: () => void }) {
  const { casos } = useEstado()
  const [busqueda, setBusqueda] = useState('')
  const urgentes = casos.filter((c) => c.estado === 'por_revisar' && c.riesgo === 'alto').length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button type="button" onClick={onMenu} className="rounded-lg p-2 text-xl lg:hidden" aria-label="Abrir menú">
        ☰
      </button>
      <form
        className="max-w-md flex-1"
        onSubmit={(e) => {
          e.preventDefault()
          ir(`casos?estado=todos&q=${encodeURIComponent(busqueda.trim())}`)
          setBusqueda('')
        }}
      >
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar caso, productor o distrito…"
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-campo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campo-200"
        />
      </form>
      <span className="ml-auto hidden whitespace-nowrap rounded-full bg-tierra-700 px-3 py-1 text-xs font-bold text-white sm:inline-block">
        🧪 {ETIQUETA_DEMO.replace('Demo conceptual', 'Prototipo')}
      </span>
      <a
        href="#/casos?estado=por_revisar&riesgo=alto"
        className="relative ml-auto rounded-lg p-2 text-xl hover:bg-stone-100 sm:ml-0"
        title={`${urgentes} casos de riesgo alto por revisar`}
        aria-label={`${urgentes} casos de riesgo alto por revisar`}
      >
        🔔
        {urgentes > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {urgentes}
          </span>
        )}
      </a>
    </header>
  )
}

// ---------- Avisos ----------

function Avisos() {
  const { avisos } = useEstado()
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className="aparecer max-w-sm rounded-lg bg-stone-900 px-4 py-3 text-sm text-white shadow-lg">
          {a.texto}
        </div>
      ))}
    </div>
  )
}
