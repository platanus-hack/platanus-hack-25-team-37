# Wakai Backend - Sistema de Notificaciones de Mediación

Backend en Hono para Cloudflare Workers que maneja notificaciones automáticas de casos de mediación vía Telegram.

## Características

- 📅 **Cron Job Diario**: Envía notificaciones automáticas a las 12:00 del día
- 💬 **API de Conversaciones**: Endpoints para consultar conversaciones y chat IDs
- 📱 **Integración Telegram**: Envío de notificaciones a solicitantes y demandados
- 🗄️ **Base de Datos Supabase**: Gestión de casos de mediación
- ☁️ **Cloudflare Workers**: Deploy serverless escalable

## Endpoints

### GET `/`
Health check del servicio

### GET `/api/conversations`
Obtiene todas las conversaciones registradas

### GET `/api/chat-ids`
Obtiene todos los chat IDs únicos

### GET `/api/conversations/:chatId`
Obtiene las conversaciones de un chat ID específico

### POST `/api/send-notifications`
Trigger manual para enviar notificaciones (útil para testing)

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.dev.vars` (para desarrollo local):

```env
DATABASE_URL=postgresql://user:password@host:5432/database
TELEGRAM_API_URL=https://telegram-agent-med.josebmxfredes.workers.dev/api/send-mediation
```

### 3. Configurar secretos en Cloudflare

```bash
wrangler secret put DATABASE_URL
wrangler secret put TELEGRAM_API_URL
```

## Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:8787`

## Deploy a Cloudflare

```bash
npm run deploy
```

## Estructura del Proyecto

```
src/
├── index.ts      # Aplicación principal y endpoints
├── cron.ts       # Lógica del cron job
├── db.ts         # Funciones de base de datos
├── telegram.ts   # Integración con Telegram
└── types.ts      # Tipos TypeScript
```

## Cron Job

El cron job se ejecuta automáticamente todos los días a las 12:00 (mediodía) según la configuración en `wrangler.toml`:

```toml
[triggers]
crons = ["0 12 * * *"]
```

### Funcionalidad del Cron

1. Busca casos con sesión programada para el día actual
2. Envía notificación al solicitante (si tiene móvil registrado)
3. Envía notificación al demandado (si tiene móvil registrado)
4. Registra éxitos y fallos en logs

## Base de Datos

### Tablas Utilizadas

- `mediation_cases`: Casos de mediación con información de las partes
- `interaction_data`: Datos de interacciones y conversaciones
- `output_ai_report`: Reportes generados por IA

## Testing

Puedes probar el envío de notificaciones manualmente:

```bash
curl -X POST https://tu-worker.workers.dev/api/send-notifications
```

## Monitoreo

Los logs del cron job y de las operaciones se pueden ver en el dashboard de Cloudflare Workers o con:

```bash
wrangler tail
```

## Licencia

MIT
