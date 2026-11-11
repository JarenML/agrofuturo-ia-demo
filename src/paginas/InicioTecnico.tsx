import { TECNICO, type Caso } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import {
  ETAPAS,
  EncabezadoPagina,
  Enlace,
  InsigniaEstado,
  InsigniaRiesgo,
  RIESGOS,
  Tarjeta,
  claseBoton,
  diagnosticoVigente,
  enSenasa,
  haceCuanto,
  ir,
} from '../ui/comun'

const PRIORIDAD_RIESGO = { alto: 0, medio: 1, bajo: 2 }

/** Panel de inicio del técnico agrario */
export default function InicioTecnico() {
  const { misCasos: casos, alertas } = useEstado()

  const porValidar = casos
    .filter((c) => c.estado === 'por_validar')
    .sort((a, b) => PRIORIDAD_RIESGO[a.riesgo] - PRIORIDAD_RIESGO[b.riesgo] || b.fecha.localeCompare(a.fecha))
  const derivados = casos.filter(enSenasa)
  const seguimiento = casos.filter((c) => c.estado === 'seguimiento')
  const listosCerrar = seguimiento.filter((c) => !c.derivado && c.seguimiento?.mejoro)
  const conDictamen = casos
    .filter((c) => c.dictamen)
    .sort((a, b) => b.dictamen!.fecha.localeCompare(a.dictamen!.fecha))
    .slice(0, 4)
  const alertasZona = alertas.filter((a) => a.estado === 'activa' && a.regiones.includes(TECNICO.region))

  // Lo que necesita una acción del técnico, en orden de urgencia
  const pendientes: { caso: Caso; motivo: string }[] = [
    ...porValidar.map((caso) => ({ caso, motivo: 'Nuevo: validar el prediagnóstico de la IA' })),
    ...listosCerrar.map((caso) => ({ caso, motivo: 'Foto de seguimiento recibida: listo para cerrar' })),
    ...casos
      .filter((c) => c.estado === 'seguimiento' && c.derivado && c.seguimiento?.mejoro)
      .filter((c) => !c.historial.some((e) => e.rol === 'tecnico' && e.texto.includes('verificó la mejora')))
      .map((caso) => ({ caso, motivo: 'Verificar en campo la mejora del cultivo' })),
    ...casos
      .filter((c) => c.estado === 'inspeccion')
      .map((caso) => ({ caso, motivo: 'SENASA pidió inspección: coordinar la visita' })),
  ]

  const hoy = (() => {
    const f = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
    return f.charAt(0).toUpperCase() + f.slice(1)
  })()

  return (
    <div>
      <EncabezadoPagina
        titulo={`Buenos días, ${TECNICO.nombreCorto}`}
        sub={`${hoy} · ${TECNICO.sede}`}
        accion={
          <Enlace a="casos?estado=por_validar" className={claseBoton.primario}>
            Validar casos nuevos →
          </Enlace>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador
          valor={porValidar.length}
          titulo="Por validar"
          detalle={`${porValidar.filter((c) => c.riesgo === 'alto').length} de riesgo alto`}
          icono="🕓"
          a="casos?estado=por_validar"
          resaltar
        />
        <Indicador
          valor={derivados.length}
          titulo="Derivados a SENASA"
          detalle="Esperando dictamen"
          icono="🔬"
          a="casos?estado=en_senasa"
        />
        <Indicador
          valor={seguimiento.length}
          titulo="En seguimiento"
          detalle={listosCerrar.length === 1 ? '1 listo para cerrar' : `${listosCerrar.length} listos para cerrar`}
          icono="📅"
          a="casos?estado=seguimiento"
        />
        <Indicador
          valor={alertasZona.length}
          titulo="Alertas en su zona"
          detalle="Emitidas por SENASA"
          icono="📣"
          a="alertas"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <Tarjeta
          titulo="Pendientes de hoy"
          accion={
            <Enlace a="casos" className="text-sm font-semibold text-campo-700 hover:underline">
              Ver mis casos
            </Enlace>
          }
        >
          {pendientes.length === 0 ? (
            <p className="py-8 text-center text-stone-500">No tiene pendientes. ¡Buen trabajo!</p>
          ) : (
            <ul className="-my-2 divide-y divide-stone-100">
              {pendientes.map(({ caso, motivo }) => (
                <li key={caso.id}>
                  <button
                    type="button"
                    onClick={() => ir(`casos/${caso.id}`)}
                    className="flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left hover:bg-campo-50"
                  >
                    <FotoCaso foto={caso.foto} className="h-14 w-14 shrink-0 rounded-lg ring-1 ring-stone-200" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-stone-900">
                          {caso.cultivo} · {diagnosticoVigente(caso).problema}
                        </span>
                        <InsigniaRiesgo riesgo={caso.riesgo} />
                      </div>
                      <div className="truncate text-sm text-stone-600">
                        {caso.productor} · {caso.distrito} · {haceCuanto(caso.fecha)}
                      </div>
                      <div className="text-sm font-medium text-tierra-700">{motivo}</div>
                    </div>
                    <div className="hidden sm:block">
                      <InsigniaEstado estado={caso.estado} />
                    </div>
                    <span className="text-stone-400" aria-hidden>
                      ›
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <div className="space-y-6">
          <Tarjeta titulo="Respuestas de SENASA">
            {conDictamen.length === 0 ? (
              <p className="py-4 text-center text-stone-500">Aún no hay dictámenes para sus casos.</p>
            ) : (
              <ul className="-my-1 divide-y divide-stone-100">
                {conDictamen.map((c) => (
                  <li key={c.id} className="py-2.5">
                    <Enlace a={`casos/${c.id}`} className="font-semibold text-stone-900 hover:underline">
                      {c.dictamen!.tipo === 'descartado' ? '⛔' : '✅'} {c.dictamen!.problema}
                    </Enlace>
                    <div className="text-sm text-stone-600">
                      {c.productor} · {c.distrito} · {haceCuanto(c.dictamen!.fecha)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {derivados.length > 0 && (
              <p className="mt-3 text-sm text-stone-500">
                {derivados.length === 1 ? '1 caso espera' : `${derivados.length} casos esperan`} el dictamen de SENASA.
              </p>
            )}
          </Tarjeta>

          <Tarjeta
            titulo="Alertas en su zona"
            accion={
              <Enlace a="alertas" className="text-sm font-semibold text-campo-700 hover:underline">
                Ver todas
              </Enlace>
            }
          >
            <ul className="-my-1 divide-y divide-stone-100">
              {alertasZona.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-2.5">
                  <span aria-hidden>{RIESGOS[a.nivel].icono}</span>
                  <div>
                    <div className="font-semibold text-stone-900">{a.titulo}</div>
                    <div className="text-sm text-stone-600">{haceCuanto(a.fecha)}</div>
                  </div>
                </li>
              ))}
              {alertasZona.length === 0 && <li className="py-4 text-center text-stone-500">Sin alertas en {TECNICO.region}.</li>}
            </ul>
          </Tarjeta>
        </div>
      </div>

      <Tarjeta
        className="mt-6"
        titulo="Su lugar en el flujo"
        accion={
          <Enlace a="simulacion" className="text-sm font-semibold text-campo-700 hover:underline">
            Ver la simulación del flujo
          </Enlace>
        }
      >
        <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ETAPAS.map((e, i) => {
            const suya = i === 2 || i === 4
            return (
              <li key={e.titulo} className={`rounded-lg p-3 ${suya ? 'bg-campo-700 text-white' : 'bg-campo-50 text-stone-800'}`}>
                <div className={`text-xs font-semibold ${suya ? 'text-campo-100' : 'text-stone-500'}`}>
                  {i + 1}. {i === 5 ? 'SENASA o técnico' : e.quien}
                </div>
                <div className="font-semibold">{e.titulo}</div>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-sm text-stone-600">
          Usted recibe todos los casos de su zona después del prediagnóstico de la IA. Valida o corrige el diagnóstico y
          decide si lo deriva a SENASA: se recomienda cuando el riesgo es alto, la IA tiene baja confianza o puede ser una
          plaga regulada. Si no lo deriva, usted hace el seguimiento y cierra el caso.
        </p>
      </Tarjeta>
    </div>
  )
}

function Indicador({
  valor,
  titulo,
  detalle,
  icono,
  a,
  resaltar = false,
}: {
  valor: number
  titulo: string
  detalle: string
  icono: string
  a: string
  resaltar?: boolean
}) {
  return (
    <Enlace
      a={a}
      className={`block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        resaltar && valor > 0 ? 'border-orange-300' : 'border-stone-200'
      }`}
    >
      <div className="flex items-center justify-between text-sm font-medium text-stone-600">
        {titulo}
        <span aria-hidden>{icono}</span>
      </div>
      <div className="mt-1 text-3xl font-bold tabular-nums text-stone-900">{valor}</div>
      <div className="text-sm text-stone-500">{detalle}</div>
    </Enlace>
  )
}
