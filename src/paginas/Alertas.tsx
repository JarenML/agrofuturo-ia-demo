import { useMemo, useRef, useState, type ReactNode } from 'react'
import { CATALOGO, CULTIVOS, LISTA_REGIONES, TECNICO, USUARIO, estimarAlcance, type Alerta, type Riesgo } from '../data/casos'
import { nuevoIdAlerta, useEstado } from '../estado/store'
import {
  EncabezadoPagina,
  Enlace,
  FilasVacias,
  Paginacion,
  RIESGOS,
  claseBoton,
  claseCampo,
  fechaHora,
  haceCuanto,
  ir,
  usePaginacion,
} from '../ui/comun'

const BORDE_NIVEL: Record<Riesgo, string> = { alto: 'border-l-red-500', medio: 'border-l-orange-400', bajo: 'border-l-green-500' }

export function ListaAlertas() {
  const { alertas, rol } = useEstado()
  const esTecnico = rol === 'tecnico'
  const [ver, setVer] = useState<'activa' | 'cerrada'>('activa')
  const [vista, setVistaEstado] = useState<'tarjetas' | 'tabla'>(() => {
    try {
      return localStorage.getItem('vistaAlertas') === 'tabla' ? 'tabla' : 'tarjetas'
    } catch {
      return 'tarjetas'
    }
  })
  const setVista = (v: 'tarjetas' | 'tabla') => {
    setVistaEstado(v)
    try {
      localStorage.setItem('vistaAlertas', v)
    } catch {
      /* sin almacenamiento: solo dura esta visita */
    }
  }
  const [texto, setTexto] = useState('')
  const [nivel, setNivel] = useState('')
  const [region, setRegion] = useState('')
  const [cultivo, setCultivo] = useState('')
  const deMiZona = (regiones: string[]) => esTecnico && regiones.includes(TECNICO.region)
  const pasaFiltros = (a: (typeof alertas)[number]) => {
    const q = texto.trim().toLowerCase()
    return (
      (!q || [a.id, a.titulo, a.problema, a.cultivo, a.mensaje, ...a.regiones].join(' ').toLowerCase().includes(q)) &&
      (!nivel || a.nivel === nivel) &&
      (!region || a.regiones.includes(region)) &&
      (!cultivo || a.cultivo === cultivo)
    )
  }
  const hayFiltros = texto || nivel || region || cultivo
  // El técnico ve primero las alertas de su región
  const lista = alertas
    .filter((a) => a.estado === ver && pasaFiltros(a))
    .sort((a, b) => Number(deMiZona(b.regiones)) - Number(deMiZona(a.regiones)))
  const pag = usePaginacion(lista, [ver, texto, nivel, region, cultivo].join('|'))
  const activas = alertas.filter((a) => a.estado === 'activa')
  const cifras = [
    { valor: activas.length, texto: 'alertas activas', icono: '📣' },
    { valor: activas.filter((a) => a.nivel === 'alto').length, texto: 'de nivel alto', icono: '🔴' },
    { valor: activas.reduce((s, a) => s + a.productoresAlcanzados, 0).toLocaleString('es-PE'), texto: 'productores avisados', icono: '📱' },
    { valor: new Set(activas.flatMap((a) => a.regiones)).size, texto: 'regiones en alerta', icono: '🗺️' },
  ]

  return (
    <div>
      {/* ponytail: fijo solo en lg, igual que la bandeja; en móvil ocuparía la pantalla */}
      <div className="lg:sticky lg:top-16 lg:z-30 lg:-mx-8 lg:-mt-6 lg:bg-campo-50 lg:px-8 lg:pt-6">
      <EncabezadoPagina
        icono="📣"
        titulo={esTecnico ? 'Alertas de SENASA' : 'Alertas fitosanitarias'}
        sub={
          esTecnico
            ? `Avisos que SENASA envía por WhatsApp. Las de ${TECNICO.region} también llegan a sus productores.`
            : 'Avisos que SENASA envía por WhatsApp a los productores de las zonas afectadas.'
        }
        accion={
          esTecnico ? undefined : (
            <Enlace a="alertas/nueva" className={claseBoton.primario}>
              + Nueva alerta
            </Enlace>
          )
        }
      />

      {/* Resumen de las alertas activas */}
      <div className="-mt-2 mb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cifras.map((c) => (
            <div key={c.texto} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-xl" aria-hidden>
                {c.icono}
              </span>
              <span>
                <span className="block text-xl font-bold leading-tight tabular-nums text-stone-900">{c.valor}</span>
                <span className="block text-xs text-stone-500">{c.texto}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
        <div className="flex rounded-lg bg-stone-200/60 p-1" role="tablist">
          {(['activa', 'cerrada'] as const).map((e) => (
            <button
              key={e}
              type="button"
              role="tab"
              aria-selected={ver === e}
              onClick={() => setVer(e)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                ver === e ? 'bg-white text-campo-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {e === 'activa' ? 'Activas' : 'Cerradas'}
              <span className="ml-1.5 rounded-full bg-stone-100 px-1.5 text-xs tabular-nums text-stone-600">
                {alertas.filter((a) => a.estado === e && pasaFiltros(a)).length}
              </span>
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-auto sm:min-w-[220px] sm:flex-1">
          <span className="sr-only">Buscar</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="w-full rounded-lg border border-transparent bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-campo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campo-200"
            placeholder="Buscar por código, título, problema o región"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <FiltroPildora etiqueta="Nivel" valor={nivel} onCambio={setNivel}>
          <option value="alto">Alto</option>
          <option value="medio">Medio</option>
          <option value="bajo">Bajo</option>
        </FiltroPildora>
        <FiltroPildora etiqueta="Región" valor={region} onCambio={setRegion}>
          {LISTA_REGIONES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </FiltroPildora>
        <FiltroPildora etiqueta="Cultivo" valor={cultivo} onCambio={setCultivo}>
          {CULTIVOS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </FiltroPildora>
        {hayFiltros && (
          <button
            type="button"
            onClick={() => {
              setTexto('')
              setNivel('')
              setRegion('')
              setCultivo('')
            }}
            className="rounded-lg px-2 py-2 text-sm font-semibold text-campo-700 hover:bg-campo-50"
          >
            ✕ Limpiar
          </button>
        )}
        <div className="ml-auto flex rounded-lg bg-stone-200/60 p-1 max-sm:hidden" role="group" aria-label="Vista">
          {(
            [
              ['tarjetas', '▦', 'Tarjetas'],
              ['tabla', '☰', 'Tabla'],
            ] as const
          ).map(([v, icono, nombre]) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              title={`Ver como ${nombre.toLowerCase()}`}
              onClick={() => setVista(v)}
              className={`rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${
                vista === v ? 'bg-white text-campo-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span aria-hidden>{icono}</span> {nombre}
            </button>
          ))}
        </div>
      </div>
      </div>

      {vista === 'tabla' && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm max-sm:hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Alerta</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="hidden px-4 py-3 md:table-cell">Cultivo · problema</th>
                <th className="hidden px-4 py-3 lg:table-cell">Regiones</th>
                <th className="px-4 py-3 text-right">Avisados</th>
                <th className="hidden px-4 py-3 xl:table-cell">Emitida</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody ref={pag.refFilas} style={pag.estiloFilas} className="divide-y divide-stone-100">
              {pag.visibles.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => a.casoOrigen && ir(`casos/${a.casoOrigen}`)}
                  onKeyDown={(e) => e.key === 'Enter' && a.casoOrigen && ir(`casos/${a.casoOrigen}`)}
                  tabIndex={a.casoOrigen ? 0 : undefined}
                  className={`h-[var(--alto-fila)] align-top hover:bg-campo-50 focus:bg-campo-50 focus:outline-none ${a.casoOrigen ? 'cursor-pointer' : ''} ${
                    a.estado === 'cerrada' ? 'opacity-75' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-900">{a.titulo}</div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-mono">{a.id}</span>
                      {deMiZona(a.regiones) && <span className="rounded-full bg-campo-700 px-2 font-semibold text-white">Su zona</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${RIESGOS[a.nivel].clase}`}>
                      {RIESGOS[a.nivel].icono} {RIESGOS[a.nivel].texto}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-stone-700 md:table-cell">
                    {a.cultivo} · {a.problema}
                  </td>
                  <td className="hidden px-4 py-3 text-stone-700 lg:table-cell">{a.regiones.join(', ')}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-stone-900">
                    {a.productoresAlcanzados.toLocaleString('es-PE')}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-stone-500 xl:table-cell">
                    {a.emitidaPor}
                    <br />
                    {haceCuanto(a.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    <Acciones alerta={a} />
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-[var(--alto-fila)] px-4 text-center text-stone-500">
                    No hay alertas {ver === 'activa' ? 'activas' : 'cerradas'}
                    {hayFiltros ? ' con estos filtros' : ''}.
                  </td>
                </tr>
              )}
              <FilasVacias cantidad={pag.porPagina - pag.visibles.length - (lista.length === 0 ? 1 : 0)} columnas={7} />
            </tbody>
          </table>
          <Paginacion p={pag} unidad="alertas" />
        </div>
      )}

      <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 ${vista === 'tabla' ? 'sm:hidden' : ''}`}>
        {lista.map((a) => (
          <article
            key={a.id}
            className={`flex flex-col rounded-xl border border-l-4 bg-white shadow-sm ${BORDE_NIVEL[a.nivel]} ${
              deMiZona(a.regiones) ? 'border-campo-600 ring-1 ring-campo-600' : 'border-stone-200'
            } ${a.estado === 'cerrada' ? 'opacity-75' : ''}`}
          >
            <header className="px-4 pt-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-semibold ring-1 ${RIESGOS[a.nivel].clase}`}>
                  {RIESGOS[a.nivel].icono} Nivel {RIESGOS[a.nivel].texto.toLowerCase()}
                </span>
                {deMiZona(a.regiones) && <span className="rounded-full bg-campo-700 px-2 py-0.5 font-semibold text-white">Su zona</span>}
                <span className="ml-auto font-mono text-stone-400">{a.id}</span>
              </div>
              <h2 className="mt-1.5 font-bold leading-snug text-stone-900">{a.titulo}</h2>
              <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-700">🌱 {a.cultivo}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-700">🦠 {a.problema}</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-700">📍 {a.regiones.join(', ')}</span>
              </div>
            </header>

            {/* Mensaje tal como lo recibe el productor */}
            <div className="mx-4 mt-3 flex-1 rounded-lg bg-[#efeae2] p-2.5">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Mensaje por WhatsApp</div>
              <p className="rounded-lg rounded-tl-none bg-chat-rosa px-3 py-2 text-sm text-stone-800 shadow-sm">{a.mensaje}</p>
            </div>

            <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-stone-100 px-4 py-2.5 text-xs text-stone-500">
              <span>
                📱 <strong className="tabular-nums text-stone-800">{a.productoresAlcanzados.toLocaleString('es-PE')}</strong> avisados
              </span>
              <span>
                {a.emitidaPor} · {haceCuanto(a.fecha)}
              </span>
              <span className="ml-auto">
                <Acciones alerta={a} />
              </span>
            </footer>
          </article>
        ))}
        {lista.length === 0 && (
          <p className="py-10 text-stone-500">
            No hay alertas {ver === 'activa' ? 'activas' : 'cerradas'}
            {hayFiltros ? ' con estos filtros' : ''}.
          </p>
        )}
      </div>
    </div>
  )
}

export function NuevaAlerta({ consulta }: { consulta: URLSearchParams }) {
  const ayuda = useRef<HTMLDialogElement>(null)
  const { casos, alertas, despachar, avisar } = useEstado()
  const origen = casos.find((c) => c.id === consulta.get('caso'))

  const [cultivo, setCultivo] = useState(origen?.cultivo ?? 'Papa')
  const [problema, setProblema] = useState(origen?.dictamen?.problema ?? origen?.prediagnostico.problema ?? CATALOGO.Papa[0].problema)
  const [regiones, setRegiones] = useState<string[]>(origen ? [origen.region] : [])
  const [nivel, setNivel] = useState<Riesgo>(origen?.riesgo === 'bajo' ? 'medio' : (origen?.riesgo ?? 'alto'))
  const [mensajeEditado, setMensajeEditado] = useState<string | null>(null)

  const problemas = CATALOGO[cultivo] ?? []
  const mensajeSugerido = `⚠️ Alerta SENASA: se confirmó ${problema.toLowerCase()} en ${cultivo.toLowerCase()} en ${
    regiones.length ? regiones.join(', ') : 'su zona'
  }. Revise sus plantas hoy. Si ve síntomas, envíe una foto a este número o avise a su técnico.`
  const mensaje = mensajeEditado ?? mensajeSugerido
  const titulo = `${problema} en ${cultivo.toLowerCase()}${regiones.length ? ' — ' + regiones.join(', ') : ''}`
  const alcance = useMemo(() => estimarAlcance(regiones, cultivo), [regiones, cultivo])
  const valido = regiones.length > 0 && mensaje.trim().length > 10

  const alternar = (r: string) => setRegiones((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))

  const emitir = () => {
    if (!valido) return
    const id = nuevoIdAlerta(alertas)
    despachar({
      tipo: 'emitirAlerta',
      alerta: {
        id,
        fecha: new Date().toISOString(),
        titulo,
        problema,
        cultivo,
        regiones,
        nivel,
        mensaje,
        estado: 'activa',
        emitidaPor: USUARIO.nombre,
        casoOrigen: origen?.id,
        productoresAlcanzados: alcance,
      },
    })
    avisar(`Alerta ${id} emitida a ${alcance.toLocaleString('es-PE')} productores (simulado).`)
    ir('alertas')
  }

  return (
    <div>
      <EncabezadoPagina
        icono="✍️"
        titulo="Nueva alerta fitosanitaria"
        sub={
          origen ? (
            <>
              A partir del caso{' '}
              <Enlace a={`casos/${origen.id}`} className="font-semibold text-white underline">
                {origen.id}
              </Enlace>{' '}
              ({origen.distrito}, {origen.region})
            </>
          ) : (
            'El mensaje llega por WhatsApp a los productores registrados del cultivo en las regiones elegidas.'
          )
        }
        accion={
          <Enlace a="alertas" className={claseBoton.secundario}>
            ← Volver a alertas
          </Enlace>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3">
            <h2 className="font-semibold text-stone-900">Datos de la alerta</h2>
            <button
              type="button"
              onClick={() => ayuda.current?.showModal()}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-campo-700 ring-1 ring-campo-200 hover:bg-campo-50"
            >
              <span aria-hidden>ⓘ</span> Cómo llenar este formulario
            </button>
          </header>

          <div className="divide-y divide-stone-100">
            <Paso n={1} titulo="¿Qué problema?" onAyuda={() => ayuda.current?.showModal()}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-stone-500">Cultivo</span>
                  <select
                    className={claseCampo}
                    value={cultivo}
                    onChange={(e) => {
                      setCultivo(e.target.value)
                      setProblema(CATALOGO[e.target.value]?.[0]?.problema ?? '')
                    }}
                  >
                    {CULTIVOS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-stone-500">Plaga o enfermedad</span>
                  <select className={claseCampo} value={problema} onChange={(e) => setProblema(e.target.value)}>
                    {problemas.map((p) => (
                      <option key={p.problema} value={p.problema}>
                        {p.problema}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </Paso>

            <Paso n={2} titulo="¿Qué tan urgente?" onAyuda={() => ayuda.current?.showModal()}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Nivel">
                {(['alto', 'medio', 'bajo'] as Riesgo[]).map((n) => (
                  <label
                    key={n}
                    className={`flex cursor-pointer flex-col rounded-xl border-2 px-3 py-2.5 transition ${
                      nivel === n ? `${COLOR_NIVEL[n]} shadow-sm` : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold text-stone-900">
                      <input type="radio" name="nivel" checked={nivel === n} onChange={() => setNivel(n)} className="accent-campo-700" />
                      {RIESGOS[n].icono} Nivel {RIESGOS[n].texto.toLowerCase()}
                    </span>
                    <span className="mt-0.5 pl-6 text-xs text-stone-600">{DETALLE_NIVEL[n]}</span>
                  </label>
                ))}
              </div>
            </Paso>

            <Paso
              n={3}
              titulo="¿Dónde?"
              detalle={`${regiones.length} ${regiones.length === 1 ? 'región elegida' : 'regiones elegidas'}`}
              onAyuda={() => ayuda.current?.showModal()}
              extra={
                <button
                  type="button"
                  onClick={() => setRegiones([])}
                  className="text-xs font-semibold text-campo-700 hover:underline disabled:opacity-40"
                  disabled={!regiones.length}
                >
                  Quitar todas
                </button>
              }
            >
              <div className="flex flex-wrap gap-2">
                {LISTA_REGIONES.map((r) => {
                  const elegida = regiones.includes(r)
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={elegida}
                      onClick={() => alternar(r)}
                      className={`rounded-full px-3 py-1 text-sm font-medium ring-1 transition ${
                        elegida ? 'bg-campo-700 text-white ring-campo-700' : 'bg-white text-stone-700 ring-stone-200 hover:bg-campo-50 hover:ring-campo-300'
                      }`}
                    >
                      {elegida ? '✓ ' : '+ '}
                      {r}
                    </button>
                  )
                })}
              </div>
            </Paso>

            <Paso
              n={4}
              titulo="Mensaje a los productores"
              onAyuda={() => ayuda.current?.showModal()}
              extra={
                mensajeEditado !== null && (
                  <button type="button" onClick={() => setMensajeEditado(null)} className="text-xs font-semibold text-campo-700 hover:underline">
                    ↺ Usar mensaje sugerido
                  </button>
                )
              }
            >
              <textarea
                aria-label="Mensaje a los productores"
                className={`${claseCampo} min-h-[96px]`}
                value={mensaje}
                onChange={(e) => setMensajeEditado(e.target.value)}
              />
              <div className="mt-1 flex justify-between text-xs text-stone-500">
                <span>Frases cortas, trato de usted y sin tecnicismos.</span>
                <span className="tabular-nums">{mensaje.length} caracteres</span>
              </div>
            </Paso>
          </div>
        </section>

        {/* Vista previa y envío */}
        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-[#075e54] px-4 py-2.5 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm" aria-hidden>
                🌱
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">AGROFUTURO IA</span>
                <span className="block text-[11px] text-white/70">Vista previa en el celular</span>
              </span>
            </div>
            <div className="bg-chat-fondo p-3">
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[15px] leading-snug shadow-sm">
                {mensaje}
                <div className="mt-1 text-right text-[10px] text-stone-400">{fechaHora(new Date().toISOString())}</div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-stone-100 text-sm">
              <div className="bg-white px-4 py-2.5">
                <dt className="text-xs text-stone-500">Llegará a</dt>
                <dd className="text-xl font-bold tabular-nums text-stone-900">{alcance.toLocaleString('es-PE')}</dd>
                <dd className="text-[11px] text-stone-500">productores (simulado)</dd>
              </div>
              <div className="bg-white px-4 py-2.5">
                <dt className="text-xs text-stone-500">Nivel</dt>
                <dd className="mt-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${RIESGOS[nivel].clase}`}>
                    {RIESGOS[nivel].icono} {RIESGOS[nivel].texto}
                  </span>
                </dd>
                <dd className="mt-1 truncate text-[11px] text-stone-500">{regiones.length ? regiones.join(', ') : 'Sin regiones'}</dd>
              </div>
            </dl>
          </section>
          <button type="button" className={`${claseBoton.primario} w-full py-3 text-base`} disabled={!valido} onClick={emitir}>
            📣 Emitir alerta
          </button>
          {!regiones.length && <p className="text-center text-sm text-stone-500">Elija al menos una región para emitir.</p>}
        </aside>
      </div>

      {/* Ayuda: explica cada campo */}
      <dialog
        ref={ayuda}
        onClick={(e) => e.target === ayuda.current && ayuda.current.close()}
        className="m-auto max-h-[90dvh] w-[min(600px,92vw)] overflow-y-auto rounded-2xl p-0 shadow-2xl backdrop:bg-stone-900/40"
      >
        <div className="flex items-center justify-between bg-campo-700 px-5 py-3 text-white">
          <h2 className="font-semibold">ⓘ Cómo llenar la alerta</h2>
          <button type="button" onClick={() => ayuda.current?.close()} className="rounded-lg px-2 text-xl hover:bg-white/15" aria-label="Cerrar">
            ×
          </button>
        </div>
        <ol className="space-y-4 p-5 text-sm text-stone-700">
          {AYUDA.map((a, i) => (
            <li key={a.titulo} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-campo-100 font-bold text-campo-800">{i + 1}</span>
              <div>
                <div className="font-semibold text-stone-900">{a.titulo}</div>
                <p className="mt-0.5">{a.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-stone-100 px-5 py-3 text-right">
          <button type="button" onClick={() => ayuda.current?.close()} className={claseBoton.primario}>
            Entendido
          </button>
        </div>
      </dialog>
    </div>
  )
}

const DETALLE_NIVEL: Record<Riesgo, string> = {
  alto: 'Plaga confirmada o regulada. Actuar hoy.',
  medio: 'Casos aislados o clima favorable a la plaga.',
  bajo: 'Aviso preventivo, sin casos confirmados.',
}

const COLOR_NIVEL: Record<Riesgo, string> = {
  alto: 'border-red-400 bg-red-50',
  medio: 'border-orange-400 bg-orange-50',
  bajo: 'border-green-500 bg-green-50',
}

const AYUDA = [
  {
    titulo: 'Cultivo y plaga o enfermedad',
    texto: 'Elija el cultivo afectado y el problema confirmado. Solo recibirán la alerta los productores registrados con ese cultivo.',
  },
  {
    titulo: 'Nivel de urgencia',
    texto:
      'Alto: plaga confirmada o posible plaga regulada, hay que actuar hoy. Medio: casos aislados o clima que favorece la plaga. Bajo: aviso preventivo. El nivel define el color de la alerta en la plataforma.',
  },
  {
    titulo: 'Regiones',
    texto: 'Marque todas las regiones donde los productores deben estar atentos. La cifra "Llegará a" se actualiza según las regiones y el cultivo.',
  },
  {
    titulo: 'Mensaje',
    texto:
      'Se arma solo con el cultivo y la plaga elegidos, pero puede editarlo. Use frases cortas, trato de usted y diga qué hacer: qué revisar y a quién avisar. Con "Usar mensaje sugerido" vuelve al texto automático.',
  },
  {
    titulo: 'Emitir',
    texto: 'Al emitir, el mensaje se envía por WhatsApp (simulado) y la alerta aparece en la lista de alertas activas hasta que la cierre.',
  },
]

/** Sección numerada del formulario, con botón de ayuda */
function Paso({
  n,
  titulo,
  detalle,
  extra,
  onAyuda,
  children,
}: {
  n: number
  titulo: string
  detalle?: string
  extra?: ReactNode
  onAyuda: () => void
  children: ReactNode
}) {
  return (
    <div className="flex gap-4 px-5 py-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-campo-700 text-sm font-bold text-white">{n}</span>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-stone-900">{titulo}</h3>
          <button
            type="button"
            onClick={onAyuda}
            className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-stone-400 ring-1 ring-stone-300 hover:bg-campo-50 hover:text-campo-700 hover:ring-campo-400"
            aria-label={`Ayuda sobre: ${titulo}`}
            title="Ver ayuda"
          >
            i
          </button>
          {detalle && <span className="text-xs text-stone-500">· {detalle}</span>}
          <span className="ml-auto">{extra}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Filtro tipo píldora (mismo estilo que la bandeja); verde cuando tiene un valor */
function FiltroPildora({
  etiqueta,
  valor,
  onCambio,
  children,
}: {
  etiqueta: string
  valor: string
  onCambio: (v: string) => void
  children: ReactNode
}) {
  return (
    <label
      className={`inline-flex items-center gap-1 rounded-lg pl-3 text-sm ring-1 transition max-sm:min-w-[calc(50%-0.25rem)] max-sm:flex-1 ${
        valor ? 'bg-campo-50 ring-campo-600' : 'bg-stone-50 ring-stone-200 hover:ring-stone-300'
      }`}
    >
      <span className="text-stone-500">{etiqueta}:</span>
      <select
        className="min-w-0 flex-1 cursor-pointer rounded-lg border-0 bg-transparent py-2 pl-1 pr-8 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-campo-200"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
      >
        <option value="">Todos</option>
        {children}
      </select>
    </label>
  )
}

/** Botones de una alerta: ver el caso de origen y cerrarla (solo SENASA) */
function Acciones({ alerta: a }: { alerta: Alerta }) {
  const { despachar, avisar, rol } = useEstado()
  return (
    <span className="flex justify-end gap-2 text-xs" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      {a.casoOrigen && (
        <Enlace
          a={`casos/${a.casoOrigen}`}
          className="whitespace-nowrap rounded-lg px-2 py-1 font-semibold text-campo-700 ring-1 ring-stone-200 hover:bg-campo-50"
        >
          Ver caso →
        </Enlace>
      )}
      {a.estado === 'activa' && rol !== 'tecnico' && (
        <button
          type="button"
          className="whitespace-nowrap rounded-lg px-2 py-1 font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-200"
          onClick={() => {
            despachar({ tipo: 'cerrarAlerta', id: a.id })
            avisar(`Alerta ${a.id} cerrada.`)
          }}
        >
          Cerrar alerta
        </button>
      )}
    </span>
  )
}
