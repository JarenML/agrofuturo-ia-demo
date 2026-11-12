import { EncabezadoPagina } from '../ui/comun'

export default function Video() {
  return (
    <div>
      <EncabezadoPagina
        icono="🎬"
        titulo="Video de presentación"
        sub="Conoce AGROFUTURO IA en pocos minutos: cómo llega un caso del productor a SENASA."
      />
      {/* ponytail: ancho completo, pero limitado para que la altura quepa en pantalla sin hacer scroll */}
      <section className="mx-auto w-full overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-stone-200 sm:rounded-2xl sm:p-2 lg:max-w-[calc((100vh-230px)*16/9)]">
        <video
          className="aspect-video w-full rounded-lg bg-stone-900 sm:rounded-xl"
          src={`${import.meta.env.BASE_URL}AGROFUTURO_IA_video.mp4`}
          controls
          preload="metadata"
        />
      </section>
    </div>
  )
}
