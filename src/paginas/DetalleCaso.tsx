import { useState, type ReactNode } from 'react'
import { CATALOGO, USUARIO, type Caso, type EventoHistorial } from '../data/casos'
import { useEstado } from '../estado/store'
import FotoCaso from '../ilustraciones/FotosCultivo'
import {
  Enlace,
  InsigniaEstado,
  InsigniaRiesgo,
  LineaFlujo,
  Tarjeta,
  claseBoton,
  claseCampo,
  diagnosticoVigente,
  enSenasa,
  fechaHora,
  haceCuanto,
} from '../ui/comun'

export default function DetalleCaso({ id }: { id: string }) {
  const { casos, rol } = useEstado()
  const caso = casos.find((c) => c.id === id)
  const esTecnico = rol === 'tecnico'

  if (!caso) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-stone-600">No se encontró el caso {id}.</p>
        <Enlace a="casos" className={`${claseBoton.secundario} mt-4`}>
          Volver a la bandeja
        </Enlace>
      </div>
    )
  }

  const problema = diagnosticoVigente(caso).problema
  const origen =
    caso.estado === 'por_validar'
      ? `Pendiente de validación de ${caso.tecnico}, ${caso.agencia}`
      : caso.derivado
        ? `Derivado por ${caso.tecnico}, ${caso.agencia}`
        : `Atendido por ${caso.tecnico}, ${caso.agencia} (sin derivar a SENASA)`

  return (
    <div>
      <Enlace a="casos" className="text-sm font-semibold text-campo-700 hover:underline">
        ← {esTecnico ? 'Mis casos' : 'Bandeja de casos'}
      </Enlace>

      <div className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono font-semibold text-stone-500">{caso.id}</span>
            <InsigniaEstado estado={caso.estado} />
            <InsigniaRiesgo riesgo={caso.riesgo} />
            {caso.plagaRegulada && (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-sm font-semibold text-white">
                ⚠ Posible plaga regulada
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">
            {problema} en {caso.cultivo.toLowerCase()} — {caso.distrito}, {caso.region}
          </h1>
          <p className="text-stone-600">
            Reportado {haceCuanto(caso.fecha)} por {caso.productor} · {origen}
          </p>
        </div>
      </div>

      <Tarjeta className="mb-6">
        <LineaFlujo caso={caso} />
      </Tarjeta>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Fotos caso={caso} />
            <DatosProductor caso={caso} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Prediagnostico caso={caso} />
            <ValidacionTecnico caso={caso} />
          </div>
          <Historial caso={caso} />
        </div>

        <div className="xl:sticky xl:top-20 xl:self-start">
          {esTecnico ? <PanelTecnico caso={caso} /> : <PanelDecision caso={caso} />}
        </div>
      </div>
    </div>
  )
}

// ---------- Bloques de información ----------

function Fotos({ caso }: { caso: Caso }) {
  return (
    <Tarjeta titulo="Fotos del productor">
      <div className="grid grid-cols-2 gap-4">
        <figure>
          <FotoCaso foto={caso.foto} className="aspect-square w-full rounded-lg ring-1 ring-stone-200" />
          <figcaption className="mt-1 text-sm text-stone-600">Foto inicial · {fechaHora(caso.fecha)}</figcaption>
        </figure>
        <figure>
          {caso.seguimiento ? (
            <>
              <FotoCaso
                foto={caso.foto}
                sano={caso.seguimiento.mejoro}
                className={`aspect-square w-full rounded-lg ring-2 ${caso.seguimiento.mejoro ? 'ring-green-500' : 'ring-red-400'}`}
              />
              <figcaption className="mt-1 text-sm text-stone-600">
                Seguimiento día 7 · {fechaHora(caso.seguimiento.fecha)}
              </figcaption>
            </>
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-200 p-3 text-center text-sm text-stone-400">
              <span className="text-2xl" aria-hidden>
                📷
              </span>
              {caso.estado === 'seguimiento'
                ? 'Esperando la foto de seguimiento (día 7)'
                : 'La foto de seguimiento llega 7 días después de la validación o del dictamen'}
            </div>
          )}
        </figure>
      </div>
      <p className="mt-3 text-sm italic text-stone-600">“{caso.sintomasReportados}”</p>
    </Tarjeta>
  )
}

function DatosProductor({ caso }: { caso: Caso }) {
  const filas: [string, string][] = [
    ['Productor', caso.productor],
    ['Teléfono', caso.telefono],
    ['Ubicación', `${caso.distrito}, ${caso.provincia}, ${caso.region}`],
    ['Altitud', caso.altitud],
    ['Cultivo', `${caso.cultivo} · ${caso.variedad}`],
    ['Superficie', caso.superficie],
    ['Canal', 'WhatsApp (AGROFUTURO IA)'],
  ]
  return (
    <Tarjeta titulo="Productor y parcela">
      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
        {filas.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-stone-500">{k}</dt>
            <dd className="text-stone-900">{v}</dd>
          </div>
        ))}
      </dl>
    </Tarjeta>
  )
}

