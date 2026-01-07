import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { adminGet, adminPost } from '../_shared/supabase.ts'
import { hashApiKey } from '../_shared/hash.ts'

interface GenerateRequest {
  template_id: string
  data: Record<string, unknown>
  options?: {
    format?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
  }
}

interface ApiKeyRecord {
  id: string
  name: string
  environment: string
  is_active: boolean
  project_id: string
  daily_limit: number | null
  monthly_limit: number | null
  expires_at: string | null
  projects: {
    id: string
    name: string
    organization_id: string
  }
}

interface TemplateVersion {
  id: string
  is_default: boolean
}

interface Template {
  id: string
  name: string
  organization_id: string
  project_id: string | null
  template_versions: TemplateVersion[]
}

// Función para validar API Key y obtener contexto
async function validateApiKey(apiKey: string | null) {
  if (!apiKey) {
    return { valid: false, error: 'API Key no proporcionada. Usa el header X-API-Key' }
  }

  if (!apiKey.startsWith('pk_live_') && !apiKey.startsWith('pk_test_')) {
    return { valid: false, error: 'Formato de API Key inválido' }
  }

  const keyHash = await hashApiKey(apiKey)

  const select = encodeURIComponent(
    [
      'id',
      'name',
      'environment',
      'is_active',
      'project_id',
      'daily_limit',
      'monthly_limit',
      'expires_at',
      'projects(id,name,organization_id)',
    ].join(',')
  )

  const { data: rows, error: dbError } = await adminGet<ApiKeyRecord[]>(
    `/rest/v1/api_keys?select=${select}&key_hash=eq.${keyHash}&limit=1`
  )

  const keyRecord = rows?.[0]

  if (dbError || !keyRecord) {
    console.error('Error buscando API Key:', dbError)
    return { valid: false, error: `API Key no encontrada o inválida: ${dbError || 'No encontrada'}` }
  }

  const record = keyRecord as ApiKeyRecord

  if (!record.is_active) {
    return { valid: false, error: 'API Key revocada' }
  }

  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    return { valid: false, error: 'API Key expirada' }
  }

  return { valid: true, keyRecord: record }
}

// Nota: El procesamiento del template se hace en el Worker (morado)
// Este Edge Function solo valida y crea el job

serve(async (req) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido. Usa POST' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // 1. Validar API Key
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { keyRecord } = validation

    // 2. Parsear body
    const body: GenerateRequest = await req.json()
    const { template_id, data, options } = body

    if (!template_id) {
      return new Response(
        JSON.stringify({ error: 'template_id es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!data || typeof data !== 'object') {
      return new Response(
        JSON.stringify({ error: 'data debe ser un objeto JSON' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Validar que el template existe (sin obtener HTML/CSS) - PostgREST
    const templateSelect = encodeURIComponent(
      ['id', 'name', 'organization_id', 'project_id', 'template_versions(id,is_default)'].join(',')
    )

    const { data: templates, error: templateError } = await adminGet<Template[]>(
      `/rest/v1/templates?select=${templateSelect}&id=eq.${template_id}&organization_id=eq.${keyRecord!.projects.organization_id}&limit=1`
    )

    const template = templates?.[0]

    if (templateError || !template) {
      console.error('Error buscando template:', templateError)
      return new Response(
        JSON.stringify({ 
          error: 'Template no encontrado o sin permisos',
          details: templateError?.message,
          template_id: template_id
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const typedTemplate = template as Template

    // Validar que tiene al menos una versión
    const defaultVersion = typedTemplate.template_versions.find(v => v.is_default) 
      || typedTemplate.template_versions[0]

    if (!defaultVersion) {
      return new Response(
        JSON.stringify({ error: 'Template no tiene versiones' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 4. Crear render_job con status 'queued' (el Worker lo procesará)
    const { data: insertedJobs, error: jobError } = await adminPost<Record<string, unknown>[]>(
      '/rest/v1/render_jobs',
      {
        organization_id: keyRecord!.projects.organization_id,
        project_id: keyRecord!.project_id,
        template_version_id: defaultVersion.id,
        api_key_id: keyRecord!.id,
        status: 'queued',
        payload: data,
        options: options || {},
        queued_at: new Date().toISOString(),
      },
      'return=representation'
    )

    const renderJob = insertedJobs?.[0]

    if (jobError || !renderJob) {
      console.error('Error creating render job:', jobError)
      return new Response(
        JSON.stringify({ 
          error: 'Error al crear job de renderizado',
          details: jobError,
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 5. Retornar 202 Accepted con job_id
    return new Response(
      JSON.stringify({
        job_id: renderJob.id,
        status: 'queued',
        message: 'Job creado exitosamente. El documento será generado de forma asíncrona.',
      }),
      { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating document:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        message: errorMessage,
        stack: errorStack,
        type: error instanceof Error ? error.constructor.name : typeof error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

