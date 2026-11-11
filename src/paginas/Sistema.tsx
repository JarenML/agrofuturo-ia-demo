import { MENSAJE_CENTRAL, MODULOS, SUBTITULO } from '../data/guion'
import { useEstado } from '../estado/store'
import { EncabezadoPagina, Enlace, Tarjeta, claseBoton } from '../ui/comun'

const ROLES = [
  { icono: '📱', rol: 'Productor', texto: 'Envía fotos y consultas por WhatsApp y recibe recomendaciones en lenguaje simple.' },
  { icono: '🤖', rol: 'AGROFUTURO IA', texto: 'Hace el prediagnóstico en segundos y propone recomendaciones iniciales.' },
  { icono: '👨‍🌾', rol: 'Técnico agrario', texto: 'Valida el prediagnóstico y deriva a SENASA los casos de riesgo o de duda.' },
  { icono: '🔬', rol: 'SENASA', texto: 'Emite el dictamen oficial, pide inspecciones, emite alertas y cierra los casos.' },
]

export default function Sistema() {
  const { despachar, avisar } = useEstado()
  return (
    <div className="max-w-5xl">
      <EncabezadoPagina titulo="Acerca de AGROFUTURO IA" sub={SUBTITULO} />

      <Tarjeta>
        <p className="text-xl font-semibold text-campo-800">“{MENSAJE_CENTRAL}”</p>
        <p className="mt-2 text-stone-700">
          AGROFUTURO IA acerca la asistencia técnica a la Agricultura Familiar por WhatsApp. La inteligencia artificial
          hace un <strong>prediagnóstico</strong>. El <strong>técnico agrario</strong> lo valida, y{' '}
          <strong>SENASA</strong> recibe los casos que requieren un dictamen oficial. La IA no reemplaza a ninguno de
          ellos: les ahorra tiempo y les trae información del campo que hoy no llega.
        </p>
      </Tarjeta>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-stone-900">Quién participa</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((r) => (
          <div key={r.rol} className={`rounded-xl border p-4 ${r.rol === 'SENASA' ? 'border-campo-600 bg-campo-50' : 'border-stone-200 bg-white'}`}>
            <div className="text-2xl" aria-hidden>
              {r.icono}
            </div>
            <div className="mt-1 font-semibold text-stone-900">{r.rol}</div>
            <p className="text-sm text-stone-600">{r.texto}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-stone-900">Los 6 módulos</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m) => {
          const centro = m.id === 'sinavifa'
          return (
            <div
              key={m.id}
              className={`rounded-xl p-4 ${centro ? 'bg-campo-700 text-white shadow' : 'bg-white ring-1 ring-stone-200'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {m.icono}
                </span>
                <span className="font-bold">{m.nombre}</span>
              </div>
              <p className={`mt-1 text-sm ${centro ? 'text-campo-100' : 'text-stone-600'}`}>{m.descripcion}</p>
              {centro && <p className="mt-2 text-xs font-semibold text-campo-100">Es el módulo que alimenta esta plataforma de SENASA.</p>}
            </div>
          )
        })}
      </div>

      <Tarjeta className="mt-8" titulo="Sobre este prototipo">
        <p className="text-stone-700">
          Es un prototipo navegable con datos simulados. No hay inteligencia artificial, mensajería ni datos reales. Las
          decisiones que tome se guardan solo en este navegador.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Enlace a="simulacion" className={claseBoton.secundario}>
            Ver la simulación del flujo
          </Enlace>
          <button
            type="button"
            className={claseBoton.peligro}
            onClick={() => {
              despachar({ tipo: 'restablecer' })
              avisar('Se restablecieron los datos de ejemplo.')
            }}
          >
            Restablecer datos de ejemplo
          </button>
        </div>
      </Tarjeta>
    </div>
  )
}
