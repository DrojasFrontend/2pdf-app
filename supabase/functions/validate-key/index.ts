import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { validateApiKey } from '../_shared/apiKey.ts'
import { validationErrorResponse } from '../_shared/response.ts'

serve(async (req) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Solo validar X-API-Key del cliente (la key de Supabase se obtiene automáticamente desde secrets)
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      return validationErrorResponse(validation.error || 'API Key inválida')
    }

    const record = validation.keyRecord!

    // Key válida - retornar info
    return new Response(
      JSON.stringify({
        valid: true,
        key: {
          id: record.id,
          name: record.name,
          environment: record.environment,
          daily_limit: record.daily_limit,
          monthly_limit: record.monthly_limit,
        },
        project: {
          id: record.projects.id,
          name: record.projects.name,
          slug: record.projects.slug,
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error validating API key:', error)
    return validationErrorResponse('Error interno del servidor', 500)
  }
})

