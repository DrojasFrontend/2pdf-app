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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el usuario ya existe en auth.users usando listUsers
    // Nota: Esto puede ser costoso si hay muchos usuarios, pero es necesario para verificar
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!listError && usersList?.users) {
      const existingUser = usersList.users.find(user => user.email === email.trim());
      
      if (existingUser) {
        // Si el usuario ya existe, verificar si ya está en la organización
        const { data: existingAppUser } = await supabase
          .from('app_users')
          .select('id')
          .eq('auth_user_id', existingUser.id)
          .single();

        if (existingAppUser) {
          const { data: existingMembership } = await supabase
            .from('organization_memberships')
            .select('id')
            .eq('user_id', existingAppUser.id)
            .eq('organization_id', membership.organization_id)
            .single();

          if (existingMembership) {
            return res.status(400).json({ error: 'Este usuario ya es miembro de la organización' });
          }
        }
        
        // Si el usuario existe pero no está en la organización, no podemos usar inviteUserByEmail
        // Deberíamos agregarlo directamente a la organización
        return res.status(400).json({ error: 'Este usuario ya tiene una cuenta. Debe ser agregado directamente a la organización.' });
      }
    }

    // Construir redirectTo URL de forma más robusta
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectTo = `${siteUrl.replace(/\/$/, '')}/login`;

    // Invitar usuario usando Admin API
    // Almacenar organization_id en los metadatos para crear membership después
    const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim(),
      {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: `${firstName.trim()} ${lastName.trim()}`,
          invited_organization_id: membership.organization_id, // Para crear membership después
        },
        redirectTo: redirectTo,
      }
    );

    if (inviteError) {
      // Log completo del error para debugging
      console.error('=== ERROR DETALLADO DE SUPABASE ===');
      console.error('Mensaje:', inviteError.message);
      console.error('Status:', inviteError.status);
      console.error('Code:', inviteError.code);
      console.error('Error completo:', JSON.stringify(inviteError, null, 2));
      console.error('Email intentado:', email.trim());
      console.error('RedirectTo:', redirectTo);
      console.error('===================================');
      
      // Mensajes de error más descriptivos según el tipo de error
      let errorMessage = inviteError.message || 'Error al enviar invitación';
      
      // Manejar error unexpected_failure (generalmente es problema de SMTP)
      if (inviteError.code === 'unexpected_failure' || inviteError.status === 500) {
        errorMessage = `Error interno de Supabase al enviar el email. Esto generalmente indica un problema con la configuración SMTP.

Verifica en Supabase Dashboard:
1. Authentication > Email > SMTP Settings
   - Sender email debe coincidir exactamente con tu email de Gmail
   - SMTP Host: smtp.gmail.com
   - Port: 587 (TLS) o 465 (SSL)
   - Username: tu email completo
   - Password: App Password de 16 caracteres (sin espacios)
   - Si usas puerto 587, habilita TLS/STARTTLS

2. Authentication > Email Templates > Invite user
   - Verifica que el template esté configurado correctamente

3. Logs > Auth Logs
   - Revisa los logs para ver el error específico de SMTP

También puedes probar enviando un "Test email" desde Authentication > Email Templates.`;
      } else if (inviteError.message && inviteError.message.toLowerCase().includes('email')) {
        errorMessage = `Error al enviar email: ${inviteError.message}. Verifica la configuración SMTP en Supabase Dashboard > Authentication > Email y los logs en Auth Logs.`;
      } else if (inviteError.message && inviteError.message.toLowerCase().includes('smtp')) {
        errorMessage = `Error SMTP: ${inviteError.message}. Verifica las credenciales SMTP en Supabase Dashboard > Authentication > Email.`;
      }
      
      return res.status(400).json({ error: errorMessage });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Invitación enviada exitosamente',
      user: invitedUser,
    });
  } catch (error) {
    console.error('Error inviting user:', {
      message: error.message,
      stack: error.stack,
      error: error,
    });
    
    // Proporcionar mensaje más útil si es un error de red o conexión
    let errorMessage = error.message || 'Error interno del servidor';
    if (error.message && error.message.includes('fetch')) {
      errorMessage = 'Error de conexión con Supabase. Verifica tu conexión a internet y la configuración de Supabase.';
    }
    
    return res.status(500).json({ error: errorMessage });
  }
}

