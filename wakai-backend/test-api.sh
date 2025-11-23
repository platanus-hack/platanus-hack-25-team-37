#!/bin/bash

# Wakai Backend - API Testing Script
# Reemplaza YOUR_WORKER_URL con la URL de tu worker deployeado

WORKER_URL="https://wakai-backend.josebmxfredes.workers.dev"

echo "🧪 Testing Wakai Backend API"
echo "================================"
echo ""

# Test 1: Health Check
echo "📊 Test 1: Health Check"
echo "curl $WORKER_URL/"
curl -s "$WORKER_URL/" | jq .
echo ""
echo ""

# Test 2: Get all conversations
echo "💬 Test 2: Get all conversations"
echo "curl $WORKER_URL/api/conversations"
curl -s "$WORKER_URL/api/conversations" | jq .
echo ""
echo ""

# Test 3: Get all chat IDs
echo "🆔 Test 3: Get all chat IDs"
echo "curl $WORKER_URL/api/chat-ids"
curl -s "$WORKER_URL/api/chat-ids" | jq .
echo ""
echo ""

# Test 4: Get conversation by chat ID
echo "🔍 Test 4: Get conversation by specific chat ID"
CHAT_ID="973106061"  # Reemplaza con un chat ID real
echo "curl $WORKER_URL/api/conversations/$CHAT_ID"
curl -s "$WORKER_URL/api/conversations/$CHAT_ID" | jq .
echo ""
echo ""

# Test 5: Manual trigger for notifications
echo "📨 Test 5: Manual trigger for notifications (testing only)"
echo "curl -X POST $WORKER_URL/api/send-notifications"
curl -s -X POST "$WORKER_URL/api/send-notifications" | jq .
echo ""
echo ""

echo "✅ Tests completed!"
echo ""
echo "Nota: Asegúrate de:"
echo "1. Reemplazar WORKER_URL con tu URL real"
echo "2. Configurar los secrets en Cloudflare:"
echo "   - wrangler secret put DATABASE_URL"
echo "   - wrangler secret put TELEGRAM_API_URL"
