import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { adminGet, adminPost } from '../_shared/supabase.ts'
import { validateApiKey, type ApiKeyRecord } from '../_shared/apiKey.ts'
import { errorResponse } from '../_shared/response.ts'

interface GenerateRequest {
  template_id: string
  data: Record<string, unknown>
  options?: {
    format?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
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

// Nota: El procesamiento del template se hace en el Worker (morado)
// Este Edge Function solo valida y crea el job

serve(async (req) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return errorResponse('Método no permitido. Usa POST', 405)
  }

  try {
    // 1. Validar API Key
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      return errorResponse(validation.error || 'API Key inválida', 401)
    }

    const { keyRecord } = validation

    // 2. Parsear body
    const body: GenerateRequest = await req.json()
    const { template_id, data, options } = body

    if (!template_id) {
      return errorResponse('template_id es requerido', 400)
    }

    if (!data || typeof data !== 'object') {
      return errorResponse('data debe ser un objeto JSON', 400)
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
      return errorResponse('Template no encontrado o sin permisos', 404)
    }

    const typedTemplate = template as Template

    // Validar que tiene al menos una versión
    const defaultVersion = typedTemplate.template_versions.find(v => v.is_default) 
      || typedTemplate.template_versions[0]

    if (!defaultVersion) {
      return errorResponse('Template no tiene versiones', 400)
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
      return errorResponse('Error al crear job de renderizado', 500)
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
    return errorResponse('Error interno del servidor', 500)
  }
})

