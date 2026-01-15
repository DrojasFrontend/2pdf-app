/**
 * Helpers para llamar PostgREST directamente desde Edge Functions.
 * Motivo: evitar dependencias remotas (esm.sh) que pueden causar timeouts al bundlear/deployar.
 */

export function getSupabaseUrl(): string {
  return Deno.env.get('SUPABASE_URL') ?? ''
}

export function getServiceRoleKey(): string {
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
}

export function getAdminHeaders(extra?: Record<string, string>): Record<string, string> {
  const key = getServiceRoleKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  }
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<{ data: T | null; error: string | null; status: number }> {
  const res = await fetch(url, init)
  const text = await res.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = text
  }

  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as Record<string, unknown>).message)
        : typeof json === 'string'
          ? json
          : `HTTP ${res.status}`

    return { data: null, error: message, status: res.status }
  }

  return { data: json as T, error: null, status: res.status }
}

export async function adminGet<T>(pathWithQuery: string): Promise<{ data: T | null; error: string | null; status: number }> {
  const base = getSupabaseUrl()
  const url = `${base}${pathWithQuery.startsWith('/') ? '' : '/'}${pathWithQuery}`
  return await fetchJson<T>(url, {
    method: 'GET',
    headers: getAdminHeaders({ Accept: 'application/json' }),
  })
}

export async function adminPost<T>(
  path: string,
  body: unknown,
  prefer: 'return=representation' | 'return=minimal' = 'return=representation'
): Promise<{ data: T | null; error: string | null; status: number }> {
  const base = getSupabaseUrl()
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`
  return await fetchJson<T>(url, {
    method: 'POST',
    headers: getAdminHeaders({
      'Content-Type': 'application/json',
      Prefer: prefer,
      Accept: 'application/json',
    }),
    body: JSON.stringify(body),
  })
}

