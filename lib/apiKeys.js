import { supabase } from './supabase';
import { getUserContext } from './templates';

/**
 * Genera una API Key aleatoria con prefijo
 * Formato: pk_live_xxxxxxxxxxxx o pk_test_xxxxxxxxxxxx
 */
function generateApiKey(environment = 'production') {
  const prefix = environment === 'production' ? 'pk_live_' : 'pk_test_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Genera un hash simple de la API Key (en producción usar bcrypt o similar)
 * Para demo usamos SHA-256 via Web Crypto API
 */
async function hashApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Crea una nueva API Key para un proyecto
 */
export async function createApiKey({ projectId, name, environment = 'production' }) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { appUserId, organizationId } = context;

    // Verificar que el proyecto pertenece a la organización
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (projectError || !project) {
      throw new Error('Proyecto no encontrado o sin permisos');
    }

    // Generar la API Key
    const apiKey = generateApiKey(environment);
    const keyHash = await hashApiKey(apiKey);
    const lastFour = apiKey.slice(-4);

    // Guardar en la base de datos
    const { data: newKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        project_id: projectId,
        name,
        environment,
        key_hash: keyHash,
        last_four: lastFour,
        is_active: true,
        created_by: appUserId,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error creando API Key: ${insertError.message}`);
    }

    // Retornar la key completa SOLO esta vez (no se guarda en texto plano)
    return {
      ...newKey,
      key: apiKey, // Solo se muestra una vez al usuario
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

/**
 * Obtiene todas las API Keys de un proyecto
 */
export async function getProjectApiKeys(projectId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      return [];
    }
    
    const { organizationId } = context;

    // Verificar que el proyecto pertenece a la organización
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (!project) {
      throw new Error('Proyecto no encontrado o sin permisos');
    }

    const { data: keys, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        environment,
        last_four,
        is_active,
        daily_limit,
        monthly_limit,
        created_at,
        expires_at,
        revoked_at,
        revoked_reason
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo API Keys: ${error.message}`);
    }

    return keys || [];
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw error;
  }
}

/**
 * Obtiene todas las API Keys de la organización (todos los proyectos)
 */
export async function getOrganizationApiKeys() {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      return [];
    }
    
    const { organizationId } = context;

    // Obtener proyectos de la organización
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', organizationId);

    if (projectsError || !projects || projects.length === 0) {
      return [];
    }

    const projectIds = projects.map(p => p.id);

    const { data: keys, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        environment,
        last_four,
        is_active,
        daily_limit,
        monthly_limit,
        created_at,
        expires_at,
        revoked_at,
        revoked_reason,
        project_id,
        projects (
          id,
          name,
          slug
        )
      `)
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo API Keys: ${error.message}`);
    }

    return keys || [];
  } catch (error) {
    console.error('Error getting organization API keys:', error);
    throw error;
  }
}

/**
 * Revoca una API Key
 */
export async function revokeApiKey(keyId, reason = 'Revocada manualmente') {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }

    const { data: updatedKey, error } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_reason: reason,
      })
      .eq('id', keyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error revocando API Key: ${error.message}`);
    }

    return updatedKey;
  } catch (error) {
    console.error('Error revoking API key:', error);
    throw error;
  }
}

/**
 * Elimina una API Key permanentemente
 */
export async function deleteApiKey(keyId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      throw new Error(`Error eliminando API Key: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
}

/**
 * Reactiva una API Key revocada
 */
export async function reactivateApiKey(keyId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }

    const { data: updatedKey, error } = await supabase
      .from('api_keys')
      .update({
        is_active: true,
        revoked_at: null,
        revoked_reason: null,
      })
      .eq('id', keyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error reactivando API Key: ${error.message}`);
    }

    return updatedKey;
  } catch (error) {
    console.error('Error reactivating API key:', error);
    throw error;
  }
}

