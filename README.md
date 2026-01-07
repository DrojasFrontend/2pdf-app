# 2PDF - Guía Rápida

## Instalación

```bash
npm install
```

## Configuración

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wxtgjdagxhobtrrkyozo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FjE5XiHqFbRWYAqTj4mYoQ_8Hnbz73I
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Iniciar

```bash
npm run dev
```

Abre: http://localhost:3000

## Probar API Keys

1. Ve a: http://localhost:3000/api-keys
2. Click en "Crear API Key"
3. Completa: Nombre, Proyecto, Ambiente
4. Copia la key (solo se muestra una vez)

## Probar Edge Functions

### En Postman:

**URL:** `POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/validate-key`

**Headers:**
- `X-API-Key`: `tu_api_key_aqui`
- `Content-Type`: `application/json`
- `apikey`: `sb_publishable_FjE5XiHqFbRWYAqTj4mYoQ_8Hnbz73I`

**Respuesta esperada:**
```json
{
  "valid": true,
  "key": {
    "name": "Tu API Key",
    "environment": "production"
  },
  "project": {
    "name": "Tu Proyecto"
  }
}
```

### Con cURL:

```bash
curl -X POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/validate-key \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_FjE5XiHqFbRWYAqTj4mYoQ_8Hnbz73I"
```

## Deployar Edge Functions

```bash
# Login
supabase login

# Linkear proyecto
supabase link --project-ref wxtgjdagxhobtrrkyozo

# Deployar
supabase functions deploy validate-key
supabase functions deploy generate-document
```

## Verificar en Supabase

1. Dashboard: https://supabase.com/dashboard/project/wxtgjdagxhobtrrkyozo
2. Edge Functions → Ver funciones deployadas
3. Table Editor → `api_keys` → Ver tus keys
