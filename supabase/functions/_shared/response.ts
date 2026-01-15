import { corsHeaders } from './cors.ts'

/**
 * Helper para respuestas de error genéricas
 */
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Helper para respuestas de error de validación (con formato { valid: false, error: ... })
 */
export function validationErrorResponse(message: string, status: number = 401): Response {
  return new Response(
    JSON.stringify({ valid: false, error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
