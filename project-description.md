# Wakai

## ¿Qué es?

Wakai es una plataforma pensada para acompañar y facilitar la mediación familiar en Chile. Ayuda a los centros de mediación a organizar casos, recordar a las familias sus citas, y da herramientas visuales y digitales para brindar un proceso más tranquilo y eficiente.

## ¿Qué problema resuelve?

La gestión de mediaciones muchas veces es confusa y difícil para las familias y los equipos mediadores. La comunicación suele perderse, hay muchas ausencias a las citas, y es difícil saber cómo se sienten los participantes. Wakai soluciona esto con tecnología sencilla e integrada a la vida cotidiana.

## ¿Cómo funciona?

- **Sitio web**: Para los centros, permite ver todos los casos, el estado de cada participante y registrar intentos de contacto. Un mapa "emocional" ayuda a entender el ánimo general. Interfaz minimalista, clara y amigable.
- **Notificaciones inteligentes**: Recordatorios automáticos para las familias cuando se acerca una cita o hay información importante. Sincronizado con la agenda de los casos.
- **Agente de Telegram**: Un asistente virtual que responde dudas, envía la información justo antes de la cita y permite conversar para aclarar pasos.

## Tecnología

- **Frontend**: React 19 + Vite, Tailwind CSS, componentes shadcn/ui. Diseño mobile-first, accesible y orientado a paz visual.
- **Backend**: Hono en TypeScript sobre Cloudflare Workers. Automatiza notificaciones, consulta la base de datos Supabase, y expone API REST para gestión y consulta de casos.
- **Integración Telegram**: Bot con OpenAI GPT-4 para mensajes conversacionales y confirmaciones automáticas por chat.
- **Base de datos**: Supabase (PostgreSQL) para casos y movimiento de usuarios. Conversaciones almacenadas en JSON.

## Integraciones

- **OpenAI**: Generación y personalización de mensajes (backend y bot)
- **Cloudflare**: Hosting serverless escalable, tareas periódicas (cron jobs).
- **Supabase**: Persistencia de datos estructurados.
- **Telegram**: Canal de interacción directa y simple con familias.

## Equipo

- Ignacio Aguilera, José Fredes, José Diaz, Lucas Oliveri

---

¿Listo para transformar la mediación familiar? Wakai hace que el proceso sea más humano, claro y eficiente, usando tecnología hecha para las personas.
