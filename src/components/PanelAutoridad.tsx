import { INDICADORES_BASE, PUNTOS_MAPA, type PuntoMapa } from '../data/guion'
import MapaPeru from './MapaPeru'

interface Props {
  huancavelicaVerde: boolean
  rosaValidado: boolean
}

export default function PanelAutoridad({ huancavelicaVerde, rosaValidado }: Props) {
  const puntos: PuntoMapa[] = PUNTOS_MAPA.map((p) =>
    p.id === 'huancavelica' ? { ...p, estado: huancavelicaVerde ? 'cerrado' : 'alto' } : p,
  )

  const indicadores = [
    { etiqueta: 'Casos atendidos', valor: INDICADORES_BASE.atendidos + 1, icono: '📋' },
    { etiqueta: 'Casos validados', valor: INDICADORES_BASE.validados + (rosaValidado ? 1 : 0), icono: '✅' },
    { etiqueta: 'Alertas activas', valor: INDICADORES_BASE.alertas - (huancavelicaVerde ? 1 : 0), icono: '⚠️' },
  ]

  return (
    <div className="aparecer rounded-2xl border border-campo-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold uppercase tracking-wide text-campo-700">
        Tablero de la autoridad · Vigilancia fitosanitaria nacional
      </div>
      <h3 className="text-2xl font-bold text-stone-900">Casos en el territorio</h3>

      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="mx-auto aspect-[490/380] w-full max-w-[420px]">
          <MapaPeru puntos={puntos} destacado="huancavelica" />
        </div>

        <div className="space-y-4">
          {indicadores.map((i) => (
            <div key={i.etiqueta} className="flex items-center gap-4 rounded-xl bg-campo-50 p-4 ring-1 ring-campo-100">
              <div className="text-3xl">{i.icono}</div>
              <div>
                <div className="text-3xl font-extrabold text-campo-800 tabular-nums">
                  {i.valor.toLocaleString('es-PE')}
                </div>
                <div className="text-stone-600">
                  {i.etiqueta}{' '}
                  <span className="ml-1 rounded bg-tierra-200 px-1.5 py-0.5 text-xs font-semibold uppercase text-tierra-700">
                    simulado
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-stone-200 p-4">
            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Leyenda</div>
            <ul className="space-y-1.5 text-lg">
              <Leyenda color="bg-red-600" icono="!" texto="Riesgo alto, en atención" />
              <Leyenda color="bg-amber-600" icono="…" texto="En seguimiento" />
              <Leyenda color="bg-green-600" icono="✓" texto="Caso cerrado" />
            </ul>
          </div>

          {huancavelicaVerde && (
            <div className="aparecer rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-lg text-green-800">
              🟢 Huancavelica: el caso de rancha en papa fue atendido y cerrado.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Leyenda({ color, icono, texto }: { color: string; icono: string; texto: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
        {icono}
      </span>
      {texto}
    </li>
  )
}
