import { supabase } from './supabase';
import { getUserContext } from './templates';

/**
 * Obtiene el rol del usuario actual en su organización
 */
export async function getUserRole() {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization || !context.organizationId) {
      return null;
    }

    const { data: membership, error } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('user_id', context.appUserId)
      .eq('organization_id', context.organizationId)
      .single();

    if (error || !membership) {
      return null;
    }

    return membership.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Verifica si el usuario es owner de la organización
 */
export async function isOwner() {
  const role = await getUserRole();
  return role === 'owner';
}

/**
 * Obtiene todos los miembros de la organización del usuario
 */
export async function getOrganizationMembers() {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization || !context.organizationId) {
      return [];
    }

    const { data: memberships, error } = await supabase
      .from('organization_memberships')
      .select(`
        id,
        role,
        created_at,
        app_users!inner (
          id,
          display_name,
          auth_user_id
        )
      `)
      .eq('organization_id', context.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo miembros: ${error.message}`);
    }

    // Mapear los miembros (el email se obtendrá desde la API si es necesario)
    return memberships.map((membership) => ({
      id: membership.id,
      userId: membership.app_users.id,
      displayName: membership.app_users.display_name,
      authUserId: membership.app_users.auth_user_id,
      role: membership.role,
      createdAt: membership.created_at,
    }));
  } catch (error) {
    console.error('Error getting organization members:', error);
    throw error;
  }
}

