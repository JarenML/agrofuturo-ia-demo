import { MODULOS } from '../data/guion'

export default function Modulos() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-10">
      <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-campo-800">
        Los 6 módulos de AGROFUTURO IA
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {MODULOS.map((m) => {
          const centro = m.id === 'sinavifa'
          return (
            <div
              key={m.id}
              className={`rounded-xl p-4 ${
                centro
                  ? 'bg-campo-700 text-white shadow-lg ring-4 ring-campo-200'
                  : 'bg-white text-stone-800 ring-1 ring-stone-200'
              }`}
            >
              <div className="text-2xl">{m.icono}</div>
              <div className="mt-1 font-bold">{m.nombre}</div>
              <div className={`text-sm ${centro ? 'text-campo-100' : 'text-stone-500'}`}>{m.descripcion}</div>
              {centro && (
                <div className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                  ⭐ En esta demo
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
