# ✅ Validación de Edge Functions

## 📋 Resumen

Se han creado y validado las siguientes Edge Functions para el sistema de generación de PDFs:

### Funciones Implementadas

1. **`validate-key`** - Valida API keys
   - Endpoint: `POST /functions/v1/validate-key`
   - Header requerido: `X-API-Key`
   - Valida formato, hash, estado activo, y expiración

2. **`generate-document`** - Genera documentos PDF
   - Endpoint: `POST /functions/v1/generate-document`
   - Header requerido: `X-API-Key`
   - Body: `{ template_id, data, options? }`
   - Crea `render_job` y procesa template con datos

### Archivos Compartidos (`_shared/`)

- `cors.ts` - Manejo de CORS headers
- `hash.ts` - Hash SHA-256 de API keys
- `supabase.ts` - Cliente de Supabase con service role

## ✅ Validaciones Completadas

- [x] Estructura de archivos correcta
- [x] Imports correctos entre funciones
- [x] Supabase local corriendo
- [x] Sintaxis TypeScript válida

## 🧪 Cómo Probar Localmente

### 1. Iniciar Supabase Local (si no está corriendo)
```bash
supabase start
```

### 2. Servir las funciones localmente
```bash
supabase functions serve --no-verify-jwt
```

Las funciones estarán disponibles en:
- `http://127.0.0.1:54321/functions/v1/validate-key`
- `http://127.0.0.1:54321/functions/v1/generate-document`

### 3. Probar con cURL

#### Validar API Key
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_tu_api_key_aqui"
```

#### Generar Documento
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/generate-document \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_tu_api_key_aqui" \
  -d '{
    "template_id": "uuid-del-template",
    "data": {
      "nombre": "Juan",
      "edad": 30
    }
  }'
```

## 📝 Notas Importantes

1. **Base de Datos**: Las funciones requieren que las tablas del schema (`api_keys`, `templates`, `render_jobs`, etc.) estén creadas en la base de datos.

2. **PDF Generation**: La función `generate-document` actualmente procesa el template y retorna HTML. La generación real de PDF con Playwright/Puppeteer está pendiente de implementar.

3. **CORS**: Las funciones están configuradas para aceptar requests desde cualquier origen (`*`). En producción, deberías restringir esto.

4. **Autenticación**: Las funciones usan `SUPABASE_SERVICE_ROLE_KEY` para acceso completo a la base de datos. Esto es necesario para validar API keys sin RLS.

## 🚀 Próximos Pasos

1. **Implementar generación de PDF** en `generate-document`
2. **Agregar validación de cuotas** (`daily_limit`, `monthly_limit`)
3. **Implementar webhooks** para notificar cuando el PDF esté listo
4. **Agregar tests** unitarios e integración
5. **Deploy a producción** cuando esté listo

## 📦 Estructura de Archivos

```
supabase/
├── functions/
│   ├── _shared/
│   │   ├── cors.ts
│   │   ├── hash.ts
│   │   └── supabase.ts
│   ├── validate-key/
│   │   └── index.ts
│   └── generate-document/
│       └── index.ts
└── config.toml
```

## 🔑 Variables de Entorno Requeridas

Las funciones usan estas variables (configuradas automáticamente por Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

## ✅ Estado Actual

- ✅ Estructura creada
- ✅ Validación básica completada
- ✅ Funciones listas para testing local
- ⏳ Generación de PDF pendiente
- ⏳ Tests pendientes
- ⏳ Deploy a producción pendiente

