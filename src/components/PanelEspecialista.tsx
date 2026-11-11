import { CASO_ESPECIALISTA as C } from '../data/guion'
import { Cacao } from '../ilustraciones/Ilustraciones'
import { Estado, EtiquetaRiesgo } from './EtiquetaRiesgo'

interface Props {
  confirmado: boolean
  onConfirmar: () => void
}

export default function PanelEspecialista({ confirmado, onConfirmar }: Props) {
  return (
    <div className="aparecer rounded-2xl border border-campo-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-tierra-700">
            Caso derivado a especialista · {C.institucion}
          </div>
          <h3 className="text-2xl font-bold text-stone-900">
            {C.cultivo} — {C.region}
          </h3>
          <div className="text-stone-600">
            {C.productor} · {C.distrito}
          </div>
        </div>
        <Estado texto={confirmado ? 'Confirmado' : 'Derivado'} tono={confirmado ? 'verde' : 'ambar'} />
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">
        <div>
          <Cacao className="h-44 w-44 rounded-xl ring-1 ring-stone-200" />
          <div className="mt-1 text-sm text-stone-500">Foto de la mazorca</div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl bg-tierra-100 p-4">
            <div className="text-sm font-semibold uppercase tracking-wide text-tierra-700">
              Prediagnóstico IA + técnico
            </div>
            <div className="mt-1 text-xl font-bold text-stone-900">{C.problema}</div>
            <div className="text-sm italic text-stone-600">{C.agente}</div>
            <div className="mt-2">
              <EtiquetaRiesgo nivel={C.riesgo} />
            </div>
          </div>
          <div className="text-lg text-stone-700">
            <div>
              <span className="text-stone-500">Derivado por:</span> {C.derivadoPor}
            </div>
            <div className="mt-1">
              <span className="text-stone-500">Motivo:</span> {C.motivo}
            </div>
          </div>
          {!confirmado ? (
            <button
              type="button"
              onClick={onConfirmar}
              className="rounded-xl bg-campo-600 px-8 py-3 text-xl font-bold text-white shadow transition hover:bg-campo-700"
            >
              🔬 Confirmar diagnóstico
            </button>
          ) : (
            <div className="aparecer rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-lg text-green-800">
              ✅ Diagnóstico confirmado por el especialista de {C.institucion}.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-3 text-sm text-stone-500">
        Los casos complejos o con riesgo de brote suben del técnico al especialista. Caso de ejemplo, estático.
      </div>
    </div>
  )
}
