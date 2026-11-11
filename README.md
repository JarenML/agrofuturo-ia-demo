# AGROFUTURO IA — Prototipo para SENASA

Prototipo navegable de la plataforma que usaría SENASA para atender los casos
fitosanitarios que llegan desde AGROFUTURO IA. **Todo es simulado:** no hay IA,
ni WhatsApp, ni backend, ni datos reales.

## Cómo abrirlo

```bash
npm install
npm run dev
```

Luego abra la dirección que muestra la terminal (por defecto http://localhost:5173).

## Secciones

- **Panel de vigilancia:** indicadores del día, casos que requieren atención, mapa y alertas activas.
- **Bandeja de casos:** casos derivados por los técnicos, con búsqueda, filtros y orden.
- **Ficha del caso:** fotos, prediagnóstico de la IA, validación del técnico, dictamen de SENASA, seguimiento e historial.
- **Mapa de vigilancia:** casos agrupados por región, con detalle al hacer clic.
- **Alertas fitosanitarias:** alertas activas y cerradas, y formulario para emitir una nueva.
- **Simulación del flujo:** la historia de Rosa paso a paso, pensada para presentar.
- **Acerca del sistema:** roles, módulos y botón para restablecer los datos de ejemplo.

## El flujo de un caso

Es el mismo de la simulación, visto desde SENASA:

1. El productor envía una foto por WhatsApp.
2. La IA hace el prediagnóstico.
3. El técnico de la Agencia Agraria lo valida y lo deriva.
4. SENASA toma el caso y emite el dictamen: confirma, corrige, pide inspección o descarta.
5. A los 7 días llega la foto de seguimiento.
6. SENASA cierra el caso y el mapa se actualiza.

Las decisiones se guardan en el navegador, así que se mantienen al recargar.
Para volver al inicio, use "Restablecer datos de ejemplo" en Acerca del sistema.

## Cambiar los datos

- Casos, alertas, regiones y catálogo de diagnósticos: `src/data/casos.ts`.
- Textos de la simulación de Rosa: `src/data/guion.ts`.

## Simulación del flujo

- **Siguiente paso** avanza la historia (10 pasos, unos 2 minutos).
- También se avanza con los botones del chat y con el botón **Validar** del técnico.
- Atajos: flecha derecha o barra espaciadora para avanzar, tecla R para reiniciar.
