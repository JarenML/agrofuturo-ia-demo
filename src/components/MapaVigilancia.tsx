import { REGIONES, type Caso } from '../data/casos'
import { abierto } from '../ui/comun'
import { PATH_PERU, proyectar } from './MapaPeru'

/**
 * Mapa de vigilancia: un punto por región con casos.
 * Misma regla de colores que la simulación:
 *  rojo  = hay casos abiertos de riesgo alto
 *  ámbar = hay casos abiertos de riesgo medio o bajo
 *  verde = todos los casos de la región están cerrados
 */

export type ColorRegion = 'rojo' | 'ambar' | 'verde'

export const COLORES: Record<ColorRegion, { relleno: string; icono: string; texto: string }> = {
  rojo: { relleno: '#dc2626', icono: '!', texto: 'Riesgo alto, en atención' },
  ambar: { relleno: '#d97706', icono: '…', texto: 'Riesgo medio o bajo, en atención' },
  verde: { relleno: '#16a34a', icono: '✓', texto: 'Casos cerrados' },
}

export function resumenRegiones(casos: Caso[]) {
  const mapa = new Map<string, { region: string; total: number; abiertos: number; altos: number; color: ColorRegion }>()
  for (const c of casos) {
    if (c.estado === 'descartado') continue
    const r = mapa.get(c.region) ?? { region: c.region, total: 0, abiertos: 0, altos: 0, color: 'verde' as ColorRegion }
    r.total++
    if (abierto(c)) {
      r.abiertos++
      if (c.riesgo === 'alto') r.altos++
    }
    r.color = r.altos > 0 ? 'rojo' : r.abiertos > 0 ? 'ambar' : 'verde'
    mapa.set(c.region, r)
  }
  return [...mapa.values()].sort((a, b) => b.altos - a.altos || b.abiertos - a.abiertos)
}

interface Props {
  casos: Caso[]
  seleccionada?: string | null
  onSeleccionar?: (region: string) => void
  etiquetas?: boolean
}

export default function MapaVigilancia({ casos, seleccionada, onSeleccionar, etiquetas = true }: Props) {
  const regiones = resumenRegiones(casos)
  return (
    <svg viewBox="40 0 470 380" className="h-full w-full" role="img" aria-label="Mapa del Perú con casos por región">
      <rect x="40" width="470" height="380" fill="#eef3e6" rx="12" />
      <path d={PATH_PERU} fill="#d7e6c0" stroke="#5c8a3f" strokeWidth="2" strokeLinejoin="round" />
      {regiones.map((r) => {
        const pos = REGIONES[r.region]
        if (!pos) return null
        const { x, y } = proyectar(pos.lon, pos.lat)
        const col = COLORES[r.color]
        const sel = seleccionada === r.region
        const radio = 8 + Math.min(r.total, 4) * 1.5
        const lado = pos.etiqueta
        return (
          <g
            key={r.region}
            transform={`translate(${x} ${y})`}
            onClick={() => onSeleccionar?.(r.region)}
            className={onSeleccionar ? 'cursor-pointer' : ''}
            role={onSeleccionar ? 'button' : undefined}
            aria-label={`${r.region}: ${r.abiertos} casos abiertos`}
          >
            <title>
              {r.region}: {r.abiertos} abiertos, {r.altos} de riesgo alto, {r.total} en total
            </title>
            {/* área de clic más grande que el punto */}
            <circle r={radio + 8} fill="transparent" />
            {r.color === 'rojo' && <circle r={radio + 4} fill={col.relleno} opacity="0.3" className="latir" />}
            {sel && <circle r={radio + 5} fill="none" stroke="#1c1917" strokeWidth="2.5" />}
            <circle r={radio} fill={col.relleno} stroke="#fff" strokeWidth="2.5" />
            <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
              {r.abiertos || col.icono}
            </text>
            {etiquetas && (
              <text
                x={lado === 'izq' ? -radio - 5 : lado === 'der' ? radio + 5 : 0}
                y={lado === 'abajo' ? radio + 15 : 4}
                textAnchor={lado === 'izq' ? 'end' : lado === 'der' ? 'start' : 'middle'}
                fontSize="12"
                fontWeight={sel ? 800 : 600}
                fill="#1f3d16"
                stroke="#eef3e6"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {r.region}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function LeyendaMapa() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-700">
      {(Object.keys(COLORES) as ColorRegion[]).map((k) => (
        <li key={k} className="flex items-center gap-2">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: COLORES[k].relleno }}
          >
            {COLORES[k].icono}
          </span>
          {COLORES[k].texto}
        </li>
      ))}
      <li className="text-stone-500">El número indica los casos abiertos.</li>
    </ul>
  )
}
