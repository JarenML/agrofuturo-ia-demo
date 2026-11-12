import { TECNICO, type Caso } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import { EncabezadoPagina, Enlace, InsigniaRiesgo, RIESGOS, abierto, claseBoton, diagnosticoVigente, enSenasa, haceCuanto, ir } from '../ui/comun'
import { Indicador, Widget } from './Inicio'

const PRIORIDAD_RIESGO = { alto: 0, medio: 1, bajo: 2 }

/** Tablero del técnico agrario: su actividad de un vistazo y la acción que toca en cada caso */
export default function InicioTecnico() {
  const { misCasos: casos, alertas } = useEstado()

  const porValidar = casos
    .filter((c) => c.estado === 'por_validar')
    .sort((a, b) => PRIORIDAD_RIESGO[a.riesgo] - PRIORIDAD_RIESGO[b.riesgo] || b.fecha.localeCompare(a.fecha))
  const derivados = casos.filter(enSenasa)
  const seguimiento = casos.filter((c) => c.estado === 'seguimiento')
  const cerrados = casos.filter((c) => c.estado === 'cerrado')
  const abiertos = casos.filter(abierto)
  const listosCerrar = seguimiento.filter((c) => !c.derivado && c.seguimiento?.mejoro)
  const conDictamen = casos
    .filter((c) => c.dictamen)
    .sort((a, b) => b.dictamen!.fecha.localeCompare(a.dictamen!.fecha))
  const alertasZona = alertas.filter((a) => a.estado === 'activa' && a.regiones.includes(TECNICO.region))

  // Lo que necesita una acción del técnico, en orden de urgencia
  const pendientes: { caso: Caso; motivo: string; accion: string }[] = [
    ...porValidar.map((caso) => ({ caso, motivo: 'Nuevo: validar el prediagnóstico de la IA', accion: 'Validar' })),
    ...listosCerrar.map((caso) => ({ caso, motivo: 'Foto de seguimiento recibida: listo para cerrar', accion: 'Cerrar caso' })),
    ...casos
      .filter((c) => c.estado === 'seguimiento' && c.derivado && c.seguimiento?.mejoro)
      .filter((c) => !c.historial.some((e) => e.rol === 'tecnico' && e.texto.includes('verificó la mejora')))
      .map((caso) => ({ caso, motivo: 'Verificar en campo la mejora del cultivo', accion: 'Verificar' })),
    ...casos
      .filter((c) => c.estado === 'inspeccion')
      .map((caso) => ({ caso, motivo: 'SENASA pidió inspección: coordinar la visita', accion: 'Coordinar' })),
  ]

  // Actividad: en qué etapa están sus casos
  const etapas = [
    { texto: 'Por validar', n: porValidar.length, a: 'casos?estado=por_validar', color: 'bg-orange-400' },
    { texto: 'En SENASA', n: derivados.length, a: 'casos?estado=en_senasa', color: 'bg-sky-500' },
    { texto: 'En seguimiento', n: seguimiento.length, a: 'casos?estado=seguimiento', color: 'bg-campo-600' },
    { texto: 'Cerrados', n: cerrados.length, a: 'casos?estado=cerrado', color: 'bg-stone-400' },
  ]
  const maxEtapa = Math.max(1, ...etapas.map((e) => e.n))
  const porRiesgo = (['alto', 'medio', 'bajo'] as const).map((r) => ({ r, n: abiertos.filter((c) => c.riesgo === r).length }))

  const hoy = (() => {
    const f = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
    return f.charAt(0).toUpperCase() + f.slice(1)
  })()

  return (
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-7rem)]">
      <EncabezadoPagina
        icono="👋"
        titulo={`Buenos días, ${TECNICO.nombreCorto}`}
        sub={`${hoy} · ${TECNICO.sede}`}
        accion={
          <Enlace a="casos?estado=por_validar" className={claseBoton.primario}>
            Validar casos nuevos →
          </Enlace>
        }
      />

      <div className="-mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador
          valor={porValidar.length}
          titulo="Por validar"
          detalle={`${porValidar.filter((c) => c.riesgo === 'alto').length} de riesgo alto`}
          icono="🕓"
          a="casos?estado=por_validar"
          accion="Validar"
          alerta
        />
        <Indicador
          valor={derivados.length}
          titulo="Derivados a SENASA"
          detalle="Esperando dictamen"
          icono="🔬"
          a="casos?estado=en_senasa"
          accion="Ver estado"
        />
        <Indicador
          valor={seguimiento.length}
          titulo="En seguimiento"
          detalle={listosCerrar.length === 1 ? '1 listo para cerrar' : `${listosCerrar.length} listos para cerrar`}
          icono="📅"
          a="casos?estado=seguimiento"
          accion="Cerrar casos"
        />
        <Indicador
          valor={alertasZona.length}
          titulo="Alertas en su zona"
          detalle="Emitidas por SENASA"
          icono="📣"
          a="alertas"
          accion="Ver alertas"
        />
      </div>

      {/* Tablero: ocupa el resto de la pantalla; cada bloque desplaza su propio contenido */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-4">
          <Widget titulo={`Actividad · ${abiertos.length} casos abiertos`} accion="Ver todos" a="casos?estado=todos">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Por etapa</div>
            <ul className="mt-2 space-y-2">
              {etapas.map((e) => (
                <li key={e.texto}>
                  <button
                    type="button"
                    onClick={() => ir(e.a)}
                    className="group grid w-full grid-cols-[96px_1fr_24px] items-center gap-2 text-left"
                    title={`Ver ${e.n} casos: ${e.texto.toLowerCase()}`}
                  >
                    <span className="text-xs text-stone-700 group-hover:text-campo-800">{e.texto}</span>
                    <span className="h-3.5 rounded-r bg-stone-100">
                      <span className={`block h-3.5 rounded-r transition group-hover:opacity-80 ${e.color}`} style={{ width: `${(e.n / maxEtapa) * 100}%` }} />
                    </span>
                    <span className="text-right text-xs font-semibold tabular-nums text-stone-900">{e.n}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Abiertos por riesgo</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {porRiesgo.map(({ r, n }) => (
                <Enlace key={r} a={`casos?riesgo=${r}`} className={`rounded-lg px-2 py-2 text-center ring-1 transition hover:shadow-sm ${RIESGOS[r].clase}`}>
                  <span className="block text-xl font-bold tabular-nums">{n}</span>
                  <span className="block text-xs font-semibold">{RIESGOS[r].texto}</span>
                </Enlace>
              ))}
            </div>
          </Widget>

          <Widget titulo="Alertas en su zona" accion="Ver todas" a="alertas">
            <ul className="-mx-2 divide-y divide-stone-100">
              {alertasZona.map((a) => (
                <li key={a.id}>
                  <Enlace a="alertas" className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-campo-50">
                    <span aria-hidden className="text-sm">
                      {RIESGOS[a.nivel].icono}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-900">{a.titulo}</span>
                      <span className="block text-xs text-stone-500">{haceCuanto(a.fecha)}</span>
                    </span>
                  </Enlace>
                </li>
              ))}
              {alertasZona.length === 0 && <li className="py-4 text-center text-sm text-stone-500">Sin alertas en {TECNICO.region}.</li>}
            </ul>
          </Widget>
        </div>

        <Widget titulo={`Pendientes de hoy · ${pendientes.length}`} accion="Ver mis casos" a="casos">
          {pendientes.length === 0 ? (
            <p className="py-8 text-center text-stone-500">No tiene pendientes. ¡Buen trabajo!</p>
          ) : (
            <ul className="-mx-2 divide-y divide-stone-100">
              {pendientes.map(({ caso, motivo, accion }) => (
                <li key={caso.id}>
                  <button
                    type="button"
                    onClick={() => ir(`casos/${caso.id}`)}
                    className="group grid w-full grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg px-2 py-2.5 text-left hover:bg-campo-50 sm:flex sm:py-2"
                  >
                    <FotoCaso foto={caso.foto} className="h-10 w-10 shrink-0 self-start rounded-md ring-1 ring-stone-200 sm:self-center" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900 sm:truncate">
                          {caso.cultivo} · {diagnosticoVigente(caso).problema}
                        </span>
                        <span className="max-sm:hidden">
                          <InsigniaRiesgo riesgo={caso.riesgo} />
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 sm:truncate">
                        {caso.productor} · {caso.distrito} · {haceCuanto(caso.fecha)} ·{' '}
                        <span className="text-tierra-700">{motivo}</span>
                      </div>
                    </div>
                    {/* móvil: riesgo y acción en una fila propia bajo el texto; desde sm se integran a la fila */}
                    <div className="col-start-2 flex items-center justify-between gap-2 sm:contents">
                      <span className="sm:hidden">
                        <InsigniaRiesgo riesgo={caso.riesgo} />
                      </span>
                      <span className="shrink-0 rounded-lg bg-campo-700 px-2.5 py-1 text-xs font-semibold text-white transition group-hover:bg-campo-800">
                        {accion} →
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <div className="flex min-h-0 flex-col gap-4 lg:col-span-2 xl:col-span-1">
          <Widget titulo="Respuestas de SENASA" accion="Ver derivados" a="casos?estado=en_senasa">
            {derivados.length > 0 && (
              <p className="mb-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">
                🔬 {derivados.length === 1 ? '1 caso espera' : `${derivados.length} casos esperan`} el dictamen de SENASA.
              </p>
            )}
            {conDictamen.length === 0 ? (
              <p className="py-4 text-center text-sm text-stone-500">Aún no hay dictámenes para sus casos.</p>
            ) : (
              <ul className="-mx-2 divide-y divide-stone-100">
                {conDictamen.map((c) => (
                  <li key={c.id}>
                    <Enlace a={`casos/${c.id}`} className="block rounded-lg px-2 py-2 hover:bg-campo-50">
                      <span className="block truncate text-sm font-semibold text-stone-900">
                        {c.dictamen!.tipo === 'descartado' ? '⛔' : '✅'} {c.dictamen!.problema}
                      </span>
                      <span className="block truncate text-xs text-stone-500">
                        {c.productor} · {c.distrito} · {haceCuanto(c.dictamen!.fecha)}
                      </span>
                    </Enlace>
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        </div>
      </div>
    </div>
  )
}
