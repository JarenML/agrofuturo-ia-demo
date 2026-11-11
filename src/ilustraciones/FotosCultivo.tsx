import type { ReactNode } from 'react'
import type { FotoId } from '../data/casos'
import { Cacao, HojaEnferma, HojaSana } from './Ilustraciones'

/**
 * "Fotos" de los casos, dibujadas en SVG. Cada cultivo tiene una versión
 * enferma (foto inicial) y una sana (foto de seguimiento del día 7).
 */

interface Props {
  foto: FotoId
  sano?: boolean
  className?: string
}

export default function FotoCaso({ foto, sano = false, className = '' }: Props) {
  switch (foto) {
    case 'papa_rancha':
      return sano ? <HojaSana className={className} /> : <HojaEnferma className={className} />
    case 'cacao_monilia':
      return sano ? <CacaoSano className={className} /> : <Cacao className={className} />
    case 'cafe_roya':
      return <Hoja className={className} forma="eliptica" verde="#3f6f2a" fondo="#e6e1cf" sano={sano} manchas={ROYA} />
    case 'arroz_pyricularia':
      return <Hoja className={className} forma="larga" verde="#7aa54a" fondo="#ebe6d2" sano={sano} manchas={ROMBOS} />
    case 'maiz_cogollero':
      return <Hoja className={className} forma="ancha-larga" verde="#5e9a3a" fondo="#ece4cf" sano={sano} manchas={HUECOS} />
    case 'quinua_mildiu':
      return <Hoja className={className} forma="rombica" verde="#6f9e45" fondo="#e9e2cf" sano={sano} manchas={MILDIU} />
    case 'palta_fitoftora':
      return <Hoja className={className} forma="eliptica" verde="#4c7a33" fondo="#e7e2d0" sano={sano} manchas={BORDE_SECO} />
    case 'citrico_fumagina':
      return <Hoja className={className} forma="eliptica" verde="#5b8f36" fondo="#ebe5d0" sano={sano} manchas={HOLLIN} />
  }
}

// ---------- Hoja genérica ----------

type Forma = 'eliptica' | 'larga' | 'ancha-larga' | 'rombica'

const FORMAS: Record<Forma, string> = {
  eliptica: 'M100 22 C 160 46, 172 120, 100 182 C 28 120, 40 46, 100 22 Z',
  larga: 'M100 10 C 116 60, 116 140, 100 192 C 84 140, 84 60, 100 10 Z',
  'ancha-larga': 'M100 10 C 130 60, 132 140, 100 192 C 68 140, 70 60, 100 10 Z',
  rombica: 'M100 22 L 160 96 C 150 132, 124 160, 100 182 C 76 160, 50 132, 40 96 Z',
}

type Manchas = (sano: boolean) => ReactNode

function Hoja({
  forma,
  verde,
  fondo,
  sano,
  manchas,
  className,
}: {
  forma: Forma
  verde: string
  fondo: string
  sano: boolean
  manchas: Manchas
  className?: string
}) {
  const d = FORMAS[forma]
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={sano ? 'Hoja sana' : 'Hoja con síntomas'}>
      <rect width="200" height="200" rx="14" fill={fondo} />
      <path d={d} fill={sano ? verde : mezclar(verde)} />
      <path d="M100 18 L100 190" stroke="#2f5a1e" strokeWidth="2" opacity="0.5" />
      {forma !== 'larga' && (
        <g stroke="#2f5a1e" strokeWidth="1.6" fill="none" opacity="0.4">
          <path d="M100 70 C 115 66, 128 72, 140 84" />
          <path d="M100 70 C 85 66, 72 72, 60 84" />
          <path d="M100 110 C 116 106, 130 114, 140 126" />
          <path d="M100 110 C 84 106, 70 114, 60 126" />
        </g>
      )}
      {!sano && manchas(sano)}
      {sano && <circle cx="128" cy="58" r="7" fill="#fff" opacity="0.45" />}
    </svg>
  )
}

