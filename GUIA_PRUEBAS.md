# 🧪 Guía de Pruebas - API Keys y Edge Functions

## 📋 Resumen

Esta guía explica cómo probar las funcionalidades implementadas:
1. **Frontend**: Gestión de API Keys en el dashboard
2. **Backend**: Edge Functions para validar keys y generar documentos

---

## 🔑 Parte 1: Probar Frontend (API Keys)

### Requisitos Previos
- Tener la app corriendo localmente
- Estar logueado en el dashboard
- Tener al menos un proyecto creado

### Pasos

1. **Iniciar la aplicación:**
```bash
cd /Users/daniel/2pdf/2pdf-app
npm run dev
```

2. **Ir a la sección API Keys:**
   - Abre: http://localhost:3000/api-keys
   - O desde el sidebar, click en "API Key"

3. **Crear una API Key:**
   - Click en "Crear API Key"
   - Completa:
     - Nombre: "Test Key"
     - Proyecto: Selecciona un proyecto
     - Ambiente: "sandbox" o "production"
   - Click en "Crear API Key"
   - **IMPORTANTE**: Copia la key completa que aparece (solo se muestra una vez)
   - Ejemplo: `pk_test_qzs3VRug4J0XFXK9BVEBLirMeJrC4sH0`

4. **Verificar en la lista:**
   - Debe aparecer la key con estado "Activa"
   - Debe mostrar los últimos 4 caracteres
   - Debe mostrar el proyecto asociado

5. **Probar acciones:**
   - **Revocar**: Click en ⋮ → "Revocar" → Verificar que cambie a "Revocada"
   - **Reactivar**: Click en ⋮ → "Reactivar" → Verificar que vuelva a "Activa"
   - **Eliminar**: Click en ⋮ → "Eliminar" → Confirmar → Verificar que desaparezca

6. **Probar filtros:**
   - Filtrar por proyecto
   - Buscar por nombre

---

## ⚡ Parte 2: Probar Backend (Edge Functions)

### Opción A: Pruebas Locales (Desarrollo)

#### Requisitos Previos
- Docker corriendo
- Supabase CLI instalado
- Base de datos con las tablas creadas (`modelo1.sql`)

#### Paso 1: Iniciar Supabase Local

```bash
cd /Users/daniel/2pdf/2pdf-app
supabase start
```

Deberías ver algo como:
```
Started supabase local development setup.
Edge Functions │ http://127.0.0.1:54321/functions/v1
```

### Paso 2: Servir las Edge Functions

En una nueva terminal:
```bash
cd /Users/daniel/2pdf/2pdf-app
supabase functions serve --no-verify-jwt
```

Deberías ver:
```
Functions served on http://127.0.0.1:54321/functions/v1
```

### Paso 3: Preparar Datos de Prueba

**Necesitas tener en la base de datos:**
1. Una organización
2. Un proyecto
3. Un template con versión
4. Una API Key (creada desde el frontend)

**O crear manualmente en Supabase Studio:**
1. Ve a: http://127.0.0.1:54323 (Supabase Studio local)
2. Crea los datos necesarios en las tablas

### Paso 4: Probar `validate-key`

**Con cURL:**
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_qzs3VRug4J0XFXK9BVEBLirMeJrC4sH0"
```

**Respuesta esperada (éxito):**
```json
{
  "valid": true,
  "key": {
    "id": "uuid",
    "name": "Test Key",
    "environment": "sandbox",
    "daily_limit": null,
    "monthly_limit": null
  },
  "project": {
    "id": "uuid",
    "name": "Mi Proyecto",
    "slug": "mi-proyecto"
  }
}
```

**Respuesta esperada (error):**
```json
{
  "valid": false,
  "error": "API Key no encontrada o inválida"
}
```

**Con Postman:**
1. Método: `POST`
2. URL: `http://127.0.0.1:54321/functions/v1/validate-key`
3. Headers:
   - `X-API-Key`: `pk_test_tu_key_aqui`
   - `Content-Type`: `application/json`
4. Click "Send"

### Paso 5: Probar `generate-document`

