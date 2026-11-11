import { useState } from 'react'
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
  fechaHora,
  haceCuanto,
} from '../ui/comun'

export default function DetalleCaso({ id }: { id: string }) {
  const { casos } = useEstado()
  const caso = casos.find((c) => c.id === id)

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

  const problema = caso.dictamen?.problema ?? caso.prediagnostico.problema

  return (
    <div>
      <Enlace a="casos" className="text-sm font-semibold text-campo-700 hover:underline">
        ← Bandeja de casos
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
            Reportado {haceCuanto(caso.fecha)} por {caso.productor} · Derivado por {caso.tecnico}, {caso.agencia}
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
          <PanelDecision caso={caso} />
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
                : 'La foto de seguimiento llega 7 días después del dictamen'}
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
      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
        ✅ Validó las recomendaciones al productor y derivó el caso a SENASA.
      </div>
      <div className="mt-3 text-sm font-semibold text-stone-700">Motivo de la derivación</div>
      <p className="mt-1 text-stone-800">{caso.notaTecnico}</p>
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
  const { despachar, avisar } = useEstado()
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
          avisar('Nota interna agregada al historial.')
        }}
      >
        <input
          className={claseCampo}
          placeholder="Agregar una nota interna (solo visible para SENASA)"
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

// ---------- Panel de decisión de SENASA ----------

type Decision = 'confirmar' | 'corregir' | 'inspeccion' | 'descartar'

function PanelDecision({ caso }: { caso: Caso }) {
  const { despachar, avisar } = useEstado()

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

      {caso.estado === 'seguimiento' && !caso.seguimiento && (
        <Tarjeta titulo="Seguimiento">
          <p className="text-stone-700">
            El productor recibió el dictamen y las recomendaciones. AGROFUTURO IA le pedirá una nueva foto a los 7 días.
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
      )}

      {caso.estado === 'seguimiento' && caso.seguimiento && (
        <Tarjeta titulo="Foto de seguimiento recibida">
          <div
            className={`rounded-lg px-3 py-2 ${
              caso.seguimiento.mejoro ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {caso.seguimiento.mejoro ? '🌱 El cultivo mejoró' : '🥀 El problema sigue avanzando'}
          </div>
          <p className="mt-2 text-sm text-stone-700">{caso.seguimiento.nota}</p>
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
        </Tarjeta>
      )}

      {caso.estado === 'cerrado' && (
        <Tarjeta titulo="Caso cerrado">
          <p className="text-stone-700">
            El cultivo mejoró y el caso se cerró. En el mapa de vigilancia, este caso ya cuenta como atendido.
          </p>
        </Tarjeta>
      )}

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
  const alternativas = (CATALOGO[caso.cultivo] ?? []).filter((x) => x.problema !== caso.prediagnostico.problema)
  const [decision, setDecision] = useState<Decision>('confirmar')
  const [correccion, setCorreccion] = useState(alternativas[0]?.problema ?? '')
  const [nota, setNota] = useState('')

  const opciones: { id: Decision; titulo: string; detalle: string; oculta?: boolean }[] = [
    { id: 'confirmar', titulo: 'Confirmar diagnóstico', detalle: `Es ${caso.prediagnostico.problema}, como indicó la IA.` },
    { id: 'corregir', titulo: 'Corregir diagnóstico', detalle: 'La IA se equivocó: elegir el problema correcto.' },
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
          Al registrarlo se avisa al productor por WhatsApp y empieza el seguimiento de 7 días.
        </p>
      )}
    </Tarjeta>
  )
}
