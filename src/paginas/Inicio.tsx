import type { ReactNode } from 'react'
import MapaVigilancia, { LeyendaMapa } from '../components/MapaVigilancia'
import { CULTIVOS, USUARIO, type Caso } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import {
  EncabezadoPagina,
  Enlace,
  InsigniaRiesgo,
  RIESGOS,
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
  const atencion: { caso: Caso; motivo: string; accion: string }[] = [
    ...listosCerrar.map((caso) => ({ caso, motivo: 'Foto de seguimiento recibida: listo para cerrar', accion: 'Cerrar caso' })),
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
        accion: caso.estado === 'en_revision' ? 'Emitir dictamen' : 'Tomar caso',
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
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-7rem)]">
      <EncabezadoPagina
        icono="👋"
        titulo={`Buenos días, ${USUARIO.nombreCorto}`}
        sub={<>{hoy} · Resumen de la vigilancia fitosanitaria</>}
        accion={
          <Enlace a="casos?estado=por_revisar" className={claseBoton.primario}>
            Revisar casos pendientes →
          </Enlace>
        }
      />

      {/* Indicadores: cada uno lleva a la acción correspondiente */}
      <div className="-mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador
          valor={porRevisar.length}
          titulo="Casos por revisar"
          detalle="Derivados por técnicos"
          icono="⏳"
          a="casos?estado=por_revisar"
          accion="Revisar"
        />
        <Indicador
          valor={altosAbiertos.length}
          titulo="Riesgo alto abiertos"
          detalle={`${altosAbiertos.filter((c) => c.plagaRegulada).length} con posible plaga regulada`}
          icono="🔴"
          a="casos?riesgo=alto"
          accion="Ver casos"
          alerta
        />
        <Indicador
          valor={enSeguimiento.length}
          titulo="En seguimiento"
          detalle={listosCerrar.length === 1 ? '1 listo para cerrar' : `${listosCerrar.length} listos para cerrar`}
          icono="📅"
          a="casos?estado=seguimiento"
          accion="Cerrar casos"
        />
        <Indicador
          valor={alertasActivas.length}
          titulo="Alertas activas"
          detalle={`${alertasActivas.reduce((s, a) => s + a.productoresAlcanzados, 0).toLocaleString('es-PE')} productores avisados`}
          icono="📣"
          a="alertas"
          accion="Gestionar"
        />
      </div>

      {/* Tablero: ocupa el resto de la pantalla; cada bloque desplaza su propio contenido */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
        <Widget titulo="Mapa de vigilancia" accion="Abrir mapa" a="mapa">
          <div className="flex h-full min-h-[260px] flex-col">
            {/* fondo del mismo color que el mapa: el espacio sobrante no se nota como franjas blancas */}
            <div className="min-h-0 flex-1 rounded-xl bg-[#eef3e6]">
              <MapaVigilancia casos={casos} etiquetas={false} onSeleccionar={(r) => ir(`mapa?region=${encodeURIComponent(r)}`)} />
            </div>
            <div className="mt-2 [&_ul]:text-xs">
              <LeyendaMapa />
            </div>
          </div>
        </Widget>

        <Widget titulo={`Requieren su atención · ${atencion.length}`} accion="Ver bandeja" a="casos">
          {atencion.length === 0 ? (
            <p className="py-8 text-center text-stone-500">No hay casos pendientes. ¡Buen trabajo!</p>
          ) : (
            <ul className="-mx-2 divide-y divide-stone-100">
              {atencion.map(({ caso, motivo, accion }) => (
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
                          {caso.cultivo} · {caso.prediagnostico.problema}
                        </span>
                        <span className="max-sm:hidden">
                          <InsigniaRiesgo riesgo={caso.riesgo} />
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 sm:truncate">
                        {caso.distrito}, {caso.region} · {haceCuanto(caso.fecha)} ·{' '}
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
          <Widget titulo="Casos abiertos por cultivo" accion="Ver todos" a="casos">
            <ul className="space-y-1.5">
              {porCultivo.map((x) => (
                <li key={x.cultivo}>
                  <button
                    type="button"
                    onClick={() => ir(`casos?cultivo=${encodeURIComponent(x.cultivo)}`)}
                    className="group grid w-full grid-cols-[70px_1fr_24px] items-center gap-2 text-left"
                    title={`Ver los ${x.abiertos} casos abiertos de ${x.cultivo}`}
                  >
                    <span className="text-xs text-stone-700 group-hover:text-campo-800">{x.cultivo}</span>
                    <span className="h-3.5 rounded-r bg-stone-100">
                      <span
                        className="block h-3.5 rounded-r bg-campo-600 transition group-hover:bg-campo-800"
                        style={{ width: `${(x.abiertos / maxCultivo) * 100}%` }}
                      />
                    </span>
                    <span className="text-right text-xs font-semibold tabular-nums text-stone-900">{x.abiertos}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Widget>

          <Widget titulo="Alertas activas" accion="+ Nueva alerta" a="alertas/nueva">
            <ul className="-mx-2 divide-y divide-stone-100">
              {alertasActivas.map((a) => (
                <li key={a.id}>
                  <Enlace a="alertas" className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-campo-50">
                    <span aria-hidden className="text-sm">
                      {RIESGOS[a.nivel].icono}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-900">{a.titulo}</span>
                      <span className="block truncate text-xs text-stone-500">
                        {a.regiones.join(', ')} · {a.productoresAlcanzados.toLocaleString('es-PE')} productores
                      </span>
                    </span>
                  </Enlace>
                </li>
              ))}
              {alertasActivas.length === 0 && <li className="py-6 text-center text-sm text-stone-500">Sin alertas activas.</li>}
            </ul>
          </Widget>
        </div>
      </div>
    </div>
  )
}

/** Bloque del tablero: título con enlace a su acción y contenido con scroll propio */
export function Widget({ titulo, accion, a, children }: { titulo: string; accion: string; a: string; children: ReactNode }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-stone-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-stone-900">{titulo}</h2>
        <Enlace a={a} className="text-xs font-semibold text-campo-700 hover:underline">
          {accion.startsWith('+') ? accion : `${accion} →`}
        </Enlace>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
    </section>
  )
}

export function Indicador({
  valor,
  titulo,
  detalle,
  icono,
  a,
  accion,
  alerta = false,
}: {
  valor: number
  titulo: string
  detalle: string
  icono: string
  a: string
  accion: string
  alerta?: boolean
}) {
  return (
    <Enlace
      a={a}
      className={`group flex flex-col rounded-xl border bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-campo-600 hover:shadow-md ${
        alerta && valor > 0 ? 'border-red-200' : 'border-stone-200'
      }`}
    >
      <div className="flex items-center justify-between text-sm font-medium text-stone-600">
        {titulo}
        <span aria-hidden>{icono}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-stone-900">{valor}</span>
        <span className="truncate text-xs text-stone-500">{detalle}</span>
      </div>
      <span className="mt-1 text-xs font-semibold text-campo-700 group-hover:underline">{accion} →</span>
    </Enlace>
  )
}
