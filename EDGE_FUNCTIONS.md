# Edge Functions - generate-document

## Flujo Arquitectónico

```
Cliente (POST)
  ↓
Edge Function (generate-document)
  ├─ Valida API Key
  ├─ Valida template existe
  ├─ Crea render_job (status: queued) en DB
  └─ Retorna 202 + job_id
     ↓
Worker (pendiente)
  ├─ Poll jobs con status 'queued'
  ├─ Obtiene template HTML/CSS
  ├─ Procesa template con datos
  ├─ Genera PDF (Playwright/AWS)
  ├─ Guarda en Storage
  └─ Actualiza job (status: succeeded/failed)
     ↓
Cliente consulta status o recibe webhook
```

## Qué hace
- Valida API Key (`X-API-Key`)
- Valida que el template existe
- Crea un `render_job` con status `queued`
- Retorna **202 Accepted** con `job_id`

**NO** genera PDF ni HTML. Eso lo hará el Worker.

## Probar en Postman

**URL:** `POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/generate-document`

**Headers:**
```
X-API-Key: pk_live_n2RNA5oVeDx8cCthNMGuSQJcebd3THXy
Content-Type: application/json
```

**Body:**
```json
{
  "template_id": "4d11d395-33b3-484d-b8bc-2eddf16675f3",
  "data": {
    "nombre": "Test"
  }
}
```

**Respuesta esperada (202):**
```json
{
  "job_id": "uuid-del-job",
  "status": "queued",
  "message": "Job creado exitosamente. El documento será generado de forma asíncrona."
}
```

## Config importante
- `Verify JWT with legacy secret`: **OFF** (en dashboard de Supabase)
- Auth real: `X-API-Key` (hasheada en BD)
- `SUPABASE_ANON_KEY` debe estar en Edge Function Secrets (se obtiene automáticamente desde ahí)

## Archivos
- `supabase/functions/generate-document/index.ts`
- `supabase/functions/_shared/supabase.ts` (PostgREST directo, sin esm.sh)
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/hash.ts`

## Pendiente (Worker)
- Poll jobs `queued`
- Obtener template HTML/CSS
- Procesar con datos
- Generar PDF (Playwright/AWS)
- Guardar en Storage
- Actualizar job status