function Prediagnostico({ caso }: { caso: Caso }) {
  const p = caso.prediagnostico
  const baja = p.confianza < 70
  return (
    <Tarjeta titulo="Prediagnóstico de la IA">
      <div className="text-lg font-bold text-stone-900">{p.problema}</div>
      <div className="text-sm italic text-stone-600">{p.agente}</div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-stone-600">Confianza del modelo</span>
          <span className={`font-semibold tabular-nums ${baja ? 'text-red-700' : 'text-stone-900'}`}>
            {p.confianza} %{baja && ' · baja'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-100">
          <div
            className={`h-2 rounded-full ${baja ? 'bg-red-500' : 'bg-campo-600'}`}
            style={{ width: `${p.confianza}%` }}
          />
        </div>
      </div>
      <div className="mt-4 text-sm font-semibold text-stone-700">Síntomas detectados</div>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-700">
        {p.sintomas.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="mt-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-500">
        Es un prediagnóstico automático. No reemplaza la evaluación del técnico ni el dictamen de SENASA.
      </p>
    </Tarjeta>
  )
}

function ValidacionTecnico({ caso }: { caso: Caso }) {
  const pendiente = caso.estado === 'por_validar'
  return (
    <Tarjeta titulo="Validación del técnico">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-campo-100 text-lg" aria-hidden>
          👨‍🌾
        </span>
        <div>
          <div className="font-semibold text-stone-900">{caso.tecnico}</div>
          <div className="text-sm text-stone-600">{caso.agencia}</div>
        </div>
      </div>
      {pendiente ? (
        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          🕓 Pendiente de validación. El productor ya recibió las recomendaciones iniciales de la IA.
        </div>
      ) : (
        <>
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            ✅ {caso.correccionTecnico ? 'Corrigió' : 'Validó'} el prediagnóstico y{' '}
            {caso.derivado ? 'derivó el caso a SENASA.' : 'atiende el caso desde la Agencia Agraria.'}
          </div>
          {caso.correccionTecnico && (
            <div className="mt-3 text-sm text-stone-700">
              Diagnóstico del técnico: <strong>{caso.correccionTecnico.problema}</strong>{' '}
              <span className="italic">({caso.correccionTecnico.agente})</span>
            </div>
          )}
          {caso.notaTecnico && (
            <>
              <div className="mt-3 text-sm font-semibold text-stone-700">
                {caso.derivado ? 'Motivo de la derivación' : 'Nota del técnico'}
              </div>
              <p className="mt-1 text-stone-800">{caso.notaTecnico}</p>
            </>
          )}
        </>
      )}
    </Tarjeta>
  )
}

const ICONO_ROL: Record<EventoHistorial['rol'], string> = {
  productor: '📱',
  ia: '🤖',
  tecnico: '👨‍🌾',
  senasa: '🔬',
  sistema: '⚙️',
}

function Historial({ caso }: { caso: Caso }) {
  const { despachar, avisar, rol } = useEstado()
  const [nota, setNota] = useState('')
  const eventos = [...caso.historial].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <Tarjeta titulo="Historial del caso">
      <ol className="relative space-y-4 border-l-2 border-stone-100 pl-6">
        {eventos.map((e, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[38px] flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm ring-2 ring-stone-100"
              aria-hidden
            >
              {ICONO_ROL[e.rol]}
            </span>
            <div className="text-sm">
              <span className="font-semibold text-stone-900">{e.autor}</span>
              <span className="text-stone-500"> · {fechaHora(e.fecha)}</span>
            </div>
            <p className="text-stone-700">{e.texto}</p>
          </li>
        ))}
      </ol>
      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={(ev) => {
          ev.preventDefault()
          if (!nota.trim()) return
          despachar({ tipo: 'comentar', id: caso.id, texto: nota.trim() })
          setNota('')
          avisar('Nota agregada al historial.')
        }}
      >
        <input
          className={claseCampo}
          placeholder={rol === 'tecnico' ? 'Agregar una nota al caso' : 'Agregar una nota interna'}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
        <button type="submit" className={claseBoton.secundario} disabled={!nota.trim()}>
          Agregar
        </button>
      </form>
    </Tarjeta>
  )
}

// ---------- Bloques compartidos ----------

/** Botones para simular la llegada de la foto del día 7 */
function SimularSeguimiento({ caso }: { caso: Caso }) {
  const { despachar, avisar } = useEstado()
  return (
    <Tarjeta titulo="Seguimiento">
      <p className="text-stone-700">
        El productor recibió las recomendaciones. AGROFUTURO IA le pedirá una nueva foto a los 7 días.
      </p>
      <div className="mt-4 rounded-lg border border-dashed border-stone-300 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Solo para la demostración</div>
        <p className="mt-1 text-sm text-stone-600">Simule la llegada de la foto del día 7:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className={claseBoton.secundario}
            onClick={() => {
              despachar({ tipo: 'registrarSeguimiento', id: caso.id, mejoro: true })
              avisar('Llegó la foto de seguimiento: el cultivo mejoró.')
            }}
          >
            🌱 El cultivo mejoró
          </button>
          <button
            type="button"
            className={claseBoton.secundario}
            onClick={() => {
              despachar({ tipo: 'registrarSeguimiento', id: caso.id, mejoro: false })
              avisar('Llegó la foto de seguimiento: el problema sigue.')
            }}
          >
            🥀 No mejoró
          </button>
        </div>
      </div>
    </Tarjeta>
  )
}

function ResultadoSeguimiento({ caso, children }: { caso: Caso; children?: ReactNode }) {
  const s = caso.seguimiento!
  return (
    <Tarjeta titulo="Foto de seguimiento recibida">
      <div className={`rounded-lg px-3 py-2 ${s.mejoro ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
        {s.mejoro ? '🌱 El cultivo mejoró' : '🥀 El problema sigue avanzando'}
      </div>
      <p className="mt-2 text-sm text-stone-700">{s.nota}</p>
      {children}
    </Tarjeta>
  )
}

function CasoCerrado() {
  return (
    <Tarjeta titulo="Caso cerrado">
      <p className="text-stone-700">
        El cultivo mejoró y el caso se cerró. En el mapa de vigilancia, este caso ya cuenta como atendido.
      </p>
    </Tarjeta>
  )
}

// ---------- Panel del técnico agrario ----------

function PanelTecnico({ caso }: { caso: Caso }) {
  const { despachar, avisar } = useEstado()

  if (caso.estado === 'por_validar') return <FormValidacion caso={caso} />

  const verificado = caso.historial.some((e) => e.rol === 'tecnico' && e.texto.includes('verificó la mejora'))

  return (
    <div className="space-y-6">
      {enSenasa(caso) && (
        <Tarjeta titulo="En manos de SENASA">
          <p className="text-stone-700">
            {caso.estado === 'por_revisar' && 'El caso espera que un especialista de SENASA lo tome.'}
            {caso.estado === 'en_revision' && `${caso.asignadoA ?? 'Un especialista'} está revisando el caso.`}
            {caso.estado === 'inspeccion' &&
              'SENASA pidió una inspección en campo y una muestra para laboratorio. Coordine la visita con la sede regional.'}
          </p>
          <p className="mt-2 text-sm text-stone-500">Recibirá el dictamen aquí y por WhatsApp.</p>
        </Tarjeta>
      )}

      {caso.dictamen && <ResumenDictamen caso={caso} />}

      {caso.estado === 'descartado' && (
        <Tarjeta titulo="Devuelto a la Agencia Agraria">
          <p className="text-stone-700">SENASA descartó una plaga de importancia. Continúe la atención con el productor.</p>
        </Tarjeta>
      )}

      {caso.estado === 'seguimiento' && !caso.seguimiento && (
        <>
          <SimularSeguimiento caso={caso} />
          {!caso.derivado && (
            <button
              type="button"
              className={`${claseBoton.secundario} w-full`}
              onClick={() => {
                despachar({ tipo: 'derivar', id: caso.id, nota: 'El técnico solicita la evaluación de SENASA.' })
                avisar('Caso derivado a SENASA.')
              }}
            >
              Derivar a SENASA
            </button>
          )}
        </>
      )}

      {caso.estado === 'seguimiento' && caso.seguimiento && (
        <ResultadoSeguimiento caso={caso}>
          {caso.seguimiento.mejoro ? (
            caso.derivado ? (
              <>
                {verificado ? (
                  <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">✅ Usted verificó la mejora en campo.</p>
                ) : (
                  <button
                    type="button"
                    className={`${claseBoton.primario} mt-4 w-full`}
                    onClick={() => {
                      despachar({ tipo: 'verificarCampo', id: caso.id, nota: '' })
                      avisar('Verificación en campo registrada.')
                    }}
                  >
                    Registrar verificación en campo
                  </button>
                )}
                <p className="mt-2 text-sm text-stone-500">SENASA cerrará el caso, porque fue derivado.</p>
              </>
            ) : (
              <button
                type="button"
                className={`${claseBoton.primario} mt-4 w-full`}
                onClick={() => {
                  despachar({ tipo: 'cerrar', id: caso.id, nota: '' })
                  avisar(`Caso ${caso.id} cerrado.`)
                }}
              >
                ✅ Cerrar caso
              </button>
            )
          ) : caso.derivado ? (
            <p className="mt-4 text-sm text-stone-600">SENASA evaluará de nuevo el caso.</p>
          ) : (
            <button
              type="button"
              className={`${claseBoton.primario} mt-4 w-full`}
              onClick={() => {
                despachar({ tipo: 'derivar', id: caso.id, nota: 'El cultivo no mejoró con las recomendaciones.' })
                avisar('Caso derivado a SENASA.')
              }}
            >
              Derivar a SENASA
            </button>
          )}
        </ResultadoSeguimiento>
      )}

      {caso.estado === 'cerrado' && <CasoCerrado />}
    </div>
  )
}

function FormValidacion({ caso }: { caso: Caso }) {
  const { despachar, avisar } = useEstado()
  const alternativas = (CATALOGO[caso.cultivo] ?? []).filter((x) => x.problema !== caso.prediagnostico.problema)

  // Motivos para derivar a SENASA (los mismos criterios del flujo)
  const motivos = [
    caso.riesgo === 'alto' && 'el riesgo es alto',
    caso.prediagnostico.confianza < 70 && 'la IA tiene baja confianza',
    caso.plagaRegulada && 'puede ser una plaga regulada',
  ].filter(Boolean) as string[]

  const [decision, setDecision] = useState<'validar' | 'corregir'>('validar')
  const [correccion, setCorreccion] = useState(alternativas[0]?.problema ?? '')
  const [derivar, setDerivar] = useState(motivos.length > 0)
  const [nota, setNota] = useState('')

  const registrar = () => {
    const corr = decision === 'corregir' ? alternativas.find((a) => a.problema === correccion) : undefined
    const n = nota.trim() || (derivar && motivos.length ? `Se deriva porque ${motivos.join(', ')}.` : '')
    despachar({ tipo: 'validarTecnico', id: caso.id, correccion: corr, derivar, nota: n })
    avisar(derivar ? 'Caso validado y derivado a SENASA.' : 'Caso validado. Se avisó al productor.')
  }

  return (
    <Tarjeta titulo="Su validación">
      <fieldset className="space-y-2">
        {(
          [
            { id: 'validar', titulo: 'Validar prediagnóstico', detalle: `Es ${caso.prediagnostico.problema}, como indicó la IA.` },
            { id: 'corregir', titulo: 'Corregir prediagnóstico', detalle: 'La IA se equivocó: elegir el problema correcto.' },
          ] as const
        ).map((o) => (
          <label
            key={o.id}
            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
              decision === o.id ? 'border-campo-600 bg-campo-50 ring-1 ring-campo-600' : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <input
              type="radio"
              name="validacion"
              className="mt-1 accent-campo-700"
              checked={decision === o.id}
              onChange={() => setDecision(o.id)}
            />
            <span>
              <span className="block font-semibold text-stone-900">{o.titulo}</span>
              <span className="block text-sm text-stone-600">{o.detalle}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {decision === 'corregir' && (
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold text-stone-700">Diagnóstico correcto</span>
          <select className={claseCampo} value={correccion} onChange={(e) => setCorreccion(e.target.value)}>
            {alternativas.map((a) => (
              <option key={a.problema} value={a.problema}>
                {a.problema} ({a.agente})
              </option>
            ))}
          </select>
        </label>
      )}

      <div
        className={`mt-4 rounded-lg px-3 py-2 text-sm ${
          motivos.length ? 'bg-amber-50 text-amber-900' : 'bg-stone-50 text-stone-700'
        }`}
      >
        {motivos.length
          ? `Se recomienda derivar a SENASA porque ${motivos.join(', ')}.`
          : 'No hace falta derivar: puede atenderlo desde la Agencia Agraria.'}
      </div>
      <label className="mt-3 flex items-center gap-2 font-semibold text-stone-800">
        <input
          type="checkbox"
          checked={derivar}
          onChange={(e) => setDerivar(e.target.checked)}
          className="h-4 w-4 accent-campo-700"
        />
        Derivar a SENASA
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold text-stone-700">
          {derivar ? 'Motivo de la derivación (para SENASA)' : 'Nota para el productor'}
        </span>
        <textarea
          className={`${claseCampo} min-h-[80px]`}
          placeholder={derivar ? 'Ej.: hay varios reportes parecidos en la zona.' : 'Ej.: retire las hojas afectadas y vuelva a escribir en 7 días.'}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </label>

      <button type="button" className={`${claseBoton.primario} mt-4 w-full`} onClick={registrar}>
        {derivar ? 'Validar y derivar a SENASA' : 'Validar y avisar al productor'}
      </button>
      <p className="mt-2 text-xs text-stone-500">
        El productor recibe: “✅ Recomendación validada por el técnico de la Agencia Agraria.”
        {!derivar && ' Empieza el seguimiento de 7 días.'}
      </p>
    </Tarjeta>
  )
}

// ---------- Panel de decisión de SENASA ----------

type Decision = 'confirmar' | 'corregir' | 'inspeccion' | 'descartar'

function PanelDecision({ caso }: { caso: Caso }) {
  const { despachar, avisar } = useEstado()

  if (!caso.derivado) {
    return (
      <Tarjeta titulo="Dictamen de SENASA">
        <p className="text-stone-700">
          Este caso no fue derivado a SENASA. Lo atiende {caso.tecnico}, de la {caso.agencia}.
        </p>
      </Tarjeta>
    )
  }

  if (caso.estado === 'por_revisar') {
    return (
      <Tarjeta titulo="Dictamen de SENASA">
        <p className="text-stone-700">Este caso todavía no tiene un especialista responsable.</p>
        <button
          type="button"
          className={`${claseBoton.primario} mt-4 w-full`}
          onClick={() => {
            despachar({ tipo: 'tomar', id: caso.id })
            avisar(`Tomó el caso ${caso.id}.`)
          }}
        >
          Tomar caso
        </button>
        <p className="mt-3 text-sm text-stone-500">
          Al tomarlo, el caso queda asignado a {USUARIO.nombre} y el técnico ve que SENASA lo está revisando.
        </p>
      </Tarjeta>
    )
  }

  if (caso.estado === 'en_revision' || caso.estado === 'inspeccion') {
    return <FormDictamen caso={caso} />
  }

  // Ya hay dictamen
  return (
    <div className="space-y-6">
      {caso.dictamen && <ResumenDictamen caso={caso} />}

      {caso.estado === 'seguimiento' && !caso.seguimiento && <SimularSeguimiento caso={caso} />}

      {caso.estado === 'seguimiento' && caso.seguimiento && (
        <ResultadoSeguimiento caso={caso}>
          {caso.seguimiento.mejoro ? (
            <button
              type="button"
              className={`${claseBoton.primario} mt-4 w-full`}
              onClick={() => {
                despachar({ tipo: 'cerrar', id: caso.id, nota: '' })
                avisar(`Caso ${caso.id} cerrado. El punto de ${caso.region} se actualiza en el mapa.`)
              }}
            >
              ✅ Cerrar caso
            </button>
          ) : (
            <button
              type="button"
              className={`${claseBoton.primario} mt-4 w-full`}
              onClick={() => {
                despachar({ tipo: 'reabrir', id: caso.id, nota: 'El cultivo no mejoró con las recomendaciones.' })
                avisar('Caso reabierto para nueva evaluación.')
              }}
            >
              Reabrir para nueva evaluación
            </button>
          )}
        </ResultadoSeguimiento>
      )}

      {caso.estado === 'cerrado' && <CasoCerrado />}

      {caso.dictamen && caso.dictamen.tipo !== 'descartado' && (
        <Enlace a={`alertas/nueva?caso=${caso.id}`} className={`${claseBoton.secundario} w-full`}>
          📣 Emitir alerta para la zona
        </Enlace>
      )}
    </div>
  )
}

function ResumenDictamen({ caso }: { caso: Caso }) {
  const d = caso.dictamen!
  const titulo = { confirmado: 'Diagnóstico confirmado', corregido: 'Diagnóstico corregido', descartado: 'Caso descartado' }[d.tipo]
  return (
    <Tarjeta titulo="Dictamen de SENASA">
      <div
        className={`rounded-lg px-3 py-2 font-semibold ${
          d.tipo === 'descartado' ? 'bg-stone-100 text-stone-700' : 'bg-green-50 text-green-800'
        }`}
      >
        {d.tipo === 'descartado' ? '⛔' : '✅'} {titulo}
      </div>
      <div className="mt-3 font-bold text-stone-900">{d.problema}</div>
      {d.agente !== '—' && <div className="text-sm italic text-stone-600">{d.agente}</div>}
      {d.tipo === 'corregido' && (
        <div className="mt-1 text-sm text-stone-600">
          La IA había sugerido: <span className="line-through">{caso.prediagnostico.problema}</span>
        </div>
      )}
      {d.nota && <p className="mt-2 text-stone-700">{d.nota}</p>}
      <div className="mt-3 text-sm text-stone-500">
        {d.autor} · {fechaHora(d.fecha)}
      </div>
    </Tarjeta>
  )
}

function FormDictamen({ caso }: { caso: Caso }) {
  const { despachar, avisar } = useEstado()
  const vigente = diagnosticoVigente(caso)
  const alternativas = (CATALOGO[caso.cultivo] ?? []).filter((x) => x.problema !== vigente.problema)
  const [decision, setDecision] = useState<Decision>('confirmar')
  const [correccion, setCorreccion] = useState(alternativas[0]?.problema ?? '')
  const [nota, setNota] = useState('')

  const opciones: { id: Decision; titulo: string; detalle: string; oculta?: boolean }[] = [
    {
      id: 'confirmar',
      titulo: 'Confirmar diagnóstico',
      detalle: `Es ${vigente.problema}, como indicó ${caso.correccionTecnico ? 'el técnico' : 'la IA'}.`,
    },
    { id: 'corregir', titulo: 'Corregir diagnóstico', detalle: 'Elegir el problema correcto.' },
    {
      id: 'inspeccion',
      titulo: 'Solicitar inspección',
      detalle: 'Visita a campo y muestra para laboratorio.',
      oculta: caso.estado === 'inspeccion',
    },
    { id: 'descartar', titulo: 'Descartar', detalle: 'No es plaga ni enfermedad de importancia.' },
  ]

  const registrar = () => {
    const n = nota.trim()
    if (decision === 'confirmar') {
      despachar({ tipo: 'confirmar', id: caso.id, nota: n })
      avisar('Dictamen registrado. Se notificó al productor y al técnico.')
    } else if (decision === 'corregir') {
      const sel = alternativas.find((a) => a.problema === correccion)
      if (!sel) return
      despachar({ tipo: 'corregir', id: caso.id, problema: sel.problema, agente: sel.agente, nota: n })
      avisar('Diagnóstico corregido. Se notificó al productor y al técnico.')
    } else if (decision === 'inspeccion') {
      despachar({ tipo: 'inspeccion', id: caso.id, nota: n })
      avisar('Inspección solicitada a la sede regional.')
    } else {
      despachar({ tipo: 'descartar', id: caso.id, nota: n })
      avisar('Caso descartado y devuelto a la Agencia Agraria.')
    }
    setNota('')
  }

  return (
    <Tarjeta titulo="Dictamen de SENASA">
      {caso.estado === 'inspeccion' && (
        <div className="mb-4 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800">
          🧪 Inspección en campo solicitada. Registre el dictamen cuando tenga los resultados.
        </div>
      )}
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm text-stone-600">
          Responsable: <strong>{caso.asignadoA}</strong>
        </legend>
        {opciones
          .filter((o) => !o.oculta)
          .map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                decision === o.id ? 'border-campo-600 bg-campo-50 ring-1 ring-campo-600' : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <input
                type="radio"
                name="decision"
                className="mt-1 accent-campo-700"
                checked={decision === o.id}
                onChange={() => setDecision(o.id)}
              />
              <span>
                <span className="block font-semibold text-stone-900">{o.titulo}</span>
                <span className="block text-sm text-stone-600">{o.detalle}</span>
              </span>
            </label>
          ))}
      </fieldset>

      {decision === 'corregir' && (
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold text-stone-700">Diagnóstico correcto</span>
          <select className={claseCampo} value={correccion} onChange={(e) => setCorreccion(e.target.value)}>
            {alternativas.map((a) => (
              <option key={a.problema} value={a.problema}>
                {a.problema} ({a.agente})
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold text-stone-700">
          {decision === 'inspeccion' ? 'Indicaciones para la inspección' : 'Nota para el técnico y el productor'}
        </span>
        <textarea
          className={`${claseCampo} min-h-[80px]`}
          placeholder={
            decision === 'inspeccion'
              ? 'Ej.: tomar 5 muestras de hojas y raíces.'
              : 'Ej.: reforzar el retiro de hojas afectadas y evitar el riego por aspersión.'
          }
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </label>

      <button type="button" className={`${claseBoton.primario} mt-4 w-full`} onClick={registrar}>
        {decision === 'inspeccion' ? 'Solicitar inspección' : 'Registrar dictamen'}
      </button>
      {(decision === 'confirmar' || decision === 'corregir') && (
        <p className="mt-2 text-xs text-stone-500">
          Al registrarlo se avisa al productor y al técnico, y empieza el seguimiento de 7 días.
        </p>
      )}
    </Tarjeta>
  )
}
