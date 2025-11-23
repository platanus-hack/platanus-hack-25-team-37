#!/bin/bash

# Script para probar los endpoints de ChatKit
# Uso: ./test-chatkit.sh [local|production]

ENVIRONMENT=${1:-local}

if [ "$ENVIRONMENT" = "local" ]; then
  BASE_URL="http://localhost:8787"
  echo "🧪 Testing ChatKit endpoints LOCALLY"
else
  BASE_URL="https://wakai-backend.josebmxfredes.workers.dev"
  echo "🧪 Testing ChatKit endpoints in PRODUCTION"
fi

echo ""
echo "Base URL: $BASE_URL"
echo "================================================"

# Test 1: Start session
echo ""
echo "📍 Test 1: POST /api/chatkit/start"
echo "Creating new ChatKit session..."
START_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chatkit/start" \
  -H "Content-Type: application/json")

echo "$START_RESPONSE" | jq '.'

# Extract client_secret for refresh test
CLIENT_SECRET=$(echo "$START_RESPONSE" | jq -r '.client_secret // empty')

if [ -z "$CLIENT_SECRET" ]; then
  echo "❌ Failed to get client_secret from start endpoint"
  exit 1
fi

echo "✅ Got client_secret: ${CLIENT_SECRET:0:20}..."

# Test 2: Refresh session
echo ""
echo "================================================"
echo "📍 Test 2: POST /api/chatkit/refresh"
echo "Refreshing ChatKit session..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chatkit/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"currentClientSecret\": \"$CLIENT_SECRET\"}")

echo "$REFRESH_RESPONSE" | jq '.'

NEW_CLIENT_SECRET=$(echo "$REFRESH_RESPONSE" | jq -r '.client_secret // empty')

if [ -z "$NEW_CLIENT_SECRET" ]; then
  echo "❌ Failed to refresh session"
  exit 1
fi

echo "✅ Got new client_secret: ${NEW_CLIENT_SECRET:0:20}..."

echo ""
echo "================================================"
echo "✅ All ChatKit tests passed!"
echo ""
echo "Next steps:"
echo "1. Configure OPENAI_API_KEY: wrangler secret put OPENAI_API_KEY"
echo "2. Deploy: npm run deploy"
echo "3. Add domain to OpenAI allowlist"
echo "4. Test in frontend"
