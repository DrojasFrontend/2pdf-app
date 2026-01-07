# 🧪 Guía de Pruebas

## Pruebas Locales

### 1. Iniciar Supabase Local

```bash
supabase start
```

### 2. Servir Edge Functions

```bash
supabase functions serve --no-verify-jwt
```

### 3. Configurar Frontend para Local

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 4. Probar API Keys

1. Inicia el frontend: `npm run dev`
2. Ve a: http://localhost:3000/api-keys
3. Crea una API Key
4. Prueba con curl:

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "X-API-Key: pk_test_tu_key"
```

## Pruebas en Producción

### 1. Deployar Edge Functions

```bash
# Login
supabase login

# Linkear proyecto
supabase link --project-ref wxtgjdagxhobtrrkyozo

# Deployar
supabase functions deploy validate-key
supabase functions deploy generate-document
```

### 2. Probar

```bash
curl -X POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/validate-key \
  -H "X-API-Key: pk_live_tu_key"
```

### 3. Verificar en Dashboard

1. Ve a: https://supabase.com/dashboard/project/wxtgjdagxhobtrrkyozo
2. Click en "Edge Functions"
3. Verifica que aparecen `validate-key` y `generate-document`
4. Click en cada una para ver logs y métricas
5. Ve a "Table Editor" → `api_keys` para verificar tus keys

## Verificar Logs

```bash
# Ver logs en tiempo real
supabase functions logs validate-key --follow
```

