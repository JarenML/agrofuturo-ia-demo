import { useMemo, useState } from 'react'
import { CULTIVOS, LISTA_REGIONES, type EstadoCasoSenasa, type Riesgo } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import {
  ESTADOS,
  EncabezadoPagina,
  FilasVacias,
  Paginacion,
  InsigniaEstado,
  InsigniaRiesgo,
  abierto,
  diagnosticoVigente,
  enSenasa,
  etapaActual,
  haceCuanto,
  ir,
  usePaginacion,
} from '../ui/comun'

type Pestana = 'abiertos' | EstadoCasoSenasa | 'en_senasa' | 'todos'

const PESTANAS_TECNICO: { id: Pestana; texto: string }[] = [
  { id: 'abiertos', texto: 'Abiertos' },
  { id: 'por_validar', texto: ESTADOS.por_validar.texto },
  { id: 'en_senasa', texto: 'Derivados a SENASA' },
  { id: 'seguimiento', texto: ESTADOS.seguimiento.texto },
  { id: 'cerrado', texto: 'Cerrados' },
  { id: 'todos', texto: 'Todos' },
]

const PESTANAS_SENASA: { id: Pestana; texto: string }[] = [
  { id: 'abiertos', texto: 'Abiertos' },
  { id: 'por_revisar', texto: ESTADOS.por_revisar.texto },
  { id: 'en_revision', texto: ESTADOS.en_revision.texto },
  { id: 'inspeccion', texto: 'Inspección' },
  { id: 'seguimiento', texto: ESTADOS.seguimiento.texto },
  { id: 'cerrado', texto: 'Cerrados' },
  { id: 'descartado', texto: 'Descartados' },
  { id: 'todos', texto: 'Todos' },
]


const ORDEN_RIESGO: Record<Riesgo, number> = { alto: 0, medio: 1, bajo: 2 }

