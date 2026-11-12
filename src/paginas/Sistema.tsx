import { useState } from 'react'
import { MENSAJE_CENTRAL, MODULOS, SUBTITULO, type ModuloId } from '../data/guion'
import { useEstado } from '../estado/store'
import { ETAPAS, EncabezadoPagina, Enlace, claseBoton } from '../ui/comun'

const ROLES = [
  {
    icono: '📱',
    rol: 'Productor',
    canal: '📱 WhatsApp',
    hace: 'Envía fotos y consultas por WhatsApp y recibe recomendaciones en lenguaje simple.',
    para: 'Saber a tiempo qué tiene su cultivo y qué hacer, sin tener que viajar.',
  },
  {
    icono: '🤖',
    rol: 'AGROFUTURO IA',
    canal: '⚡ Automático',
    hace: 'Hace el prediagnóstico en segundos y propone recomendaciones iniciales.',
    para: 'Dar una primera respuesta inmediata y ordenar los casos por nivel de riesgo.',
  },
  {
    icono: '👨‍🌾',
    rol: 'Técnico agrario',
    canal: '🖥 Panel del técnico',
    hace: 'Valida el prediagnóstico y deriva a SENASA los casos de riesgo o de duda.',
    para: 'Asegurar que cada recomendación sea correcta y llegar a más productores.',
  },
  {
    icono: '🔬',
    rol: 'SENASA',
    canal: '🖥 Panel SENASA',
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

const SECCIONES = [
  { id: 'participantes', texto: '👥 Quién participa' },
  { id: 'modulos', texto: '🧩 Los 6 módulos' },
  { id: 'flujo', texto: '🔄 Cómo llega un caso' },
] as const

const DETALLE_ETAPA = [
  { icono: '📸', texto: 'El productor envía la foto de su cultivo por WhatsApp.', tiempo: 'Al instante' },
  { icono: '🤖', texto: 'La IA identifica la posible plaga y asigna un nivel de riesgo.', tiempo: 'Segundos' },
  { icono: '✅', texto: 'El técnico confirma o corrige y deriva si hay riesgo.', tiempo: 'Mismo día' },
  { icono: '🔬', texto: 'El especialista emite el dictamen oficial o pide inspección.', tiempo: '24–72 h' },
  { icono: '📅', texto: 'Se pregunta al productor cómo evolucionó el cultivo.', tiempo: 'Día 7' },
  { icono: '📁', texto: 'SENASA cierra el caso y queda en el historial de la chacra.', tiempo: 'Cierre' },
]

export default function Sistema() {
  const { despachar, avisar } = useEstado()
  const [seccion, setSeccion] = useState<(typeof SECCIONES)[number]['id']>('participantes')
  const boton = 'px-3 py-1.5 text-sm'
  return (
    <div>
      <EncabezadoPagina
        icono="ℹ️"
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

      <section className="mb-8 rounded-2xl bg-gradient-to-r from-campo-800 to-campo-600 px-6 py-5 text-white shadow-md lg:flex-row lg:items-center">
        <div>
          <p className="text-2xl font-bold leading-tight">“{MENSAJE_CENTRAL}”</p>
          <p className="mt-2 max-w-3xl text-sm text-campo-50">
            Asistencia técnica por WhatsApp para la Agricultura Familiar. La IA no reemplaza al técnico ni a SENASA: les
            ahorra tiempo y les trae información del campo que hoy no llega.
          </p>
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-0.5 text-xs text-campo-50">
            Prototipo con datos simulados · sus decisiones se guardan solo en este navegador
          </span>
        </div>
      </section>

      <div className="mb-6 flex w-fit max-w-full overflow-x-auto rounded-lg bg-stone-200/60 p-1" role="tablist">
        {SECCIONES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={seccion === t.id}
            onClick={() => setSeccion(t.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition ${
              seccion === t.id ? 'bg-white text-campo-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.texto}
          </button>
        ))}
      </div>

      {seccion === 'participantes' && (
        <>
          <h2 className="mb-1 text-lg font-semibold text-stone-900">Quién participa y para qué</h2>
          <p className="mb-4 text-sm text-stone-500">Cada actor cumple un paso del flujo; la IA apoya, no reemplaza.</p>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ROLES.map((r, i) => {
              const senasa = r.rol === 'SENASA'
              return (
                <li
                  key={r.rol}
                  className={`flex flex-col rounded-xl px-4 py-4 ${senasa ? 'bg-campo-700 text-white shadow' : 'bg-white ring-1 ring-stone-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${senasa ? 'bg-white/15' : 'bg-campo-50'}`}
                      aria-hidden
                    >
                      {r.icono}
                    </span>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold uppercase ${senasa ? 'text-campo-100' : 'text-stone-500'}`}>
                        Paso {i + 1}
                      </div>
                      <div className="font-bold">{r.rol}</div>
                    </div>
                  </div>
                  <div className={`mt-3 border-t pt-3 text-xs ${senasa ? 'border-white/20' : 'border-stone-100'}`}>
                    <div className={`font-semibold uppercase ${senasa ? 'text-campo-100' : 'text-stone-500'}`}>Qué hace</div>
                    <p className={`mt-0.5 ${senasa ? 'text-white' : 'text-stone-700'}`}>{r.hace}</p>
                  </div>
                  <div className="mt-2 flex-1 text-xs">
                    <div className={`font-semibold uppercase ${senasa ? 'text-campo-100' : 'text-campo-700'}`}>Finalidad</div>
                    <p className={`mt-0.5 ${senasa ? 'text-campo-50' : 'text-campo-800'}`}>{r.para}</p>
                  </div>
                  <span
                    className={`mt-3 w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${senasa ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    {r.canal}
                  </span>
                </li>
              )
            })}
          </ol>
        </>
      )}

      {seccion === 'modulos' && (
        <>
          <h2 className="mb-1 text-lg font-semibold text-stone-900">Los 6 módulos y su finalidad</h2>
          <p className="mb-4 text-sm text-stone-500">SINAVIFA es el módulo que alimenta esta plataforma de SENASA.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {MODULOS.map((m, i) => {
              const centro = m.id === 'sinavifa'
              return (
                <div
                  key={m.id}
                  className={`flex flex-col rounded-xl px-4 py-4 ${centro ? 'bg-campo-700 text-white shadow' : 'bg-white ring-1 ring-stone-200'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${centro ? 'bg-white/15' : 'bg-campo-50'}`}
                      aria-hidden
                    >
                      {m.icono}
                    </span>
                    <span className={`text-xs font-semibold ${centro ? 'text-campo-100' : 'text-stone-400'}`}>
                      0{i + 1}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-bold">{m.nombre}</div>
                  <p className={`text-xs font-medium ${centro ? 'text-campo-100' : 'text-stone-500'}`}>{m.descripcion}</p>
                  <div className={`mt-3 flex-1 border-t pt-3 text-xs ${centro ? 'border-white/20' : 'border-stone-100'}`}>
                    <div className={`font-semibold uppercase ${centro ? 'text-campo-100' : 'text-campo-700'}`}>Finalidad</div>
                    <p className={`mt-0.5 ${centro ? 'text-white' : 'text-stone-700'}`}>{FINALIDAD[m.id]}</p>
                  </div>
                  <span
                    className={`mt-3 w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${centro ? 'bg-white text-campo-800' : 'bg-stone-100 text-stone-600'}`}
                  >
                    {centro ? '★ Alimenta a SENASA' : '💬 Vía WhatsApp'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {seccion === 'flujo' && (
        <>
          <h2 className="mb-1 text-lg font-semibold text-stone-900">Cómo llega un caso a SENASA</h2>
          <p className="mb-4 text-sm text-stone-500">Las etapas resaltadas son las que atiende SENASA.</p>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {ETAPAS.map((e, i) => {
              const senasa = i === 3 || i === 5
              const d = DETALLE_ETAPA[i]
              return (
                <li
                  key={e.titulo}
                  className={`relative flex flex-col rounded-xl px-4 py-4 ${senasa ? 'bg-campo-700 text-white shadow' : 'bg-white ring-1 ring-stone-200'}`}
                >
                  {i < ETAPAS.length - 1 && (
                    <span
                      className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-stone-400 xl:block"
                      aria-hidden
                    >
                      ➜
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${senasa ? 'bg-white text-campo-800' : 'bg-campo-100 text-campo-800'}`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-2xl" aria-hidden>
                      {d.icono}
                    </span>
                  </div>
                  <div className={`mt-3 text-xs font-semibold uppercase ${senasa ? 'text-campo-100' : 'text-stone-500'}`}>
                    {e.quien}
                  </div>
                  <div className="text-sm font-bold">{e.titulo}</div>
                  <p className={`mt-1.5 flex-1 text-xs ${senasa ? 'text-campo-50' : 'text-stone-600'}`}>{d.texto}</p>
                  <span
                    className={`mt-3 w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${senasa ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    ⏱ {d.tiempo}
                  </span>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
