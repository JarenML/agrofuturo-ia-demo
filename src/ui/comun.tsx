import { useEffect, useState, type ReactNode } from 'react'
import type { Caso, EstadoCasoSenasa, Riesgo } from '../data/casos'

// ---------- Navegación (hash) ----------

export function useRuta() {
  const leer = () => window.location.hash.replace(/^#\/?/, '') || 'inicio'
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const f = () => {
      setRuta(leer())
      document.getElementById('contenido')?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  const [camino, consulta = ''] = ruta.split('?')
  return { partes: camino.split('/').filter(Boolean), consulta: new URLSearchParams(consulta) }
}

export const ir = (ruta: string) => {
  window.location.hash = '/' + ruta
}

export function Enlace({ a, className, children }: { a: string; className?: string; children: ReactNode }) {
  return (
    <a href={'#/' + a} className={className}>
      {children}
    </a>
  )
}

// ---------- Fechas ----------

export function haceCuanto(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'hace 1 día' : `hace ${d} días`
}

export function fechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------- Estado y riesgo ----------

export const ESTADOS: Record<EstadoCasoSenasa, { texto: string; icono: string; clase: string }> = {
  por_validar: { texto: 'Por validar', icono: '🕓', clase: 'bg-orange-50 text-orange-800 ring-orange-300' },
  por_revisar: { texto: 'Por revisar', icono: '⏳', clase: 'bg-amber-50 text-amber-800 ring-amber-300' },
  en_revision: { texto: 'En revisión', icono: '🔎', clase: 'bg-sky-50 text-sky-800 ring-sky-300' },
  inspeccion: { texto: 'Inspección solicitada', icono: '🧪', clase: 'bg-violet-50 text-violet-800 ring-violet-300' },
  seguimiento: { texto: 'En seguimiento', icono: '📅', clase: 'bg-teal-50 text-teal-800 ring-teal-300' },
  cerrado: { texto: 'Cerrado', icono: '✅', clase: 'bg-green-50 text-green-800 ring-green-300' },
  descartado: { texto: 'Descartado', icono: '⛔', clase: 'bg-stone-100 text-stone-600 ring-stone-300' },
}

export function InsigniaEstado({ estado }: { estado: EstadoCasoSenasa }) {
  const e = ESTADOS[estado]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ring-1 ${e.clase}`}>
      <span aria-hidden>{e.icono}</span>
      {e.texto}
    </span>
  )
}

export const RIESGOS: Record<Riesgo, { texto: string; icono: string; clase: string }> = {
  alto: { texto: 'Alto', icono: '🔴', clase: 'bg-red-50 text-red-800 ring-red-300' },
  medio: { texto: 'Medio', icono: '🟠', clase: 'bg-amber-50 text-amber-800 ring-amber-300' },
  bajo: { texto: 'Bajo', icono: '🟢', clase: 'bg-green-50 text-green-800 ring-green-300' },
}

export function InsigniaRiesgo({ riesgo }: { riesgo: Riesgo }) {
  const r = RIESGOS[riesgo]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ring-1 ${r.clase}`}>
      <span aria-hidden className="text-xs">
        {r.icono}
      </span>
      {r.texto}
    </span>
  )
}

export const abierto = (c: Caso) => c.estado !== 'cerrado' && c.estado !== 'descartado'

/** El caso está en manos de SENASA (derivado y sin dictamen todavía) */
export const enSenasa = (c: Caso) =>
  c.estado === 'por_revisar' || c.estado === 'en_revision' || c.estado === 'inspeccion'

/** Diagnóstico vigente: el de SENASA, si no el corregido por el técnico, si no el de la IA */
export function diagnosticoVigente(c: Caso): { problema: string; agente: string } {
  if (c.dictamen) return { problema: c.dictamen.problema, agente: c.dictamen.agente }
  if (c.correccionTecnico) return c.correccionTecnico
  return { problema: c.prediagnostico.problema, agente: c.prediagnostico.agente }
}

