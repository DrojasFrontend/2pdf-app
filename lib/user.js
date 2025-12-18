import { supabase } from './supabase';

/**
 * Actualiza el display_name del usuario en app_users
 */
export async function updateUserDisplayName(displayName) {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error('Usuario no autenticado');
    }

    // Actualizar display_name en app_users
    const { data: appUser, error: updateError } = await supabase
      .from('app_users')
      .update({ display_name: displayName })
      .eq('auth_user_id', authUser.id)
      .select('display_name')
      .single();

    if (updateError) {
      throw new Error(`Error actualizando nombre: ${updateError.message}`);
    }

    // También actualizar en user_metadata de auth.users
    await supabase.auth.updateUser({
      data: { display_name: displayName }
    });

    return appUser;
  } catch (error) {
    console.error('Error updating user display name:', error);
    throw error;
  }
}

