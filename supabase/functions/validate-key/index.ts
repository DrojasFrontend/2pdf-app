import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { adminGet } from '../_shared/supabase.ts'
import { hashApiKey } from '../_shared/hash.ts'

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
    slug: string
    organization_id: string
  }
}

serve(async (req) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Solo validar X-API-Key del cliente (la key de Supabase se obtiene automáticamente desde secrets)
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'API Key no proporcionada. Usa el header X-API-Key' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar formato de la key
    if (!apiKey.startsWith('pk_live_') && !apiKey.startsWith('pk_test_')) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Formato de API Key inválido. Debe comenzar con pk_live_ o pk_test_' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hashear la key para buscar en DB
    const keyHash = await hashApiKey(apiKey)

    // Buscar en la base de datos (PostgREST) - evita dependencias remotas (esm.sh)
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
        'projects(id,name,slug,organization_id)',
      ].join(',')
    )

    const { data: rows, error: dbError } = await adminGet<ApiKeyRecord[]>(
      `/rest/v1/api_keys?select=${select}&key_hash=eq.${keyHash}&limit=1`
    )

    const keyRecord = rows?.[0]

    if (dbError || !keyRecord) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'API Key no encontrada o inválida' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const record = keyRecord as ApiKeyRecord

    // Verificar si está activa
    if (!record.is_active) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'API Key revocada' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar si expiró
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'API Key expirada' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Error interno del servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

