import { useMemo, useState } from 'react'
import { CATALOGO, CULTIVOS, LISTA_REGIONES, USUARIO, estimarAlcance, type Riesgo } from '../data/casos'
import { nuevoIdAlerta, useEstado } from '../estado/store'
import {
  EncabezadoPagina,
  Enlace,
  RIESGOS,
  Tarjeta,
  claseBoton,
  claseCampo,
  fechaHora,
  haceCuanto,
  ir,
} from '../ui/comun'

export function ListaAlertas() {
  const { alertas, despachar, avisar } = useEstado()
  const [ver, setVer] = useState<'activa' | 'cerrada'>('activa')
  const lista = alertas.filter((a) => a.estado === ver)

  return (
    <div>
      <EncabezadoPagina
        titulo="Alertas fitosanitarias"
        sub="Avisos que SENASA envía por WhatsApp a los productores de las zonas afectadas."
        accion={
          <Enlace a="alertas/nueva" className={claseBoton.primario}>
            + Nueva alerta
          </Enlace>
        }
      />
      <div className="mb-4 flex gap-1" role="tablist">
        {(['activa', 'cerrada'] as const).map((e) => (
          <button
            key={e}
            type="button"
            role="tab"
            aria-selected={ver === e}
            onClick={() => setVer(e)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              ver === e ? 'bg-campo-700 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-campo-50'
            }`}
          >
            {e === 'activa' ? 'Activas' : 'Cerradas'} ({alertas.filter((a) => a.estado === e).length})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {lista.map((a) => (
          <article key={a.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono font-semibold text-stone-500">{a.id}</span>
              <span className={`rounded-full px-2.5 py-0.5 font-semibold ring-1 ${RIESGOS[a.nivel].clase}`}>
                {RIESGOS[a.nivel].icono} Nivel {RIESGOS[a.nivel].texto.toLowerCase()}
              </span>
              <span className="text-stone-500">{haceCuanto(a.fecha)}</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-stone-900">{a.titulo}</h2>
            <div className="text-sm text-stone-600">
              {a.cultivo} · {a.problema} · {a.regiones.join(', ')}
            </div>
            <p className="mt-3 rounded-lg bg-chat-rosa/50 p-3 text-stone-800">{a.mensaje}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
              <span>
                📱 <strong className="tabular-nums">{a.productoresAlcanzados.toLocaleString('es-PE')}</strong> productores avisados
              </span>
              <span>Emitida por {a.emitidaPor}</span>
              {a.casoOrigen && (
                <Enlace a={`casos/${a.casoOrigen}`} className="font-semibold text-campo-700 hover:underline">
                  Caso {a.casoOrigen}
                </Enlace>
              )}
            </div>
            {a.estado === 'activa' && (
              <button
                type="button"
                className={`${claseBoton.secundario} mt-4`}
                onClick={() => {
                  despachar({ tipo: 'cerrarAlerta', id: a.id })
                  avisar(`Alerta ${a.id} cerrada.`)
                }}
              >
                Cerrar alerta
              </button>
            )}
          </article>
        ))}
        {lista.length === 0 && <p className="py-10 text-stone-500">No hay alertas {ver === 'activa' ? 'activas' : 'cerradas'}.</p>}
      </div>
    </div>
  )
}

export function NuevaAlerta({ consulta }: { consulta: URLSearchParams }) {
  const { casos, alertas, despachar, avisar } = useEstado()
  const origen = casos.find((c) => c.id === consulta.get('caso'))

  const [cultivo, setCultivo] = useState(origen?.cultivo ?? 'Papa')
  const [problema, setProblema] = useState(origen?.dictamen?.problema ?? origen?.prediagnostico.problema ?? CATALOGO.Papa[0].problema)
  const [regiones, setRegiones] = useState<string[]>(origen ? [origen.region] : [])
  const [nivel, setNivel] = useState<Riesgo>(origen?.riesgo === 'bajo' ? 'medio' : (origen?.riesgo ?? 'alto'))
  const [mensajeEditado, setMensajeEditado] = useState<string | null>(null)

  const problemas = CATALOGO[cultivo] ?? []
  const mensajeSugerido = `⚠️ Alerta SENASA: se confirmó ${problema.toLowerCase()} en ${cultivo.toLowerCase()} en ${
    regiones.length ? regiones.join(', ') : 'su zona'
  }. Revise sus plantas hoy. Si ve síntomas, envíe una foto a este número o avise a su técnico.`
  const mensaje = mensajeEditado ?? mensajeSugerido
  const titulo = `${problema} en ${cultivo.toLowerCase()}${regiones.length ? ' — ' + regiones.join(', ') : ''}`
  const alcance = useMemo(() => estimarAlcance(regiones, cultivo), [regiones, cultivo])
  const valido = regiones.length > 0 && mensaje.trim().length > 10

  const alternar = (r: string) => setRegiones((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))

  const emitir = () => {
    if (!valido) return
    const id = nuevoIdAlerta(alertas)
    despachar({
      tipo: 'emitirAlerta',
      alerta: {
        id,
        fecha: new Date().toISOString(),
        titulo,
        problema,
        cultivo,
        regiones,
        nivel,
        mensaje,
        estado: 'activa',
        emitidaPor: USUARIO.nombre,
        casoOrigen: origen?.id,
        productoresAlcanzados: alcance,
      },
    })
    avisar(`Alerta ${id} emitida a ${alcance.toLocaleString('es-PE')} productores (simulado).`)
    ir('alertas')
  }

  return (
    <div>
      <Enlace a="alertas" className="text-sm font-semibold text-campo-700 hover:underline">
        ← Alertas fitosanitarias
      </Enlace>
      <div className="mt-2">
        <EncabezadoPagina
          titulo="Nueva alerta fitosanitaria"
          sub={
            origen ? (
              <>
                A partir del caso{' '}
                <Enlace a={`casos/${origen.id}`} className="font-semibold text-campo-700 hover:underline">
                  {origen.id}
                </Enlace>{' '}
                ({origen.distrito}, {origen.region})
              </>
            ) : (
              'El mensaje llega por WhatsApp a los productores registrados del cultivo en las regiones elegidas.'
            )
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Tarjeta>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">Cultivo</span>
              <select
                className={claseCampo}
                value={cultivo}
                onChange={(e) => {
                  setCultivo(e.target.value)
                  setProblema(CATALOGO[e.target.value]?.[0]?.problema ?? '')
                }}
              >
                {CULTIVOS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">Plaga o enfermedad</span>
              <select className={claseCampo} value={problema} onChange={(e) => setProblema(e.target.value)}>
                {problemas.map((p) => (
                  <option key={p.problema} value={p.problema}>
                    {p.problema}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold text-stone-700">Nivel</legend>
            <div className="flex flex-wrap gap-2">
              {(['alto', 'medio', 'bajo'] as Riesgo[]).map((n) => (
                <label
                  key={n}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                    nivel === n ? 'border-campo-600 bg-campo-50 ring-1 ring-campo-600' : 'border-stone-200'
                  }`}
                >
                  <input type="radio" name="nivel" checked={nivel === n} onChange={() => setNivel(n)} className="accent-campo-700" />
                  {RIESGOS[n].icono} {RIESGOS[n].texto}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold text-stone-700">
              Regiones <span className="font-normal text-stone-500">({regiones.length} elegidas)</span>
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LISTA_REGIONES.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm text-stone-800">
                  <input type="checkbox" checked={regiones.includes(r)} onChange={() => alternar(r)} className="h-4 w-4 accent-campo-700" />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block">
            <span className="mb-1 flex items-center justify-between text-sm font-semibold text-stone-700">
              Mensaje a los productores
              {mensajeEditado !== null && (
                <button type="button" onClick={() => setMensajeEditado(null)} className="text-xs font-semibold text-campo-700 hover:underline">
                  Usar mensaje sugerido
                </button>
              )}
            </span>
            <textarea
              className={`${claseCampo} min-h-[110px]`}
              value={mensaje}
              onChange={(e) => setMensajeEditado(e.target.value)}
            />
            <span className="mt-1 block text-xs text-stone-500">Frases cortas, trato de usted y sin tecnicismos.</span>
          </label>
        </Tarjeta>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Tarjeta titulo="Vista previa en el celular">
            <div className="rounded-xl bg-chat-fondo p-3">
              <div className="mb-2 text-center text-xs font-semibold text-stone-500">AGROFUTURO IA</div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[15px] leading-snug shadow-sm">
                {mensaje}
                <div className="mt-1 text-right text-[10px] text-stone-400">{fechaHora(new Date().toISOString())}</div>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-sm text-stone-600">Llegará a aproximadamente</span>
              <span className="text-2xl font-bold tabular-nums text-stone-900">{alcance.toLocaleString('es-PE')}</span>
            </div>
            <div className="text-right text-xs text-stone-500">productores de {cultivo.toLowerCase()} (simulado)</div>
          </Tarjeta>
          <button type="button" className={`${claseBoton.primario} w-full py-3`} disabled={!valido} onClick={emitir}>
            📣 Emitir alerta
          </button>
          {!regiones.length && <p className="text-center text-sm text-stone-500">Elija al menos una región.</p>}
        </div>
      </div>
    </div>
  )
}