**Con cURL:**
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/generate-document \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_qzs3VRug4J0XFXK9BVEBLirMeJrC4sH0" \
  -d '{
    "template_id": "uuid-del-template",
    "data": {
      "nombre": "Juan Pérez",
      "edad": 30,
      "productos": [
        {"nombre": "Laptop", "precio": 1000},
        {"nombre": "Mouse", "precio": 25}
      ]
    }
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "job_id": "uuid-del-job",
  "template": {
    "id": "uuid",
    "name": "Mi Template",
    "version_id": "uuid"
  },
  "html_preview": "<html>...</html>",
  "message": "Documento procesado. PDF generation pendiente de implementar."
}
```

**Con Postman:**
1. Método: `POST`
2. URL: `http://127.0.0.1:54321/functions/v1/generate-document`
3. Headers:
   - `X-API-Key`: `pk_test_tu_key_aqui`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
```json
{
  "template_id": "uuid-del-template",
  "data": {
    "nombre": "Juan",
    "edad": 30
  }
}
```
5. Click "Send"

---

### Opción B: Deployar y Probar en Supabase Remoto (Producción)

#### Requisitos Previos
- Supabase CLI instalado y configurado
- Acceso al proyecto de Supabase (remoto)
- Haber hecho login: `supabase login`

#### Paso 1: Verificar Login y Proyecto

```bash
# Verificar que estás logueado
supabase projects list

# Si no estás logueado:
supabase login
# Esto abrirá el navegador para autenticarte
```

#### Paso 2: Linkear el Proyecto Remoto

```bash
cd /Users/daniel/2pdf/2pdf-app

# Linkear con tu proyecto de Supabase
supabase link --project-ref tu-project-ref

# El project-ref lo encuentras en:
# Supabase Dashboard → Settings → General → Reference ID
```

#### Paso 3: Deployar las Edge Functions

```bash
# Deployar todas las funciones
supabase functions deploy validate-key
supabase functions deploy generate-document

# O deployar todas de una vez (si están en el directorio)
supabase functions deploy
```

**Salida esperada:**
```
Deploying function validate-key...
Function validate-key deployed successfully
Deploying function generate-document...
Function generate-document deployed successfully
```

#### Paso 4: Obtener la URL de las Functions

Las funciones estarán disponibles en:
```
https://tu-project-ref.supabase.co/functions/v1/validate-key
https://tu-project-ref.supabase.co/functions/v1/generate-document
```

**Obtener el project-ref:**
```bash
# Ver configuración del proyecto
cat supabase/.temp/project-ref

# O desde Supabase Dashboard:
# Settings → General → Reference ID
```

#### Paso 5: Probar `validate-key` en Remoto

**Con cURL:**
```bash
curl -X POST https://tu-project-ref.supabase.co/functions/v1/validate-key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_tu_key_aqui"
```

**Con Postman:**
1. Método: `POST`
2. URL: `https://tu-project-ref.supabase.co/functions/v1/validate-key`
3. Headers:
   - `X-API-Key`: `pk_test_tu_key_aqui`
   - `Content-Type`: `application/json`
4. Click "Send"

**Respuesta esperada:**
```json
{
  "valid": true,
  "key": {
    "id": "uuid",
    "name": "Test Key",
    "environment": "sandbox"
  },
  "project": {
    "id": "uuid",
    "name": "Mi Proyecto"
  }
}
```

#### Paso 6: Probar `generate-document` en Remoto

**Con cURL:**
```bash
curl -X POST https://tu-project-ref.supabase.co/functions/v1/generate-document \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_tu_key_aqui" \
  -d '{
    "template_id": "uuid-del-template",
    "data": {
      "nombre": "Juan Pérez",
      "edad": 30
    }
  }'
```

**Con Postman:**
1. Método: `POST`
2. URL: `https://tu-project-ref.supabase.co/functions/v1/generate-document`
3. Headers:
   - `X-API-Key`: `pk_test_tu_key_aqui`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
```json
{
  "template_id": "uuid-del-template",
  "data": {
    "nombre": "Juan",
    "edad": 30
  }
}
```
5. Click "Send"

#### Paso 7: Ver Logs de las Functions

