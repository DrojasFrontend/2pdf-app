import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return res.status(500).json({ error: 'NEXT_PUBLIC_SUPABASE_URL no configurada' });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY no configurada. Agrega esta variable en .env.local' });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada' });
    }

    // Cliente de Supabase con service role key para Admin API
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Cliente regular para consultas
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Obtener el token del usuario desde el header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el usuario con el token
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Obtener app_user del usuario que hace la petición
    const { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (appUserError || !appUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener membership y verificar que es owner
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id, role')
      .eq('user_id', appUser.id)
      .single();

    if (membershipError || !membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Solo los owners pueden eliminar usuarios' });
    }

    // Obtener el userId del usuario a eliminar desde el body
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    // Verificar que no se está eliminando a sí mismo
    if (userId === appUser.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    // Obtener el app_user del usuario a eliminar
    const { data: userToDelete, error: userToDeleteError } = await supabase
      .from('app_users')
      .select('id, auth_user_id')
      .eq('id', userId)
      .single();

    if (userToDeleteError || !userToDelete) {
      return res.status(404).json({ error: 'Usuario a eliminar no encontrado' });
    }

    // Verificar que el usuario pertenece a la misma organización
    const { data: userMembership, error: userMembershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', userId)
      .eq('organization_id', membership.organization_id)
      .single();

    if (userMembershipError || !userMembership) {
      return res.status(403).json({ error: 'El usuario no pertenece a tu organización' });
    }

    // 1. Eliminar de organization_memberships (se eliminará automáticamente por CASCADE si existe)
    const { error: deleteMembershipError } = await supabase
      .from('organization_memberships')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', membership.organization_id);

    if (deleteMembershipError) {
      console.error('Error eliminando membership:', deleteMembershipError);
      return res.status(500).json({ error: 'Error al eliminar membership: ' + deleteMembershipError.message });
    }

    // 2. Eliminar de app_users
    const { error: deleteAppUserError } = await supabase
      .from('app_users')
      .delete()
      .eq('id', userId);

    if (deleteAppUserError) {
      console.error('Error eliminando app_user:', deleteAppUserError);
      return res.status(500).json({ error: 'Error al eliminar app_user: ' + deleteAppUserError.message });
    }

    // 3. Eliminar de auth.users usando Admin API
    if (userToDelete.auth_user_id) {
      const { error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(
        userToDelete.auth_user_id
      );

      if (deleteAuthUserError) {
        console.error('Error eliminando auth user:', deleteAuthUserError);
        // No retornamos error aquí porque ya eliminamos de las otras tablas
        // Pero registramos el error para debugging
        console.warn('Advertencia: No se pudo eliminar de auth.users, pero se eliminó de las otras tablas');
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error removing user:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}

