import type { PuntoMapa } from '../data/guion'

/**
 * Mapa del Perú dibujado a mano en SVG (silueta aproximada).
 * Proyección simple: x = (lon + 81.6) * 20 + margen ; y = (-lat + 0.3) * 20
 */

const ESCALA = 20
const MARGEN_X = 140
const proyectar = (lon: number, lat: number) => ({
  x: (lon + 81.6) * ESCALA + MARGEN_X,
  y: (-lat + 0.3) * ESCALA,
})

// Vértices aproximados de la silueta (longitud, latitud), sentido horario desde Tumbes
const SILUETA: [number, number][] = [
  [-80.4, -3.4], // Tumbes
  [-80.3, -4.0],
  [-79.6, -4.5], // frontera Ecuador
  [-78.9, -4.6],
  [-78.3, -3.4],
  [-77.6, -2.9],
  [-76.7, -2.4],
  [-75.6, -0.9],
  [-75.3, -0.1], // Güeppí
  [-74.3, -1.0], // Putumayo
  [-73.2, -1.8],
  [-72.0, -2.4],
  [-70.4, -2.6],
  [-70.0, -4.3], // Leticia / tres fronteras
  [-71.0, -4.7],
  [-72.6, -5.6], // Yavarí
  [-73.9, -7.4],
  [-73.2, -9.4],
  [-72.3, -9.6],
  [-70.6, -9.4],
  [-70.6, -11.0],
  [-69.6, -10.9], // Madre de Dios
  [-68.7, -12.5],
  [-69.4, -14.6],
  [-68.9, -15.5],
  [-69.0, -16.6], // Titicaca
  [-69.8, -17.7],
  [-70.4, -18.3], // Tacna
  [-71.3, -17.7],
  [-72.0, -17.0],
  [-73.4, -16.5],
  [-74.6, -15.9],
  [-75.3, -15.4],
  [-76.2, -13.9],
  [-76.5, -13.4],
  [-77.1, -12.1], // Lima
  [-77.6, -11.0],
  [-78.6, -9.2],
  [-79.0, -8.1],
  [-79.9, -6.8],
  [-81.0, -5.9], // Sechura
  [-81.3, -4.3], // Punta Pariñas
]

const PATH_PERU =
  SILUETA.map(([lon, lat], i) => {
    const { x, y } = proyectar(lon, lat)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ') + ' Z'

const COLOR_ESTADO = {
  alto: '#dc2626',
  proceso: '#d97706',
  cerrado: '#16a34a',
}

const ICONO_ESTADO = {
  alto: '!',
  proceso: '…',
  cerrado: '✓',
}

/** Lado donde va la etiqueta de cada punto, para que no se encimen */
const IZQUIERDA = new Set(['lambayeque', 'huancavelica'])

interface Props {
  puntos: PuntoMapa[]
  /** id del punto que debe "latir" para llamar la atención */
  destacado?: string
}

export default function MapaPeru({ puntos, destacado }: Props) {
  return (
    <svg viewBox="0 0 490 380" className="w-full h-full" role="img" aria-label="Mapa del Perú con casos simulados">
      {/* océano / fondo */}
      <rect width="490" height="380" fill="#eaf1e2" rx="12" />
      {/* silueta */}
      <path d={PATH_PERU} fill="#cfe0b6" stroke="#5c8a3f" strokeWidth="2" strokeLinejoin="round" />
      {/* Puntos */}
      {puntos.map((p) => {
        const { x, y } = proyectar(p.lon, p.lat)
        const color = COLOR_ESTADO[p.estado]
        const esDestacado = p.id === destacado
        return (
          <g key={p.id} transform={`translate(${x} ${y})`}>
            {esDestacado && <circle r="12" fill={color} opacity="0.35" className="latir" />}
            <circle r="9" fill={color} stroke="#ffffff" strokeWidth="2.5" />
            <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
              {ICONO_ESTADO[p.estado]}
            </text>
            <text
              x={IZQUIERDA.has(p.id) ? -14 : 14}
              y="4"
              textAnchor={IZQUIERDA.has(p.id) ? 'end' : 'start'}
              fontSize="13"
              fontWeight="700"
              fill="#244c1b"
            >
              {p.cultivo} · {p.region}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
