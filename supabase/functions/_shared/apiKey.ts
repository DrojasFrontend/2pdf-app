import { adminGet } from './supabase.ts'
import { hashApiKey } from './hash.ts'

export interface ApiKeyRecord {
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
    slug?: string
    organization_id: string
  }
}

export interface ApiKeyValidationResult {
  valid: boolean
  error?: string
  keyRecord?: ApiKeyRecord
}

/**
 * Valida una API Key del cliente y retorna el registro si es válida
 */
export async function validateApiKey(apiKey: string | null): Promise<ApiKeyValidationResult> {
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
      'projects(id,name,slug,organization_id)',
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
