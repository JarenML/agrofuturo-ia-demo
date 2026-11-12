import { useEffect, useState, type ReactNode } from 'react'
import Notificaciones from './components/Notificaciones'
import { ETIQUETA_DEMO, NOMBRE } from './data/guion'
import { ProveedorEstado, useEstado } from './estado/store'
import { ListaAlertas, NuevaAlerta } from './paginas/Alertas'
import Bandeja from './paginas/Bandeja'
import DetalleCaso from './paginas/DetalleCaso'
import Inicio from './paginas/Inicio'
import InicioTecnico from './paginas/InicioTecnico'
import Mapa from './paginas/Mapa'
import Simulacion from './paginas/Simulacion'
import Sistema from './paginas/Sistema'
import { ir, useRuta, type Rol } from './ui/comun'

export default function App() {
  return (
    <ProveedorEstado>
      <Aplicacion />
    </ProveedorEstado>
  )
}

function Aplicacion() {
  const { rol } = useEstado()
  const { partes, consulta } = useRuta()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const seccion = partes[0] ?? 'inicio'
  const esTecnico = rol === 'tecnico'

  useEffect(() => setMenuAbierto(false), [partes.join('/')])

  let pagina: ReactNode
  const clave = rol + '/' + partes.join('/') + '?' + consulta.toString()
  switch (seccion) {
    case 'casos':
      pagina = partes[1] ? <DetalleCaso id={partes[1]} /> : <Bandeja key={clave} consulta={consulta} />
      break
    case 'mapa':
      // El mapa nacional es una sección de SENASA
      pagina = esTecnico ? <InicioTecnico /> : <Mapa key={clave} consulta={consulta} />
      break
    case 'alertas':
      // Solo SENASA emite alertas; el técnico las consulta
      pagina =
        partes[1] === 'nueva' && !esTecnico ? <NuevaAlerta key={clave} consulta={consulta} /> : <ListaAlertas key={clave} />
      break
    case 'simulacion':
      pagina = <Simulacion />
      break
    case 'sistema':
      pagina = <Sistema />
      break
    default:
      pagina = esTecnico ? <InicioTecnico /> : <Inicio />
  }

  return (
    <div className="min-h-screen lg:flex">
      <MenuLateral seccion={seccion} abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="min-w-0 flex-1">
        <BarraSuperior onMenu={() => setMenuAbierto(true)} />
        {seccion === 'simulacion' ? (
          <main>{pagina}</main>
        ) : (
          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{pagina}</main>
        )}
      </div>
      <Avisos />
    </div>
  )
}

// ---------- Menú lateral ----------

