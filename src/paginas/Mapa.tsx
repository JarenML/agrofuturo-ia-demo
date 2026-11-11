import { useState } from 'react'
import MapaVigilancia, { COLORES, LeyendaMapa, resumenRegiones } from '../components/MapaVigilancia'
import { CULTIVOS, REGIONES } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import { EncabezadoPagina, InsigniaEstado, InsigniaRiesgo, Tarjeta, claseBoton, claseCampo, haceCuanto, ir } from '../ui/comun'

export default function Mapa({ consulta }: { consulta: URLSearchParams }) {
  const { misCasos: casos, alertas } = useEstado()
  const [cultivo, setCultivo] = useState('')
  const [riesgo, setRiesgo] = useState('')
  const [region, setRegion] = useState<string | null>(consulta.get('region'))

  const filtrados = casos.filter((c) => (!cultivo || c.cultivo === cultivo) && (!riesgo || c.riesgo === riesgo))
  const resumen = resumenRegiones(filtrados)
  const casosRegion = region ? filtrados.filter((c) => c.region === region && c.estado !== 'descartado') : []
  const alertasRegion = region ? alertas.filter((a) => a.estado === 'activa' && a.regiones.includes(region)) : []

  return (
    <div>
      <EncabezadoPagina
        titulo="Mapa de vigilancia"
        sub="Casos reportados por productores y derivados por las Agencias Agrarias, agrupados por región."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block w-44">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Cultivo</span>
          <select className={claseCampo} value={cultivo} onChange={(e) => setCultivo(e.target.value)}>
            <option value="">Todos</option>
            {CULTIVOS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block w-44">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Riesgo</span>
          <select className={claseCampo} value={riesgo} onChange={(e) => setRiesgo(e.target.value)}>
            <option value="">Todos</option>
            <option value="alto">Alto</option>
            <option value="medio">Medio</option>
            <option value="bajo">Bajo</option>
          </select>
        </label>
        <div className="pb-2">
          <LeyendaMapa />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <Tarjeta>
          <div className="mx-auto aspect-[470/380] max-w-[760px]">
            <MapaVigilancia casos={filtrados} seleccionada={region} onSeleccionar={setRegion} />
          </div>
          <p className="mt-2 text-center text-sm text-stone-500">Haga clic en una región para ver sus casos.</p>
        </Tarjeta>

        {region ? (
          <Tarjeta
            titulo={`Región ${region}`}
            accion={
              <button type="button" onClick={() => setRegion(null)} className="text-sm font-semibold text-campo-700 hover:underline">
                Ver todas
              </button>
            }
          >
            <div className="mb-4 text-sm text-stone-600">
              {REGIONES[region]?.productores.toLocaleString('es-PE')} productores registrados en AGROFUTURO IA (simulado)
            </div>
            {alertasRegion.length > 0 && (
              <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                📣 Alerta activa: {alertasRegion.map((a) => a.titulo).join(' · ')}
              </div>
            )}
            <ul className="-my-2 divide-y divide-stone-100">
              {casosRegion.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => ir(`casos/${c.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left hover:bg-campo-50"
                  >
                    <FotoCaso foto={c.foto} className="h-12 w-12 shrink-0 rounded-md ring-1 ring-stone-200" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-stone-900">
                        {c.cultivo} · {c.dictamen?.problema ?? c.prediagnostico.problema}
                      </div>
                      <div className="text-sm text-stone-500">
                        {c.distrito} · {c.id} · {haceCuanto(c.fecha)}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <InsigniaRiesgo riesgo={c.riesgo} />
                        <InsigniaEstado estado={c.estado} />
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {casosRegion.length === 0 && <li className="py-6 text-center text-stone-500">Sin casos con estos filtros.</li>}
            </ul>
            <button type="button" onClick={() => ir(`casos?region=${encodeURIComponent(region)}&estado=todos`)} className={`${claseBoton.secundario} mt-4 w-full`}>
              Ver en la bandeja
            </button>
          </Tarjeta>
        ) : (
          <Tarjeta titulo="Resumen por región">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="pb-2">Región</th>
                  <th className="pb-2 text-right">Abiertos</th>
                  <th className="pb-2 text-right">Riesgo alto</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {resumen.map((r) => (
                  <tr key={r.region} onClick={() => setRegion(r.region)} className="cursor-pointer hover:bg-campo-50">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ background: COLORES[r.color].relleno }}
                          aria-hidden
                        >
                          {COLORES[r.color].icono}
                        </span>
                        {r.region}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{r.abiertos}</td>
                    <td className="py-2 text-right tabular-nums">{r.altos}</td>
                    <td className="py-2 text-right tabular-nums text-stone-500">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tarjeta>
        )}
      </div>
    </div>
  )
}
