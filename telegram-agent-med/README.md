# Telegram Agent Med

Agente de Telegram con OpenAI para enviar y gestionar mensajes de citas de mediaciones familiares.

## Características

- Bot de Telegram interactivo con IA (OpenAI GPT-4)
- Endpoint REST para enviar información de citas de mediación
- Almacenamiento de conversaciones en JSON
- Generación automática de mensajes personalizados usando IA

## Requisitos Previos

- Node.js 18 o superior
- Token de bot de Telegram (obtener de [@BotFather](https://t.me/BotFather))
- API Key de OpenAI (obtener de [OpenAI Platform](https://platform.openai.com/api-keys))

## Instalación

1. Clonar el repositorio o descargar el proyecto

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configurar las variables de entorno en `.env`:
```env
TELEGRAM_BOT_TOKEN=tu_token_aqui
OPENAI_API_KEY=tu_api_key_aqui
PORT=3000
CONVERSATIONS_FILE=./conversations.json
```

## Obtener Token de Telegram

1. Abrir Telegram y buscar [@BotFather](https://t.me/BotFather)
2. Enviar `/newbot`
3. Seguir las instrucciones para crear tu bot
4. Copiar el token que te proporciona BotFather
5. Pegarlo en el archivo `.env` como `TELEGRAM_BOT_TOKEN`

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## API Endpoints

### 1. Enviar Mensaje de Mediación

**Endpoint:** `POST /api/send-mediation`

**Descripción:** Envía un mensaje personalizado de cita de mediación a un usuario de Telegram.

**Body (JSON):**
```json
{
  "phoneNumber": "CHAT_ID_DE_TELEGRAM",
  "appointmentData": {
    "nombre": "Juan Pérez",
    "fecha": "2025-12-01",
    "hora": "10:00 AM",
    "lugar": "Centro de Mediación Familiar, Av. Principal 123",
    "mediador": "Dra. María González",
    "notasAdicionales": "Por favor llegar 10 minutos antes"
  }
}
```

**Nota importante sobre phoneNumber:**
- El `phoneNumber` debe ser el **Chat ID** de Telegram del usuario
- Para obtenerlo, el usuario debe enviar un mensaje al bot primero
- Puedes ver los Chat IDs en el endpoint `/api/conversations`

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/api/send-mediation \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "123456789",
    "appointmentData": {
      "nombre": "Juan Pérez",
      "fecha": "2025-12-01",
      "hora": "10:00 AM",
      "lugar": "Centro de Mediación, Av. Principal 123",
      "mediador": "Dra. María González"
    }
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "sentMessage": "Hola Juan Pérez, te confirmamos tu cita de mediación..."
}
```

### 2. Obtener Todas las Conversaciones

**Endpoint:** `GET /api/conversations`

**Ejemplo:**
```bash
curl http://localhost:3000/api/conversations
```

### 3. Obtener Conversación Específica

**Endpoint:** `GET /api/conversations/:userId`

**Ejemplo:**
```bash
curl http://localhost:3000/api/conversations/123456789
```

### 4. Health Check

**Endpoint:** `GET /health`

**Ejemplo:**
```bash
curl http://localhost:3000/health
```

## Comandos del Bot de Telegram

Los usuarios pueden interactuar con el bot usando estos comandos:

- `/start` - Iniciar conversación con el bot
- `/help` - Mostrar ayuda
- `/clear` - Limpiar historial de conversación

También pueden enviar mensajes de texto directamente para hacer preguntas sobre mediaciones.

## Estructura del Proyecto

```
telegram-agent-med/
├── src/
│   ├── services/
│   │   ├── conversationStore.ts    # Almacenamiento de conversaciones
│   │   └── openaiService.ts        # Integración con OpenAI
│   ├── types.ts                    # Definiciones de tipos TypeScript
│   └── index.ts                    # Punto de entrada principal
├── .env.example                    # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Almacenamiento de Datos

Las conversaciones se guardan en un archivo JSON (`conversations.json` por defecto). Cada conversación incluye:

- ID del usuario
- Mensajes (rol, contenido, timestamp)
- Fecha de creación y última actualización

## Consideraciones de Seguridad

- Las API keys nunca deben compartirse o subirse a repositorios públicos
- El archivo `.env` está en `.gitignore` para evitar exposición de secretos
- Se recomienda implementar autenticación en los endpoints para producción
- Validar y sanitizar todas las entradas de usuarios

## Solución de Problemas

### Error: "No se pudo enviar el mensaje"

El usuario debe iniciar una conversación con el bot primero. Pídele que:
1. Busque el bot en Telegram usando el username que le diste
2. Presione el botón "Start" o envíe `/start`
3. Una vez hecho esto, el bot podrá enviarle mensajes

### Error: Variables de entorno no definidas

Verifica que el archivo `.env` existe y contiene todas las variables necesarias.

### Error de compilación TypeScript

Asegúrate de tener instaladas todas las dependencias:
```bash
npm install
```

## Próximas Mejoras

- Migrar de JSON a base de datos (PostgreSQL/MongoDB)
- Implementar autenticación con JWT
- Agregar rate limiting
- Agregar validación con Zod
- Implementar logging profesional con Winston
- Agregar tests unitarios

## Licencia

ISC