// ---------- Roles ----------

/** SENASA ve solo los casos derivados; el técnico, los de su Agencia Agraria */
export type Rol = 'senasa' | 'tecnico'

// ---------- Etapas del flujo (las mismas de la simulación) ----------

export const ETAPAS = [
  { titulo: 'Foto recibida', quien: 'Productor' },
  { titulo: 'Prediagnóstico IA', quien: 'AGROFUTURO IA' },
  { titulo: 'Validado por técnico', quien: 'Agencia Agraria' },
  { titulo: 'Dictamen SENASA', quien: 'Especialista' },
  { titulo: 'Seguimiento día 7', quien: 'Productor + IA' },
  { titulo: 'Caso cerrado', quien: 'SENASA' },
]

/** Índice de la etapa en curso (0-5). 6 = todas completas. */
export function etapaActual(c: Caso): number {
  switch (c.estado) {
    case 'por_validar':
      return 2
    case 'por_revisar':
    case 'en_revision':
    case 'inspeccion':
      return 3
    case 'seguimiento':
      return c.seguimiento ? 5 : 4
    case 'cerrado':
      return 6
    case 'descartado':
      return 4
  }
}

export function LineaFlujo({ caso, compacta = false }: { caso: Caso; compacta?: boolean }) {
  const actual = etapaActual(caso)
  const descartado = caso.estado === 'descartado'
  // Si el técnico resolvió el caso sin derivarlo, SENASA no participa
  const sinSenasa = !caso.derivado && caso.estado !== 'por_validar'
  return (
    <ol className={`grid grid-cols-3 gap-y-3 sm:grid-cols-6 ${compacta ? 'text-xs' : 'text-sm'}`}>
      {ETAPAS.map((e0, i) => {
        const e = sinSenasa && i === 5 ? { ...e0, quien: 'Técnico' } : e0
        const noAplica = (descartado && i >= 4) || (sinSenasa && i === 3)
        const hecho = i < actual && !noAplica
        const enCurso = i === actual && !descartado
        return (
          <li key={e.titulo} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3.5 hidden h-0.5 w-full sm:block ${i <= actual ? 'bg-campo-600' : 'bg-stone-200'}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                noAplica
                  ? 'bg-stone-100 text-stone-400'
                  : hecho
                    ? 'bg-campo-600 text-white'
                    : enCurso
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-stone-200 text-stone-500'
              }`}
            >
              {noAplica ? '–' : hecho ? '✓' : i + 1}
            </span>
            <span className={`mt-1 font-semibold leading-tight ${hecho || enCurso ? 'text-stone-900' : 'text-stone-400'}`}>
              {e.titulo}
            </span>
            {!compacta && (
              <span className="text-xs text-stone-500">
                {noAplica ? (sinSenasa ? 'No derivado' : 'No aplica') : enCurso ? 'En curso' : e.quien}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ---------- Contenedores ----------

export function Tarjeta({ titulo, accion, children, className = '' }: { titulo?: ReactNode; accion?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {(titulo || accion) && (
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3">
          <h2 className="font-semibold text-stone-900">{titulo}</h2>
          {accion}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function EncabezadoPagina({ titulo, sub, accion }: { titulo: string; sub?: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{titulo}</h1>
        {sub && <p className="mt-1 text-stone-600">{sub}</p>}
      </div>
      {accion}
    </div>
  )
}

export const claseBoton = {
  primario: 'inline-flex items-center justify-center gap-2 rounded-lg bg-campo-700 px-4 py-2 font-semibold text-white shadow-sm hover:bg-campo-800 disabled:cursor-not-allowed disabled:bg-stone-300',
  secundario: 'inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50',
  peligro: 'inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50',
}

export const claseCampo =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-campo-600 focus:outline-none focus:ring-2 focus:ring-campo-200'
