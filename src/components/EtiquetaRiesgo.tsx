/** El riesgo se muestra con color Y con icono a la vez. */
const ESTILOS = {
  alto: { icono: '🔴', texto: 'Riesgo alto', clase: 'bg-red-100 text-red-800 border-red-300' },
  medio: { icono: '🟠', texto: 'Riesgo medio', clase: 'bg-amber-100 text-amber-800 border-amber-300' },
  bajo: { icono: '🟢', texto: 'Riesgo bajo', clase: 'bg-green-100 text-green-800 border-green-300' },
}

export function EtiquetaRiesgo({ nivel, grande = false }: { nivel: keyof typeof ESTILOS; grande?: boolean }) {
  const e = ESTILOS[nivel]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${e.clase} ${
        grande ? 'px-4 py-1.5 text-lg' : 'px-3 py-1 text-base'
      }`}
    >
      <span aria-hidden>{e.icono}</span>
      {e.texto}
    </span>
  )
}

export function Estado({ texto, tono }: { texto: string; tono: 'gris' | 'ambar' | 'azul' | 'verde' }) {
  const clase = {
    gris: 'bg-stone-100 text-stone-700 border-stone-300',
    ambar: 'bg-amber-100 text-amber-800 border-amber-300',
    azul: 'bg-sky-100 text-sky-800 border-sky-300',
    verde: 'bg-green-100 text-green-800 border-green-300',
  }[tono]
  return <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${clase}`}>{texto}</span>
}
