import type { Ilustracion } from '../data/guion'

/**
 * Ilustraciones simples en SVG. No se usan imágenes de internet.
 */

function Venas() {
  return (
    <g stroke="#2f6322" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.55">
      <path d="M100 32 L100 182" />
      <path d="M100 70 C 120 66, 138 74, 152 90" />
      <path d="M100 70 C 80 66, 62 74, 48 90" />
      <path d="M100 105 C 122 102, 140 110, 154 126" />
      <path d="M100 105 C 78 102, 60 110, 46 126" />
      <path d="M100 140 C 116 138, 128 144, 136 156" />
      <path d="M100 140 C 84 138, 72 144, 64 156" />
    </g>
  )
}

const HOJA = 'M100 20 C 158 40, 184 104, 102 186 C 18 104, 42 40, 100 20 Z'

export function HojaEnferma({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Hoja de papa con manchas de rancha">
      <rect width="200" height="200" rx="14" fill="#e9e3d2" />
      <path d="M100 186 L100 198" stroke="#5c7f3a" strokeWidth="5" strokeLinecap="round" />
      <path d={HOJA} fill="#7fa64b" />
      <path d={HOJA} fill="url(#amarillo)" />
      <defs>
        <radialGradient id="amarillo" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0.55" stopColor="#7fa64b" stopOpacity="0" />
          <stop offset="1" stopColor="#c9b53b" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <Venas />
      {/* Manchas de rancha: halo amarillo + centro marrón oscuro */}
      <g>
        <ellipse cx="72" cy="92" rx="20" ry="16" fill="#c5b14a" opacity="0.8" />
        <ellipse cx="72" cy="92" rx="13" ry="10" fill="#5a3a1c" />
        <ellipse cx="128" cy="118" rx="23" ry="18" fill="#c5b14a" opacity="0.8" />
        <ellipse cx="128" cy="118" rx="16" ry="12" fill="#4d3016" />
        <ellipse cx="96" cy="150" rx="15" ry="12" fill="#c5b14a" opacity="0.8" />
        <ellipse cx="96" cy="150" rx="9" ry="7" fill="#5a3a1c" />
        <ellipse cx="118" cy="62" rx="11" ry="9" fill="#c5b14a" opacity="0.8" />
        <ellipse cx="118" cy="62" rx="6" ry="5" fill="#5a3a1c" />
        {/* borde necrosado */}
        <path d="M150 128 C 158 118, 160 108, 156 96" stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
      </g>
    </svg>
  )
}

export function HojaSana({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Hoja de papa sana">
      <rect width="200" height="200" rx="14" fill="#e3ead3" />
      <path d="M100 186 L100 198" stroke="#5c7f3a" strokeWidth="5" strokeLinecap="round" />
      <path d={HOJA} fill="#5f9a3c" />
      <path d={HOJA} fill="url(#brillo)" />
      <defs>
        <radialGradient id="brillo" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#9ed172" stopOpacity="0.7" />
          <stop offset="1" stopColor="#5f9a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Venas />
      <circle cx="140" cy="52" r="9" fill="#ffffff" opacity="0.55" />
    </svg>
  )
}

export function Cacao({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Mazorca de cacao con moniliasis">
      <rect width="200" height="200" rx="14" fill="#e9dfc9" />
      {/* rama */}
      <path d="M40 40 C 70 44, 85 60, 92 74" stroke="#6b4a2b" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* mazorca */}
      <path
        d="M100 68 C 140 70, 152 110, 146 142 C 140 172, 118 186, 100 186 C 82 186, 60 172, 54 142 C 48 110, 60 70, 100 68 Z"
        fill="#d98c2b"
      />
      <path
        d="M100 68 C 140 70, 152 110, 146 142 C 140 172, 118 186, 100 186 C 82 186, 60 172, 54 142 C 48 110, 60 70, 100 68 Z"
        fill="url(#cacaoSombra)"
      />
      <defs>
        <linearGradient id="cacaoSombra" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f0b24a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8f4f12" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {/* surcos */}
      <g stroke="#9c5a14" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M80 76 C 72 110, 72 150, 82 182" />
        <path d="M100 70 C 96 110, 96 150, 100 186" />
        <path d="M120 76 C 128 110, 128 150, 118 182" />
      </g>
      {/* moniliasis: manchas marrón oscuro con polvo blanco */}
      <path d="M62 120 C 70 108, 96 108, 104 126 C 108 142, 84 150, 70 142 C 60 136, 58 128, 62 120 Z" fill="#5a3a1c" />
      <path d="M68 122 C 76 114, 92 114, 98 126 C 100 136, 84 142, 74 136 C 66 132, 66 128, 68 122 Z" fill="#f4ecd8" opacity="0.9" />
      <circle cx="74" cy="124" r="2" fill="#5a3a1c" opacity="0.5" />
      <circle cx="88" cy="131" r="2.4" fill="#5a3a1c" opacity="0.5" />
      <circle cx="82" cy="120" r="1.6" fill="#5a3a1c" opacity="0.5" />
      <path d="M112 152 C 120 146, 134 150, 134 162 C 134 170, 120 174, 112 168 C 106 164, 106 156, 112 152 Z" fill="#5a3a1c" />
      <path d="M116 156 C 122 152, 130 154, 130 161 C 130 166, 120 168, 116 164 C 112 162, 112 158, 116 156 Z" fill="#f4ecd8" opacity="0.85" />
    </svg>
  )
}

export function Imagen({ tipo, className }: { tipo: Ilustracion; className?: string }) {
  if (tipo === 'hojaEnferma') return <HojaEnferma className={className} />
  if (tipo === 'hojaSana') return <HojaSana className={className} />
  return <Cacao className={className} />
}