function MenuLateral({ seccion, abierto, onCerrar }: { seccion: string; abierto: boolean; onCerrar: () => void }) {
  const { misCasos, alertas, rol, usuario } = useEstado()
  const esTecnico = rol === 'tecnico'
  const alertasActivas = alertas.filter((a) => a.estado === 'activa').length

  // Secciones propias de cada rol
  const items = esTecnico
    ? [
        { id: 'inicio', texto: 'Panel del técnico', icono: '🏠' },
        { id: 'casos', texto: 'Mis casos', icono: '📥', contador: misCasos.filter((c) => c.estado === 'por_validar').length },
        { id: 'alertas', texto: 'Alertas de SENASA', icono: '📣', contador: alertasActivas },
      ]
    : [
        { id: 'inicio', texto: 'Panel de vigilancia', icono: '📊' },
        { id: 'casos', texto: 'Bandeja de casos', icono: '📥', contador: misCasos.filter((c) => c.estado === 'por_revisar').length },
        { id: 'mapa', texto: 'Mapa de vigilancia', icono: '🗺️' },
        { id: 'alertas', texto: 'Alertas fitosanitarias', icono: '📣', contador: alertasActivas },
      ]
  // Secciones generales, iguales para ambos roles
  const otros = [
    { id: 'simulacion', texto: 'Simulación del flujo', icono: '▶️' },
    { id: 'sistema', texto: 'Acerca del sistema', icono: 'ℹ️' },
  ]

  const Item = ({ id, texto, icono, contador }: { id: string; texto: string; icono: string; contador?: number }) => {
    const activo = seccion === id
    return (
      <a
        href={`#/${id}`}
        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-medium transition lg:py-2.5 lg:text-base ${
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
        className={`fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-campo-800 max-lg:bottom-auto max-lg:h-dvh text-white transition-transform lg:sticky lg:w-72 lg:top-0 lg:h-screen lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 pr-3">
          <a href="#/inicio" className="flex min-w-0 flex-1 items-center gap-3 px-5 py-5">
            <img src="/logo.png" alt="" className="h-11 w-11 shrink-0 rounded-full bg-white object-contain" />
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight">{NOMBRE}</span>
              <span className="block text-xs text-campo-100">
                {esTecnico ? 'Agencia Agraria · Asistencia técnica' : 'SENASA · Vigilancia fitosanitaria'}
              </span>
            </span>
          </a>
          <button
            type="button"
            onClick={onCerrar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl text-campo-50 hover:bg-white/10 lg:hidden"
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>
        <div className="px-3 pb-3 lg:hidden">
          <SelectorRol />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((i) => (
            <Item key={i.id} {...i} />
          ))}
          <div className="px-3 pb-1 pt-6 text-xs font-semibold uppercase tracking-wider text-campo-100/70">Demostración</div>
          {otros.map((i) => (
            <Item key={i.id} {...i} />
          ))}
        </nav>
        <div className="m-3 flex shrink-0 items-center gap-3 rounded-lg bg-white/10 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-campo-100 font-bold text-campo-800">
            {usuario.iniciales}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-semibold">{usuario.nombre}</span>
            <span className="block truncate text-xs text-campo-100">{usuario.cargo}</span>
            <span className="block truncate text-xs text-campo-100">{usuario.sede}</span>
          </span>
        </div>
      </aside>
    </>
  )
}

// ---------- Selector de rol ----------

const ROLES: { id: Rol; texto: string; icono: string }[] = [
  { id: 'senasa', texto: 'SENASA', icono: '🔬' },
  { id: 'tecnico', texto: 'Técnico agrario', icono: '👨‍🌾' },
]

function SelectorRol() {
  const { rol, despachar, avisar } = useEstado()
  return (
    <div
      className="inline-flex w-full rounded-lg bg-stone-100 p-1 text-sm font-semibold lg:w-auto"
      role="radiogroup"
      aria-label="Ver la plataforma como"
    >
      {ROLES.map((r) => {
        const activo = r.id === rol
        return (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => {
              if (activo) return
              despachar({ tipo: 'cambiarRol', rol: r.id })
              avisar(`Ahora ve la plataforma como ${r.texto === 'SENASA' ? 'especialista de SENASA' : 'técnico agrario'}.`)
              if (window.location.hash.startsWith('#/casos/') || ['#/mapa', '#/alertas/nueva'].some((h) => window.location.hash.startsWith(h))) {
                ir('inicio')
              }
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 transition ${
              activo ? 'bg-white text-campo-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span aria-hidden>{r.icono}</span>
            {r.texto}
          </button>
        )
      })}
    </div>
  )
}

// ---------- Barra superior ----------

function BarraSuperior({ onMenu }: { onMenu: () => void }) {
  const [busqueda, setBusqueda] = useState('')

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
      <div className="ml-auto hidden items-center gap-2 lg:flex">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ver como</span>
        <SelectorRol />
      </div>
      <span className="hidden whitespace-nowrap rounded-full bg-tierra-700 px-3 py-1 text-xs font-bold text-white xl:inline-block">
        🧪 {ETIQUETA_DEMO.replace('Demo conceptual', 'Prototipo')}
      </span>
      <Notificaciones />
    </header>
  )
}

// ---------- Avisos ----------

function Avisos() {
  const { avisos } = useEstado()
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className="aparecer max-w-sm rounded-lg bg-stone-900 px-4 py-3 text-sm text-white shadow-lg">
          {a.texto}
        </div>
      ))}
    </div>
  )
}