/** Hoja enferma: un poco más amarillenta */
const mezclar = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 255) + 30)
  const g = Math.min(255, ((n >> 8) & 255) + 12)
  const b = n & 255
  return `rgb(${r},${g},${b})`
}

const ROYA: Manchas = () => (
  <g>
    {[
      [78, 80, 10],
      [122, 96, 12],
      [92, 130, 9],
      [130, 140, 7],
      [70, 116, 6],
      [110, 60, 6],
    ].map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r + 5} fill="#d9c25a" opacity="0.7" />
        <circle cx={x} cy={y} r={r} fill="#e88a1a" />
        <circle cx={x - 2} cy={y - 2} r={r / 3} fill="#f6c25a" />
      </g>
    ))}
  </g>
)

const ROMBOS: Manchas = () => (
  <g>
    {[50, 90, 128, 160].map((y, i) => (
      <g key={i} transform={`translate(${i % 2 ? 104 : 96} ${y})`}>
        <path d="M0 -14 L6 0 L0 14 L-6 0 Z" fill="#8a5a2b" />
        <path d="M0 -9 L3.5 0 L0 9 L-3.5 0 Z" fill="#cfc8b8" />
      </g>
    ))}
  </g>
)

const HUECOS: Manchas = () => (
  <g>
    {[
      [92, 60, 9, 6],
      [110, 84, 7, 10],
      [96, 112, 11, 7],
      [108, 140, 6, 8],
    ].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#ece4cf" stroke="#8a6a3a" strokeWidth="1.5" />
    ))}
    {[
      [100, 30],
      [104, 36],
      [97, 40],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2.5" fill="#6b4a2b" />
    ))}
  </g>
)

const MILDIU: Manchas = () => (
  <g>
    {[
      [80, 92, 18, 13],
      [124, 104, 16, 12],
      [100, 140, 15, 11],
    ].map(([x, y, rx, ry], i) => (
      <g key={i}>
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#e2d266" opacity="0.9" />
        <ellipse cx={x + 2} cy={y + 2} rx={rx / 2} ry={ry / 2} fill="#9a958a" opacity="0.7" />
      </g>
    ))}
  </g>
)

const BORDE_SECO: Manchas = () => (
  <g>
    <path d="M100 22 C 160 46, 172 120, 100 182" fill="none" stroke="#7a5230" strokeWidth="10" opacity="0.85" />
    <path d="M100 22 C 40 46, 30 90, 40 110" fill="none" stroke="#7a5230" strokeWidth="7" opacity="0.7" />
  </g>
)

const HOLLIN: Manchas = () => (
  <g>
    <ellipse cx="96" cy="96" rx="34" ry="28" fill="#2b2b2b" opacity="0.55" />
    <ellipse cx="120" cy="134" rx="18" ry="14" fill="#2b2b2b" opacity="0.5" />
    <ellipse cx="78" cy="132" rx="14" ry="20" fill="#e2d266" opacity="0.6" />
    {[
      [70, 70],
      [130, 80],
      [112, 64],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="3" ry="2" fill="#ffffff" />
    ))}
  </g>
)

function CacaoSano({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Mazorca de cacao sana">
      <rect width="200" height="200" rx="14" fill="#e3ead3" />
      <path d="M40 40 C 70 44, 85 60, 92 74" stroke="#6b4a2b" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path
        d="M100 68 C 140 70, 152 110, 146 142 C 140 172, 118 186, 100 186 C 82 186, 60 172, 54 142 C 48 110, 60 70, 100 68 Z"
        fill="#e7a83a"
      />
      <g stroke="#b06d1a" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M80 76 C 72 110, 72 150, 82 182" />
        <path d="M100 70 C 96 110, 96 150, 100 186" />
        <path d="M120 76 C 128 110, 128 150, 118 182" />
      </g>
      <ellipse cx="82" cy="104" rx="8" ry="16" fill="#fff" opacity="0.3" />
    </svg>
  )
}
