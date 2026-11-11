import { useMemo, useState } from 'react'
import { CULTIVOS, LISTA_REGIONES, USUARIO, type EstadoCasoSenasa, type Riesgo } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import {
  ESTADOS,
  EncabezadoPagina,
  InsigniaEstado,
  InsigniaRiesgo,
  abierto,
  claseCampo,
  etapaActual,
  haceCuanto,
  ir,
} from '../ui/comun'

type Pestana = 'abiertos' | EstadoCasoSenasa | 'todos'

const PESTANAS: { id: Pestana; texto: string }[] = [
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
  const { casos } = useEstado()
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
      (!soloMios || c.asignadoA === USUARIO.nombre)
    )
  }

  const enPestana = (c: (typeof casos)[number], p: Pestana) =>
    p === 'todos' ? true : p === 'abiertos' ? abierto(c) : c.estado === p

  const filtrados = useMemo(() => {
    const lista = casos.filter((c) => pasaFiltros(c) && enPestana(c, pestana))
    return lista.sort((a, b) => {
      if (orden === 'riesgo') return ORDEN_RIESGO[a.riesgo] - ORDEN_RIESGO[b.riesgo] || b.fecha.localeCompare(a.fecha)
      if (orden === 'confianza') return a.prediagnostico.confianza - b.prediagnostico.confianza
      return b.fecha.localeCompare(a.fecha)
    })
  }, [casos, pestana, texto, cultivo, region, riesgo, soloMios, orden])

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
      <EncabezadoPagina
        titulo="Bandeja de casos"
        sub="Casos derivados por los técnicos de las Agencias Agrarias después del prediagnóstico de la IA."
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
      <div className="mb-4 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Buscar</span>
          <input
            className={claseCampo}
            placeholder="Código, productor, distrito o problema"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <Selector etiqueta="Cultivo" valor={cultivo} onCambio={setCultivo} opciones={CULTIVOS} />
        <Selector etiqueta="Región" valor={region} onCambio={setRegion} opciones={LISTA_REGIONES} />
        <Selector
          etiqueta="Riesgo"
          valor={riesgo}
          onCambio={setRiesgo}
          opciones={['alto', 'medio', 'bajo']}
          textos={{ alto: 'Alto', medio: 'Medio', bajo: 'Bajo' }}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Ordenar por</span>
          <select className={claseCampo} value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)}>
            <option value="riesgo">Mayor riesgo</option>
            <option value="reciente">Más recientes</option>
            <option value="confianza">Menor confianza IA</option>
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-5">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={soloMios}
              onChange={(e) => setSoloMios(e.target.checked)}
              className="h-4 w-4 accent-campo-700"
            />
            Solo casos asignados a mí
          </label>
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="text-sm font-semibold text-campo-700 hover:underline">
              Limpiar filtros
            </button>
          )}
          <span className="ml-auto text-sm text-stone-500">{filtrados.length} casos</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Caso</th>
              <th className="hidden px-4 py-3 lg:table-cell">Ubicación</th>
              <th className="px-4 py-3">Prediagnóstico IA</th>
              <th className="px-4 py-3">Riesgo</th>
              <th className="hidden px-4 py-3 md:table-cell">Estado</th>
              <th className="hidden px-4 py-3 xl:table-cell">Etapa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtrados.map((c) => {
              const etapa = Math.min(etapaActual(c), 6)
              return (
                <tr
                  key={c.id}
                  onClick={() => ir(`casos/${c.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && ir(`casos/${c.id}`)}
                  tabIndex={0}
                  className="cursor-pointer align-top hover:bg-campo-50 focus:bg-campo-50 focus:outline-none"
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
                      {c.cultivo} · {c.dictamen?.problema ?? c.prediagnostico.problema}
                    </div>
                    <div className="text-sm text-stone-500">
                      {c.dictamen
                        ? c.dictamen.tipo === 'corregido'
                          ? 'Corregido por SENASA'
                          : c.dictamen.tipo === 'descartado'
                            ? 'Descartado por SENASA'
                            : 'Confirmado por SENASA'
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
          </tbody>
        </table>
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
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">{etiqueta}</span>
      <select className={claseCampo} value={valor} onChange={(e) => onCambio(e.target.value)}>
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
