import { MENSAJE_CENTRAL, MODULOS, SUBTITULO, type ModuloId } from '../data/guion'
import { useEstado } from '../estado/store'
import { ETAPAS, EncabezadoPagina, Enlace, claseBoton } from '../ui/comun'

const ROLES = [
  {
    icono: '📱',
    rol: 'Productor',
    hace: 'Envía fotos y consultas por WhatsApp y recibe recomendaciones en lenguaje simple.',
    para: 'Saber a tiempo qué tiene su cultivo y qué hacer, sin tener que viajar.',
  },
  {
    icono: '🤖',
    rol: 'AGROFUTURO IA',
    hace: 'Hace el prediagnóstico en segundos y propone recomendaciones iniciales.',
    para: 'Dar una primera respuesta inmediata y ordenar los casos por nivel de riesgo.',
  },
  {
    icono: '👨‍🌾',
    rol: 'Técnico agrario',
    hace: 'Valida el prediagnóstico y deriva a SENASA los casos de riesgo o de duda.',
    para: 'Asegurar que cada recomendación sea correcta y llegar a más productores.',
  },
  {
    icono: '🔬',
    rol: 'SENASA',
    hace: 'Emite el dictamen oficial, pide inspecciones, emite alertas y cierra los casos.',
    para: 'Detectar plagas reguladas a tiempo y proteger la sanidad agraria del país.',
  },
]

const FINALIDAD: Record<ModuloId, string> = {
  sinavifa: 'Identificar la plaga o enfermedad a partir de una foto y alertar a SENASA cuando hay riesgo.',
  agroconsulta: 'Resolver dudas de siembra, riego, abonos o cosecha sin esperar la visita del técnico.',
  agroalerta: 'Avisar de heladas, lluvias y brotes de plagas para que el productor se prepare antes.',
  agroproduce: 'Enseñar prácticas sostenibles que bajan costos y cuidan el suelo y el agua.',
  agromercado: 'Mostrar precios de referencia y compradores para que el productor venda mejor.',
  agrogestion: 'Llevar el registro de parcelas, cultivos y casos atendidos de cada chacra.',
}

export default function Sistema() {
  const { despachar, avisar } = useEstado()
  const boton = 'px-3 py-1.5 text-sm'
  return (
    <div>
      <EncabezadoPagina
        titulo="Acerca de AGROFUTURO IA"
        sub={SUBTITULO}
        accion={
          <div className="flex flex-wrap gap-2">
            <Enlace a="simulacion" className={`${claseBoton.secundario} ${boton}`}>
              Ver la simulación del flujo
            </Enlace>
            <button
              type="button"
              className={`${claseBoton.peligro} ${boton}`}
              onClick={() => {
                despachar({ tipo: 'restablecer' })
                avisar('Se restablecieron los datos de ejemplo.')
              }}
            >
              Restablecer datos de ejemplo
            </button>
          </div>
        }
      />

      <section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-campo-800 to-campo-600 px-6 py-5 text-white shadow-md lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold leading-tight">“{MENSAJE_CENTRAL}”</p>
          <p className="mt-2 max-w-3xl text-sm text-campo-50">
            Asistencia técnica por WhatsApp para la Agricultura Familiar. La IA no reemplaza al técnico ni a SENASA: les
            ahorra tiempo y les trae información del campo que hoy no llega.
          </p>
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-0.5 text-xs text-campo-50">
            Prototipo con datos simulados · sus decisiones se guardan solo en este navegador
          </span>
        </div>
        <ul className="grid shrink-0 gap-2 text-sm sm:grid-cols-3 lg:w-[540px]">
          {[
            ['🤖', 'IA', 'Prediagnóstico en segundos'],
            ['👨‍🌾', 'Técnico agrario', 'Valida y deriva'],
            ['🔬', 'SENASA', 'Dictamen oficial'],
          ].map(([icono, quien, que]) => (
            <li key={quien} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/20">
              <div className="text-xl" aria-hidden>
                {icono}
              </div>
              <div className="font-semibold">{quien}</div>
              <div className="text-xs text-campo-100">{que}</div>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mb-2 mt-5 font-semibold text-stone-900">Quién participa y para qué</h2>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((r, i) => (
          <li
            key={r.rol}
            className={`rounded-xl border px-4 py-3 ${r.rol === 'SENASA' ? 'border-campo-600 bg-campo-50' : 'border-stone-200 bg-white'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {r.icono}
              </span>
              <span className="font-semibold text-stone-900">{r.rol}</span>
              <span className="ml-auto text-xs font-semibold uppercase text-stone-400">Paso {i + 1}</span>
            </div>
            <p className="mt-1.5 text-xs text-stone-700">
              <span className="font-semibold text-stone-900">Qué hace: </span>
              {r.hace}
            </p>
            <p className="mt-1 text-xs text-campo-800">
              <span className="font-semibold">Finalidad: </span>
              {r.para}
            </p>
          </li>
        ))}
      </ol>

      <h2 className="mb-2 mt-5 font-semibold text-stone-900">Los 6 módulos y su finalidad</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MODULOS.map((m) => {
          const centro = m.id === 'sinavifa'
          return (
            <div
              key={m.id}
              title={centro ? 'Es el módulo que alimenta esta plataforma de SENASA.' : undefined}
              className={`rounded-xl px-4 py-3 ${centro ? 'bg-campo-700 text-white shadow' : 'bg-white ring-1 ring-stone-200'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden>
                  {m.icono}
                </span>
                <span className="text-sm font-bold">{m.nombre}</span>
              </div>
              <p className={`mt-0.5 text-xs font-medium ${centro ? 'text-campo-100' : 'text-stone-500'}`}>{m.descripcion}</p>
              <p className={`mt-1.5 text-xs ${centro ? 'text-white' : 'text-stone-700'}`}>
                <span className="font-semibold">Finalidad: </span>
                {FINALIDAD[m.id]}
              </p>
            </div>
          )
        })}
      </div>

      <h2 className="mb-2 mt-5 font-semibold text-stone-900">Cómo llega un caso a SENASA</h2>
      <ol className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {ETAPAS.map((e, i) => {
          const senasa = i === 3 || i === 5
          return (
            <li key={e.titulo} className={`rounded-xl px-4 py-2.5 ${senasa ? 'bg-campo-700 text-white' : 'bg-white ring-1 ring-stone-200'}`}>
              <div className={`text-xs font-semibold ${senasa ? 'text-campo-100' : 'text-stone-500'}`}>
                {i + 1}. {e.quien}
              </div>
              <div className="text-sm font-semibold">{e.titulo}</div>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-xs text-stone-500">Las etapas resaltadas son las que atiende SENASA.</p>
    </div>
  )
}
