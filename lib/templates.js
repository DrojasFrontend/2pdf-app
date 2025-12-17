import { supabase } from './supabase';

/**
 * Obtiene el app_user_id y organization_id del usuario autenticado
 * La relación con organization es a través de organization_memberships
 */
export async function getUserContext() {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener app_user usando auth_user_id (sin organization_id porque no existe en esta tabla)
    let { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    // Si no existe el app_user, intentar crearlo
    if (appUserError || !appUser) {
      console.log('App user no encontrado, intentando crear...');
      
      // Intentar crear el app_user (sin organization_id)
      const { data: newAppUser, error: createError } = await supabase
        .from('app_users')
        .insert({
          auth_user_id: authUser.id,
          display_name: authUser.user_metadata?.display_name || 
                       authUser.user_metadata?.full_name || 
                       authUser.email?.split('@')[0] || 
                       'Usuario',
        })
        .select('id')
        .single();

      if (createError || !newAppUser) {
        throw new Error(`Error creando usuario en app_users: ${createError?.message || 'Error desconocido'}`);
      }

      appUser = newAppUser;
    }

    // Buscar organization_id en organization_memberships
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', appUser.id)
      .limit(1)
      .single();

    if (membershipError || !membership) {
      throw new Error('Usuario no tiene una organización asignada. Por favor contacta al administrador.');
    }

    return {
      appUserId: appUser.id,
      organizationId: membership.organization_id,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    throw error;
  }
}

/**
 * Crea un nuevo template con su primera versión
 */
export async function createTemplate({ name, description, html, css, data }) {
  try {
    const { appUserId, organizationId } = await getUserContext();

    // Crear el template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        organization_id: organizationId,
        name,
        description: description || null,
        created_by: appUserId,
      })
      .select()
      .single();

    if (templateError) {
      throw new Error(`Error creando template: ${templateError.message}`);
    }

    // Crear la primera versión del template
    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .insert({
        template_id: template.id,
        version_label: 'v1.0.0',
        major: 1,
        minor: 0,
        patch: 0,
        html,
        css,
        data_schema: data ? JSON.parse(data) : null,
        is_active: true,
        is_default: true,
        created_by: appUserId,
      })
      .select()
      .single();

    if (versionError) {
      // Si falla la versión, eliminar el template creado
      await supabase.from('templates').delete().eq('id', template.id);
      throw new Error(`Error creando versión: ${versionError.message}`);
    }

    return { template, version };
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

/**
 * Crea una nueva versión de un template existente
 */
export async function createTemplateVersion(templateId, { html, css, data, notes }) {
  try {
    const { appUserId } = await getUserContext();

    // Obtener la última versión para incrementar el número
    const { data: lastVersion } = await supabase
      .from('template_versions')
      .select('major, minor, patch')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let major = 1;
    let minor = 0;
    let patch = 0;
    let versionLabel = 'v1.0.0';

    if (lastVersion) {
      major = lastVersion.major;
      minor = lastVersion.minor;
      patch = lastVersion.patch + 1;
      versionLabel = `v${major}.${minor}.${patch}`;
    }

    // Desactivar todas las versiones anteriores como default
    await supabase
      .from('template_versions')
      .update({ is_default: false })
      .eq('template_id', templateId);

    // Crear nueva versión
    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .insert({
        template_id: templateId,
        version_label: versionLabel,
        major,
        minor,
        patch,
        html,
        css,
        data_schema: data ? JSON.parse(data) : null,
        is_active: true,
        is_default: true,
        notes: notes || null,
        created_by: appUserId,
      })
      .select()
      .single();

    if (versionError) {
      throw new Error(`Error creando versión: ${versionError.message}`);
    }

    return version;
  } catch (error) {
    console.error('Error creating template version:', error);
    throw error;
  }
}

/**
 * Obtiene todos los templates del usuario (de su organización)
 */
export async function getUserTemplates() {
  try {
    const { organizationId } = await getUserContext();

    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        id,
        name,
        description,
        template_type,
        is_archived,
        created_at,
        template_versions!inner (
          id,
          version_label,
          is_default,
          created_at
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo templates: ${error.message}`);
    }

    // Formatear los templates para incluir solo la versión por defecto
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      template_type: template.template_type,
      created_at: template.created_at,
      version: template.template_versions?.[0] || null,
    }));
  } catch (error) {
    console.error('Error getting user templates:', error);
    throw error;
  }
}

/**
 * Obtiene un template específico con su versión por defecto
 */
export async function getTemplate(templateId) {
  try {
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) {
      throw new Error(`Error obteniendo template: ${templateError.message}`);
    }

    // Obtener la versión por defecto
    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_default', true)
      .single();

    if (versionError) {
      throw new Error(`Error obteniendo versión: ${versionError.message}`);
    }

    return {
      ...template,
      version: {
        ...version,
        data: version.data_schema ? JSON.stringify(version.data_schema, null, 2) : '{}',
      },
    };
  } catch (error) {
    console.error('Error getting template:', error);
    throw error;
  }
}

