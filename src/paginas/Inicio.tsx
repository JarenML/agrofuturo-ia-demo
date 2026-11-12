import MapaVigilancia, { LeyendaMapa } from '../components/MapaVigilancia'
import { CULTIVOS, USUARIO, type Caso } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import {
  EncabezadoPagina,
  Enlace,
  InsigniaEstado,
  InsigniaRiesgo,
  RIESGOS,
  Tarjeta,
  abierto,
  claseBoton,
  haceCuanto,
  ir,
} from '../ui/comun'

const PRIORIDAD_RIESGO = { alto: 0, medio: 1, bajo: 2 }

export default function Inicio() {
  const { misCasos: casos, alertas } = useEstado()

  const porRevisar = casos.filter((c) => c.estado === 'por_revisar')
  const altosAbiertos = casos.filter((c) => abierto(c) && c.riesgo === 'alto')
  const listosCerrar = casos.filter((c) => c.estado === 'seguimiento' && c.seguimiento?.mejoro)
  const enSeguimiento = casos.filter((c) => c.estado === 'seguimiento')
  const alertasActivas = alertas.filter((a) => a.estado === 'activa')

  // Lo que necesita una acción de SENASA, en orden de urgencia
  const atencion: { caso: Caso; motivo: string }[] = [
    ...listosCerrar.map((caso) => ({ caso, motivo: 'Foto de seguimiento recibida: listo para cerrar' })),
    ...casos
      .filter((c) => c.estado === 'por_revisar' || (c.estado === 'en_revision' && c.asignadoA === USUARIO.nombre))
      .sort((a, b) => PRIORIDAD_RIESGO[a.riesgo] - PRIORIDAD_RIESGO[b.riesgo] || b.fecha.localeCompare(a.fecha))
      .map((caso) => ({
        caso,
        motivo:
          caso.estado === 'en_revision'
            ? 'Asignado a usted: falta el dictamen'
            : caso.plagaRegulada
              ? 'Posible plaga regulada: requiere evaluación oficial'
              : 'Derivado por la Agencia Agraria',
      })),
  ].slice(0, 6)

  const porCultivo = CULTIVOS.map((cultivo) => ({
    cultivo,
    abiertos: casos.filter((c) => c.cultivo === cultivo && abierto(c)).length,
  }))
    .filter((x) => x.abiertos > 0)
    .sort((a, b) => b.abiertos - a.abiertos)
  const maxCultivo = Math.max(1, ...porCultivo.map((x) => x.abiertos))

  const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
  const hoy = fecha.charAt(0).toUpperCase() + fecha.slice(1)

  return (
    <div>
      {/* ponytail: fijo solo en lg; en móvil ocuparía media pantalla */}
      <div className="lg:sticky lg:top-16 lg:z-30 lg:-mx-8 lg:-mt-6 lg:bg-campo-50 lg:px-8 lg:pb-4 lg:pt-6">
      <EncabezadoPagina
        titulo={`Buenos días, ${USUARIO.nombreCorto}`}
        sub={
          <>
            {hoy} · Vigilancia fitosanitaria con reportes de la Agricultura
            Familiar
          </>
        }
        accion={
          <Enlace a="casos?estado=por_revisar" className={claseBoton.primario}>
            Revisar casos pendientes →
          </Enlace>
        }
      />

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador
          valor={porRevisar.length}
          titulo="Casos por revisar"
          detalle="Derivados por técnicos"
          icono="⏳"
          a="casos?estado=por_revisar"
        />
        <Indicador
          valor={altosAbiertos.length}
          titulo="Riesgo alto abiertos"
          detalle={`${altosAbiertos.filter((c) => c.plagaRegulada).length} con posible plaga regulada`}
          icono="🔴"
          a="casos?riesgo=alto"
          alerta
        />
        <Indicador
          valor={enSeguimiento.length}
          titulo="En seguimiento"
          detalle={listosCerrar.length === 1 ? '1 listo para cerrar' : `${listosCerrar.length} listos para cerrar`}
          icono="📅"
          a="casos?estado=seguimiento"
        />
        <Indicador
          valor={alertasActivas.length}
          titulo="Alertas activas"
          detalle={`${alertasActivas.reduce((s, a) => s + a.productoresAlcanzados, 0).toLocaleString('es-PE')} productores avisados`}
          icono="📣"
          a="alertas"
        />
      </div>
      </div>

      <div className="mt-6 grid gap-6 lg:mt-2 lg:grid-cols-2">
        <Tarjeta titulo="Casos abiertos por cultivo">
          <ul className="space-y-2.5">
            {porCultivo.map((x) => (
              <li key={x.cultivo}>
                <button
                  type="button"
                  onClick={() => ir(`casos?cultivo=${encodeURIComponent(x.cultivo)}`)}
                  className="group grid w-full grid-cols-[90px_1fr_32px] items-center gap-3 text-left"
                  title={`${x.cultivo}: ${x.abiertos} casos abiertos`}
                >
                  <span className="text-sm text-stone-700">{x.cultivo}</span>
                  <span className="h-5 rounded-r bg-stone-100">
                    <span
                      className="block h-5 rounded-r bg-campo-600 transition group-hover:bg-campo-800"
                      style={{ width: `${(x.abiertos / maxCultivo) * 100}%` }}
                    />
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums text-stone-900">{x.abiertos}</span>
                </button>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta
          titulo="Alertas activas"
          accion={
            <Enlace a="alertas/nueva" className="text-sm font-semibold text-campo-700 hover:underline">
              + Nueva alerta
            </Enlace>
          }
        >
          <ul className="-my-1 divide-y divide-stone-100">
            {alertasActivas.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-2.5">
                <span aria-hidden>{RIESGOS[a.nivel].icono}</span>
                <div className="min-w-0 flex-1">
                  <Enlace a="alertas" className="font-semibold text-stone-900 hover:underline">
                    {a.titulo}
                  </Enlace>
                  <div className="text-sm text-stone-600">
                    {a.regiones.join(', ')} · {haceCuanto(a.fecha)} ·{' '}
                    {a.productoresAlcanzados.toLocaleString('es-PE')} productores
                  </div>
                </div>
              </li>
            ))}
            {alertasActivas.length === 0 && <li className="py-6 text-center text-stone-500">Sin alertas activas.</li>}
          </ul>
        </Tarjeta>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <Tarjeta
          titulo="Mapa de vigilancia"
          accion={
            <Enlace a="mapa" className="text-sm font-semibold text-campo-700 hover:underline">
              Abrir mapa
            </Enlace>
          }
        >
          <div className="mx-auto aspect-[470/380] max-w-[420px]">
            <MapaVigilancia casos={casos} etiquetas={false} onSeleccionar={(r) => ir(`mapa?region=${encodeURIComponent(r)}`)} />
          </div>
          <div className="mt-3">
            <LeyendaMapa />
          </div>
        </Tarjeta>
        <Tarjeta
          titulo="Requieren su atención"
          accion={
            <Enlace a="casos" className="text-sm font-semibold text-campo-700 hover:underline">
              Ver bandeja completa
            </Enlace>
          }
        >
          {atencion.length === 0 ? (
            <p className="py-8 text-center text-stone-500">No hay casos pendientes. ¡Buen trabajo!</p>
          ) : (
            <ul className="-my-2 divide-y divide-stone-100">
              {atencion.map(({ caso, motivo }) => (
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
                          {caso.cultivo} · {caso.prediagnostico.problema}
                        </span>
                        <InsigniaRiesgo riesgo={caso.riesgo} />
                      </div>
                      <div className="truncate text-sm text-stone-600">
                        {caso.distrito}, {caso.region} · {caso.id} · {haceCuanto(caso.fecha)}
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

      </div>

    </div>
  )
}

function Indicador({
  valor,
  titulo,
  detalle,
  icono,
  a,
  alerta = false,
}: {
  valor: number
  titulo: string
  detalle: string
  icono: string
  a: string
  alerta?: boolean
}) {
  return (
    <Enlace
      a={a}
      className={`block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        alerta && valor > 0 ? 'border-red-200' : 'border-stone-200'
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
