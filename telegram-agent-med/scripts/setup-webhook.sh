#!/bin/bash

# Script para configurar el webhook de Telegram después del despliegue
# Uso: ./scripts/setup-webhook.sh <BOT_TOKEN> <WORKER_URL>

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Uso: $0 <BOT_TOKEN> <WORKER_URL>"
  echo "Ejemplo: $0 123456789:ABCdefGHIjklMNOpqrsTUVwxyz https://telegram-agent-med.tu-subdominio.workers.dev"
  exit 1
fi

BOT_TOKEN=$1
WORKER_URL=$2
WEBHOOK_URL="${WORKER_URL}/webhook"

echo "Configurando webhook de Telegram..."
echo "URL del webhook: $WEBHOOK_URL"

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")

echo "Respuesta de Telegram:"
echo $RESPONSE | jq '.'

# Verificar el webhook
echo ""
echo "Verificando webhook configurado..."
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq '.'