```bash
# Ver logs en tiempo real
supabase functions logs validate-key --follow

# Ver logs de generate-document
supabase functions logs generate-document --follow

# Ver últimas 50 líneas
supabase functions logs validate-key --limit 50
```

#### Paso 8: Verificar en Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/tu-project-ref/functions
2. Deberías ver las funciones deployadas:
   - `validate-key`
   - `generate-document`
3. Click en cada una para ver:
   - Logs
   - Métricas (invocaciones, errores, latencia)
   - Configuración

---

## 🔍 Verificar en Base de Datos

### Después de crear una API Key (Frontend):
```sql
SELECT id, name, environment, last_four, is_active, created_at 
FROM api_keys 
ORDER BY created_at DESC 
LIMIT 1;
```

### Después de generar un documento (Backend):
```sql
SELECT id, status, template_version_id, created_at 
FROM render_jobs 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🐛 Troubleshooting

### Error: "API Key no encontrada"
- Verifica que la key existe en la tabla `api_keys`
- Verifica que el hash coincide (usa el mismo algoritmo SHA-256)
- Verifica que `is_active = true`

### Error: "Template no encontrado"
- Verifica que el `template_id` existe
- Verifica que el template pertenece a la misma organización que la API Key

### Error: "Supabase local no responde"
```bash
# Verificar que está corriendo
supabase status

# Reiniciar si es necesario
supabase stop
supabase start
```

### Error: "Functions no se sirven"
```bash
# Verificar que el puerto 54321 está libre
lsof -i :54321

# Reiniciar funciones
supabase functions serve --no-verify-jwt
```

### Error: "Project not linked" (Remoto)
```bash
# Verificar link
supabase status

# Si no está linkeado:
supabase link --project-ref tu-project-ref
```

### Error: "Function deployment failed" (Remoto)
```bash
# Verificar que las funciones existen localmente
ls -la supabase/functions/

# Verificar logs de deploy
supabase functions deploy validate-key --debug

# Verificar que tienes permisos en el proyecto
supabase projects list
```

### Error: "CORS" (Remoto)
- Verifica que `_shared/cors.ts` está configurado correctamente
- Revisa los headers en la respuesta de la función
- Verifica que el origen está permitido en CORS

---

## ✅ Checklist de Pruebas

### Frontend
- [ ] Crear API Key exitosamente
- [ ] Ver key en la lista
- [ ] Revocar API Key
- [ ] Reactivar API Key
- [ ] Eliminar API Key
- [ ] Filtrar por proyecto
- [ ] Buscar por nombre

### Backend (Local)
- [ ] Validar API Key válida → retorna `valid: true`
- [ ] Validar API Key inválida → retorna error
- [ ] Validar API Key revocada → retorna error
- [ ] Generar documento con template válido → retorna HTML
- [ ] Generar documento con template inválido → retorna error
- [ ] Verificar que se crea `render_job` en la BD

### Backend (Remoto/Producción)
- [ ] Deployar `validate-key` exitosamente
- [ ] Deployar `generate-document` exitosamente
- [ ] Probar `validate-key` en remoto → retorna `valid: true`
- [ ] Probar `generate-document` en remoto → retorna HTML
- [ ] Verificar logs en Supabase Dashboard
- [ ] Verificar métricas de invocaciones

---

## 📝 Notas

- Las Edge Functions retornan HTML procesado, no PDF aún
- La generación real de PDF está pendiente de implementar
- **IMPORTANTE**: Prueba primero localmente, luego deploya a remoto
- Las API Keys se hashean con SHA-256 antes de guardarse
- El `project-ref` lo encuentras en: Supabase Dashboard → Settings → General
- Las funciones deployadas están disponibles públicamente (protege con API Keys)

## 🚀 Comandos Rápidos de Deployment

```bash
# 1. Login (solo primera vez)
supabase login

# 2. Linkear proyecto
supabase link --project-ref tu-project-ref

# 3. Deployar funciones
supabase functions deploy validate-key
supabase functions deploy generate-document

# 4. Ver logs
supabase functions logs validate-key --follow

# 5. Probar (reemplaza tu-project-ref y tu-key)
curl -X POST https://tu-project-ref.supabase.co/functions/v1/validate-key \
  -H "X-API-Key: pk_test_tu_key"
```

