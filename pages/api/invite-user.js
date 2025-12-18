import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    // Obtener app_user
    const { data: appUser } = await supabase
      .from('app_users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (!appUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener membership y verificar que es owner
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('organization_id, role')
      .eq('user_id', appUser.id)
      .single();

    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Solo los owners pueden invitar usuarios' });
    }

    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, nombre y apellido son requeridos' });
    }

    // Invitar usuario usando Admin API
    // Almacenar organization_id en los metadatos para crear membership después
    const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`,
          invited_organization_id: membership.organization_id, // Para crear membership después
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
      }
    );

    if (inviteError) {
      return res.status(400).json({ error: inviteError.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Invitación enviada exitosamente',
      user: invitedUser,
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}

