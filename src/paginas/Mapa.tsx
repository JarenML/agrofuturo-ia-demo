import { useState, type ReactNode } from 'react'
import MapaVigilancia, { COLORES, LeyendaMapa, resumenRegiones } from '../components/MapaVigilancia'
import { CULTIVOS, REGIONES } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import { EncabezadoPagina, InsigniaEstado, InsigniaRiesgo, claseBoton, haceCuanto, ir } from '../ui/comun'

export default function Mapa({ consulta }: { consulta: URLSearchParams }) {
  const { misCasos: casos, alertas } = useEstado()
  const [cultivo, setCultivo] = useState('')
  const [riesgo, setRiesgo] = useState('')
  const [region, setRegion] = useState<string | null>(consulta.get('region'))

  const filtrados = casos.filter((c) => (!cultivo || c.cultivo === cultivo) && (!riesgo || c.riesgo === riesgo))
  const resumen = resumenRegiones(filtrados)
  const casosRegion = region ? filtrados.filter((c) => c.region === region && c.estado !== 'descartado') : []
  const alertasRegion = region ? alertas.filter((a) => a.estado === 'activa' && a.regiones.includes(region)) : []
  const maxAbiertos = Math.max(1, ...resumen.map((r) => r.abiertos))
  const totales = {
    regiones: resumen.filter((r) => r.abiertos > 0).length,
    abiertos: resumen.reduce((s, r) => s + r.abiertos, 0),
    altos: resumen.reduce((s, r) => s + r.altos, 0),
  }

  return (
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-7rem)]">
      <EncabezadoPagina
        icono="🗺️"
        titulo="Mapa de vigilancia"
        sub="Casos reportados por productores y derivados por las Agencias Agrarias, agrupados por región."
        accion={
          <div className="flex flex-wrap gap-2">
            <Filtro etiqueta="Cultivo" valor={cultivo} onCambio={setCultivo}>
              {CULTIVOS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Filtro>
            <Filtro etiqueta="Riesgo" valor={riesgo} onCambio={setRiesgo}>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </Filtro>
          </div>
        }
      />

      <div className="-mt-2 grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Mapa: ocupa todo el bloque; cifras y leyenda flotan encima */}
        <section className="relative min-h-[420px] overflow-hidden rounded-xl border border-stone-200 bg-[#eef3e6] shadow-sm">
          <div className="absolute inset-0 px-2 pb-24 pt-14 sm:p-4 sm:pb-16">
            <MapaVigilancia casos={filtrados} seleccionada={region} onSeleccionar={setRegion} />
          </div>
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Cifra valor={totales.abiertos} texto="casos abiertos" />
            <Cifra valor={totales.altos} texto="de riesgo alto" rojo />
            <Cifra valor={totales.regiones} texto="regiones con casos" />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur [&_ul]:text-xs">
            <LeyendaMapa />
            <span className="text-xs font-medium text-campo-800 max-sm:hidden">👆 Haga clic en una región para ver sus casos</span>
          </div>
        </section>

        {/* Panel lateral con scroll propio */}
        <section className="flex min-h-0 flex-col rounded-xl border border-stone-200 bg-white shadow-sm">
          {region ? (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
                <div>
                  <h2 className="font-semibold text-stone-900">Región {region}</h2>
                  <p className="text-xs text-stone-500">
                    {REGIONES[region]?.productores.toLocaleString('es-PE')} productores registrados (simulado)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegion(null)}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-campo-700 hover:bg-campo-50"
                >
                  ← Todas
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {alertasRegion.length > 0 && (
                  <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    📣 Alerta activa: {alertasRegion.map((a) => a.titulo).join(' · ')}
                  </div>
                )}
                <ul className="-mx-2 divide-y divide-stone-100">
                  {casosRegion.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => ir(`casos/${c.id}`)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-campo-50"
                      >
                        <FotoCaso foto={c.foto} className="h-11 w-11 shrink-0 rounded-md ring-1 ring-stone-200" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-stone-900">
                            {c.cultivo} · {c.dictamen?.problema ?? c.prediagnostico.problema}
                          </div>
                          <div className="truncate text-xs text-stone-500">
                            {c.distrito} · {c.id} · {haceCuanto(c.fecha)}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <InsigniaRiesgo riesgo={c.riesgo} />
                            <InsigniaEstado estado={c.estado} />
                          </div>
                        </div>
                        <span className="text-stone-400" aria-hidden>
                          ›
                        </span>
                      </button>
                    </li>
                  ))}
                  {casosRegion.length === 0 && <li className="py-6 text-center text-sm text-stone-500">Sin casos con estos filtros.</li>}
                </ul>
              </div>
              <div className="border-t border-stone-100 p-3">
                <button
                  type="button"
                  onClick={() => ir(`casos?region=${encodeURIComponent(region)}&estado=todos`)}
                  className={`${claseBoton.primario} w-full`}
                >
                  Ver en la bandeja →
                </button>
              </div>
            </>
          ) : (
            <>
              <header className="border-b border-stone-100 px-4 py-3">
                <h2 className="font-semibold text-stone-900">Resumen por región</h2>
                <p className="text-xs text-stone-500">Ordenado por urgencia. Elija una región para ver sus casos.</p>
              </header>
              <ul className="min-h-0 flex-1 divide-y divide-stone-100 overflow-y-auto px-2 py-1">
                {resumen.map((r) => (
                  <li key={r.region}>
                    <button
                      type="button"
                      onClick={() => setRegion(r.region)}
                      className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-campo-50"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: COLORES[r.color].relleno }}
                        aria-hidden
                      >
                        {COLORES[r.color].icono}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-stone-900">{r.region}</span>
                          <span className="shrink-0 text-xs text-stone-500">
                            <strong className="tabular-nums text-stone-900">{r.abiertos}</strong> abiertos
                            {r.altos > 0 && <span className="ml-1.5 font-semibold text-red-700">· {r.altos} alto</span>}
                          </span>
                        </span>
                        <span className="mt-1 block h-1.5 rounded-full bg-stone-100">
                          <span
                            className="block h-1.5 rounded-full"
                            style={{ width: `${(r.abiertos / maxAbiertos) * 100}%`, background: COLORES[r.color].relleno }}
                          />
                        </span>
                      </span>
                      <span className="text-stone-300 group-hover:text-campo-700" aria-hidden>
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function Cifra({ valor, texto, rojo = false }: { valor: number; texto: string; rojo?: boolean }) {
  return (
    <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs text-stone-600 shadow-sm backdrop-blur">
      <strong className={`mr-1 text-base tabular-nums ${rojo ? 'text-red-700' : 'text-stone-900'}`}>{valor}</strong>
      {texto}
    </span>
  )
}

/** Filtro tipo píldora (mismo estilo que la bandeja); verde cuando tiene un valor */
function Filtro({ etiqueta, valor, onCambio, children }: { etiqueta: string; valor: string; onCambio: (v: string) => void; children: ReactNode }) {
  return (
    <label
      className={`inline-flex items-center gap-1 rounded-lg pl-3 text-sm ring-1 transition ${
        valor ? 'bg-campo-50 ring-campo-600' : 'bg-white ring-stone-200 hover:ring-stone-300'
      }`}
    >
      <span className="text-stone-500">{etiqueta}:</span>
      <select
        className="cursor-pointer rounded-lg border-0 bg-transparent py-2 pl-1 pr-8 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-campo-200"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
      >
        <option value="">Todos</option>
        {children}
      </select>
    </label>
  )
}