export default function Bandeja({ consulta }: { consulta: URLSearchParams }) {
  const { misCasos: casos, rol, usuario } = useEstado()
  const esTecnico = rol === 'tecnico'
  const PESTANAS = esTecnico ? PESTANAS_TECNICO : PESTANAS_SENASA
  const [pestana, setPestana] = useState<Pestana>((consulta.get('estado') as Pestana) || 'abiertos')
  const [texto, setTexto] = useState(consulta.get('q') ?? '')
  const [cultivo, setCultivo] = useState(consulta.get('cultivo') ?? '')
  const [region, setRegion] = useState(consulta.get('region') ?? '')
  const [riesgo, setRiesgo] = useState(consulta.get('riesgo') ?? '')
  const [soloMios, setSoloMios] = useState(false)
  const [orden, setOrden] = useState<'reciente' | 'riesgo' | 'confianza'>('riesgo')

  const pasaFiltros = (c: (typeof casos)[number]) => {
    const q = texto.trim().toLowerCase()
    return (
      (!q ||
        [c.id, c.productor, c.distrito, c.provincia, c.region, c.prediagnostico.problema, c.cultivo]
          .join(' ')
          .toLowerCase()
          .includes(q)) &&
      (!cultivo || c.cultivo === cultivo) &&
      (!region || c.region === region) &&
      (!riesgo || c.riesgo === riesgo) &&
      (!soloMios || c.asignadoA === usuario.nombre)
    )
  }

  const enPestana = (c: (typeof casos)[number], p: Pestana) =>
    p === 'todos' ? true : p === 'abiertos' ? abierto(c) : p === 'en_senasa' ? enSenasa(c) : c.estado === p

  const filtrados = useMemo(() => {
    const lista = casos.filter((c) => pasaFiltros(c) && enPestana(c, pestana))
    return lista.sort((a, b) => {
      if (orden === 'riesgo') return ORDEN_RIESGO[a.riesgo] - ORDEN_RIESGO[b.riesgo] || b.fecha.localeCompare(a.fecha)
      if (orden === 'confianza') return a.prediagnostico.confianza - b.prediagnostico.confianza
      return b.fecha.localeCompare(a.fecha)
    })
  }, [casos, pestana, texto, cultivo, region, riesgo, soloMios, orden])

  // La página vuelve a 1 cuando cambia la pestaña, un filtro o el orden
  const claveFiltros = [pestana, texto, cultivo, region, riesgo, soloMios, orden].join('|')
  const pag = usePaginacion(filtrados, claveFiltros)

  const hayFiltros = texto || cultivo || region || riesgo || soloMios
  const limpiar = () => {
    setTexto('')
    setCultivo('')
    setRegion('')
    setRiesgo('')
    setSoloMios(false)
  }

  return (
    <div>
      {/* ponytail: fijo solo en lg, igual que el panel; en móvil ocuparía la pantalla */}
      <div className="lg:sticky lg:top-16 lg:z-30 lg:-mx-8 lg:-mt-6 lg:bg-campo-50 lg:px-8 lg:pt-6">
      <EncabezadoPagina
        icono={esTecnico ? '🧑‍🌾' : '📥'}
        titulo={esTecnico ? 'Mis casos' : 'Bandeja de casos'}
        sub={
          esTecnico
            ? `Casos de los productores de su zona. Llegan aquí apenas la IA termina el prediagnóstico.`
            : 'Casos derivados por los técnicos de las Agencias Agrarias después del prediagnóstico de la IA.'
        }
      />

      {/* Pestañas por estado */}
      <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto pb-1" role="tablist">
        {PESTANAS.map((p) => {
          const n = casos.filter((c) => pasaFiltros(c) && enPestana(c, p.id)).length
          const activa = p.id === pestana
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setPestana(p.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activa ? 'bg-campo-700 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-campo-50'
              }`}
            >
              {p.texto}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  activa ? 'bg-white/20' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {n}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
        <label className="relative w-full sm:w-auto sm:min-w-[240px] sm:flex-1">
          <span className="sr-only">Buscar</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="w-full rounded-lg border border-transparent bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-campo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campo-200"
            placeholder="Buscar por código, productor, distrito o problema"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <Selector etiqueta="Cultivo" valor={cultivo} onCambio={setCultivo} opciones={CULTIVOS} />
        {!esTecnico && <Selector etiqueta="Región" valor={region} onCambio={setRegion} opciones={LISTA_REGIONES} />}
        <Selector
          etiqueta="Riesgo"
          valor={riesgo}
          onCambio={setRiesgo}
          opciones={['alto', 'medio', 'bajo']}
          textos={{ alto: 'Alto', medio: 'Medio', bajo: 'Bajo' }}
        />
        <label className={claseFiltro(false)}>
          <span className="text-stone-500">Ordenar:</span>
          <select className={claseSelect} value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)}>
            <option value="riesgo">Mayor riesgo</option>
            <option value="reciente">Más recientes</option>
            <option value="confianza">Menor confianza IA</option>
          </select>
        </label>
        {!esTecnico && (
          <label className={`${claseFiltro(soloMios)} cursor-pointer gap-2 pr-3`}>
            <input
              type="checkbox"
              checked={soloMios}
              onChange={(e) => setSoloMios(e.target.checked)}
              className="h-4 w-4 accent-campo-700"
            />
            Asignados a mí
          </label>
        )}
        {hayFiltros && (
          <button type="button" onClick={limpiar} className="rounded-lg px-2 py-2 text-sm font-semibold text-campo-700 hover:bg-campo-50">
            ✕ Limpiar
          </button>
        )}
      </div>
      </div>

      {/* Tabla (en móvil, lista de tarjetas con los mismos datos) */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <ul className="divide-y divide-stone-100 sm:hidden">
          {pag.visibles.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => ir(`casos/${c.id}`)} className="flex w-full gap-3 px-4 py-3 text-left active:bg-campo-50">
                <FotoCaso foto={c.foto} className="h-12 w-12 shrink-0 rounded-md ring-1 ring-stone-200" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-stone-900">{c.id}</span>
                    <span className="shrink-0 text-xs text-stone-500">{haceCuanto(c.fecha)}</span>
                  </span>
                  <span className="block text-sm font-medium text-stone-900">
                    {c.cultivo} · {diagnosticoVigente(c).problema}
                  </span>
                  <span className="block text-xs text-stone-500">
                    {c.distrito}, {c.region} · {c.productor}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <InsigniaRiesgo riesgo={c.riesgo} />
                    <InsigniaEstado estado={c.estado} />
                  </span>
                  {c.plagaRegulada && <span className="mt-1 block text-xs font-semibold text-red-700">⚠ Posible plaga regulada</span>}
                </span>
              </button>
            </li>
          ))}
          {filtrados.length === 0 && <li className="px-4 py-10 text-center text-stone-500">No hay casos con estos filtros.</li>}
        </ul>
        <table className="w-full text-left max-sm:hidden">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Caso</th>
              <th className="hidden px-4 py-3 lg:table-cell">Ubicación</th>
              <th className="px-4 py-3">Diagnóstico</th>
              <th className="px-4 py-3">Riesgo</th>
              <th className="hidden px-4 py-3 md:table-cell">Estado</th>
              <th className="hidden px-4 py-3 xl:table-cell">Etapa</th>
            </tr>
          </thead>
          <tbody ref={pag.refFilas} style={pag.estiloFilas} className="divide-y divide-stone-100">
            {pag.visibles.map((c) => {
              const etapa = Math.min(etapaActual(c), 6)
              return (
                <tr
                  key={c.id}
                  onClick={() => ir(`casos/${c.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && ir(`casos/${c.id}`)}
                  tabIndex={0}
                  className="h-[var(--alto-fila)] cursor-pointer align-top hover:bg-campo-50 focus:bg-campo-50 focus:outline-none"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FotoCaso foto={c.foto} className="h-11 w-11 shrink-0 rounded-md ring-1 ring-stone-200" />
                      <div>
                        <div className="whitespace-nowrap font-semibold text-stone-900">{c.id}</div>
                        <div className="text-sm text-stone-500">{haceCuanto(c.fecha)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="text-stone-900">
                      {c.distrito}, {c.region}
                    </div>
                    <div className="text-sm text-stone-500">{c.productor}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">
                      {c.cultivo} · {diagnosticoVigente(c).problema}
                    </div>
                    <div className="text-sm text-stone-500">
                      {c.dictamen
                        ? c.dictamen.tipo === 'corregido'
                          ? 'Corregido por SENASA'
                          : c.dictamen.tipo === 'descartado'
                            ? 'Descartado por SENASA'
                            : 'Confirmado por SENASA'
                        : c.estado === 'por_validar'
                          ? `Prediagnóstico IA ${c.prediagnostico.confianza} % · falta validar`
                          : c.correccionTecnico
                            ? 'Corregido por el técnico'
                            : `Confianza IA ${c.prediagnostico.confianza} %`}
                      {c.plagaRegulada && <span className="ml-2 font-semibold text-red-700">⚠ Posible plaga regulada</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <InsigniaRiesgo riesgo={c.riesgo} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <InsigniaEstado estado={c.estado} />
                    {c.asignadoA && <div className="mt-1 text-xs text-stone-500">{c.asignadoA}</div>}
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <div className="flex gap-0.5" title={`Etapa ${Math.min(etapa + 1, 6)} de 6`}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-4 rounded-sm ${
                            i < etapa ? 'bg-campo-600' : i === etapa && c.estado !== 'descartado' ? 'bg-amber-400' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                  No hay casos con estos filtros.
                </td>
              </tr>
            )}
            <FilasVacias cantidad={pag.porPagina - pag.visibles.length - (filtrados.length === 0 ? 1 : 0)} columnas={6} />
          </tbody>
        </table>
        <Paginacion p={pag} unidad="casos" />

      </div>
    </div>
  )
}

function Selector({
  etiqueta,
  valor,
  onCambio,
  opciones,
  textos,
}: {
  etiqueta: string
  valor: string
  onCambio: (v: string) => void
  opciones: string[]
  textos?: Record<string, string>
}) {
  return (
    <label className={claseFiltro(!!valor)}>
      <span className="text-stone-500">{etiqueta}:</span>
      <select className={claseSelect} value={valor} onChange={(e) => onCambio(e.target.value)}>
        <option value="">Todos</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {textos?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Píldora de filtro; se resalta en verde cuando tiene un valor elegido */
const claseFiltro = (activo: boolean) =>
  `inline-flex items-center gap-1 rounded-lg pl-3 text-sm ring-1 transition max-sm:min-w-[calc(50%-0.25rem)] max-sm:flex-1 ${
    activo ? 'bg-campo-50 ring-campo-600' : 'bg-stone-50 ring-stone-200 hover:ring-stone-300'
  }`

const claseSelect = 'min-w-0 flex-1 cursor-pointer rounded-lg border-0 bg-transparent py-2 pl-1 pr-8 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-campo-200'

