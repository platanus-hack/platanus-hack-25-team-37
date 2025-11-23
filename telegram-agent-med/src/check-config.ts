import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('🔍 Verificando configuración del proyecto...\n');

let hasErrors = false;

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: No se encontró el archivo .env');
  console.log('   Solución: Ejecuta "cp .env.example .env" y edita el archivo con tus credenciales\n');
  hasErrors = true;
} else {
  console.log('✅ Archivo .env encontrado');
}

const requiredEnvVars = {
  TELEGRAM_BOT_TOKEN: 'Token de Telegram Bot (obtener de @BotFather)',
  OPENAI_API_KEY: 'API Key de OpenAI (obtener de https://platform.openai.com/api-keys)',
};

const optionalEnvVars = {
  PORT: 'Puerto del servidor (por defecto: 3000)',
  CONVERSATIONS_FILE: 'Ruta del archivo de conversaciones (por defecto: ./conversations.json)',
};

console.log('\n📋 Variables de entorno requeridas:');
for (const [key, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.error(`❌ ${key}: No definida`);
    console.log(`   Descripción: ${description}`);
    hasErrors = true;
  } else {
    const maskedValue = value.substring(0, 10) + '...';
    console.log(`✅ ${key}: ${maskedValue}`);
  }
}

console.log('\n📋 Variables de entorno opcionales:');
for (const [key, description] of Object.entries(optionalEnvVars)) {
  const value = process.env[key];
  if (!value) {
    console.log(`⚠️  ${key}: Usando valor por defecto`);
    console.log(`   Descripción: ${description}`);
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('\n❌ Error: No se encontró la carpeta node_modules');
  console.log('   Solución: Ejecuta "npm install"\n');
  hasErrors = true;
} else {
  console.log('\n✅ Dependencias instaladas (node_modules encontrado)');
}

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const requiredDeps = ['telegraf', 'openai', 'express', 'dotenv'];

  console.log('\n📦 Verificando dependencias principales:');
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.error(`❌ ${dep}: No encontrada en package.json`);
      hasErrors = true;
    }
  }
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.error('\n❌ Se encontraron errores en la configuración.');
  console.log('   Por favor revisa los mensajes anteriores y corrige los problemas.\n');
  console.log('📚 Guías útiles:');
  console.log('   - INICIO_RAPIDO.md: Guía paso a paso para configurar el proyecto');
  console.log('   - README.md: Documentación completa\n');
  process.exit(1);
} else {
  console.log('\n✅ ¡Todo está configurado correctamente!');
  console.log('\n🚀 Puedes iniciar el servidor con: npm run dev\n');
  process.exit(0);
}
