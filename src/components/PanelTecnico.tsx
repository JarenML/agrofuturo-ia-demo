import { CASO_ROSA, PASOS_ANALISIS, type EstadoCaso } from '../data/guion'
import { HojaEnferma, HojaSana } from '../ilustraciones/Ilustraciones'
import { Estado, EtiquetaRiesgo } from './EtiquetaRiesgo'

const ORDEN: EstadoCaso[] = [
  'sin_caso',
  'nuevo',
  'analizando',
  'prediagnostico',
  'por_validar',
  'validado',
  'seguimiento',
  'cerrado',
]
const alMenos = (actual: EstadoCaso, minimo: EstadoCaso) => ORDEN.indexOf(actual) >= ORDEN.indexOf(minimo)

const ESTADO_VISIBLE: Record<EstadoCaso, { texto: string; tono: 'gris' | 'ambar' | 'azul' | 'verde' }> = {
  sin_caso: { texto: '', tono: 'gris' },
  nuevo: { texto: 'Nuevo', tono: 'azul' },
  analizando: { texto: 'IA analizando', tono: 'azul' },
  prediagnostico: { texto: 'Prediagnóstico listo', tono: 'ambar' },
  por_validar: { texto: 'Pendiente de validar', tono: 'ambar' },
  validado: { texto: 'Validado', tono: 'verde' },
  seguimiento: { texto: 'En seguimiento', tono: 'azul' },
  cerrado: { texto: 'Caso cerrado', tono: 'verde' },
}

interface Props {
  estado: EstadoCaso
  /** cuántos de los 4 pasos de análisis están marcados */
  pasosMarcados: number
  onValidar: () => void
}

export default function PanelTecnico({ estado, pasosMarcados, onValidar }: Props) {
  if (estado === 'sin_caso') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-campo-200 bg-white/60 p-10 text-center text-stone-500">
        <div className="text-5xl">📥</div>
        <div className="text-xl font-semibold">Bandeja del técnico agrario</div>
        <div className="text-lg">Sin casos nuevos por ahora.</div>
        <div className="text-sm">Cuando un productor envíe una foto, el caso aparecerá aquí.</div>
      </div>
    )
  }

  const e = ESTADO_VISIBLE[estado]
  const conPrediagnostico = alMenos(estado, 'prediagnostico')
  const validado = alMenos(estado, 'validado')

  return (
    <div className="aparecer rounded-2xl border border-campo-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-campo-700">
            {estado === 'nuevo' ? '🔔 Nuevo caso' : 'Caso SINAVIFA'}
          </div>
          <h3 className="text-2xl font-bold text-stone-900">
            Nuevo caso — {CASO_ROSA.cultivo} — {CASO_ROSA.region}
          </h3>
          <div className="text-stone-600">
            {CASO_ROSA.agricultora} · Distrito de {CASO_ROSA.distrito}
          </div>
        </div>
        <Estado texto={e.texto} tono={e.tono} />
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">
        <div>
          <HojaEnferma className="h-44 w-44 rounded-xl ring-1 ring-stone-200" />
          <div className="mt-1 text-sm text-stone-500">Foto enviada por la productora</div>
          {alMenos(estado, 'cerrado') && (
            <div className="aparecer mt-3">
              <HojaSana className="h-44 w-44 rounded-xl ring-2 ring-green-500" />
              <div className="mt-1 text-sm font-semibold text-green-700">Foto de seguimiento (día 7)</div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Pasos del análisis de la IA */}
          <div>
            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Análisis de la IA
            </div>
            <ul className="space-y-1.5">
              {PASOS_ANALISIS.map((p, i) => {
                const hecho = i < pasosMarcados
                return (
                  <li key={p} className="flex items-center gap-3 text-lg">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        hecho ? 'marcar bg-campo-600 text-white' : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {hecho ? '✔' : i + 1}
                    </span>
                    <span className={hecho ? 'text-stone-900' : 'text-stone-400'}>{p}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Prediagnóstico */}
          {conPrediagnostico && (
            <div className="aparecer rounded-xl bg-tierra-100 p-4">
              <div className="text-sm font-semibold uppercase tracking-wide text-tierra-700">
                Prediagnóstico de la IA (por validar)
              </div>
              <div className="mt-1 text-xl font-bold text-stone-900">{CASO_ROSA.problema}</div>
              <div className="text-sm italic text-stone-600">{CASO_ROSA.agente}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <EtiquetaRiesgo nivel={CASO_ROSA.riesgo} />
                <span className="text-stone-600">Confianza: {CASO_ROSA.confianza}</span>
              </div>
              <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-stone-700">
                {CASO_ROSA.recomendaciones.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Validación humana */}
          {conPrediagnostico && (
            <div className="flex flex-wrap items-center gap-4">
              {!validado ? (
                <>
                  <button
                    type="button"
                    disabled={estado !== 'por_validar'}
                    onClick={onValidar}
                    className={`rounded-xl px-8 py-3 text-xl font-bold shadow transition ${
                      estado === 'por_validar'
                        ? 'animate-pulse bg-campo-600 text-white hover:bg-campo-700'
                        : 'cursor-default bg-stone-200 text-stone-400'
                    }`}
                  >
                    ✔ Validar
                  </button>
                  <span className="text-stone-500">
                    {estado === 'por_validar' ? 'El técnico revisa y valida.' : 'Esperando que el caso sea enviado.'}
                  </span>
                </>
              ) : (
                <div className="aparecer rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-lg text-green-800">
                  ✅ Validado por <strong>{CASO_ROSA.tecnico}</strong> · {CASO_ROSA.agencia}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-3 text-sm text-stone-500">
        La IA hace un <strong>prediagnóstico</strong>. El <strong>técnico agrario</strong> lo valida. La IA no
        reemplaza al técnico.
      </div>
    </div>
  )
}
