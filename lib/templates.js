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
      
      // Si el usuario viene de una invitación, crear el membership automáticamente
      const invitedOrgId = authUser.user_metadata?.invited_organization_id;
      if (invitedOrgId) {
        // Crear membership con rol 'developer' por defecto (puedes cambiarlo según necesites)
        const { error: membershipCreateError } = await supabase
          .from('organization_memberships')
          .insert({
            organization_id: invitedOrgId,
            user_id: appUser.id,
            role: 'developer', // Rol por defecto para usuarios invitados
          });
        
        if (!membershipCreateError) {
          // Limpiar el metadata después de crear el membership
          await supabase.auth.updateUser({
            data: { invited_organization_id: null }
          });
          
          return {
            appUserId: appUser.id,
            organizationId: invitedOrgId,
            needsOrganization: false,
          };
        }
      }
    }

    // Buscar organization_id en organization_memberships
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', appUser.id)
      .limit(1)
      .single();

    if (membershipError || !membership) {
      // Retornar null para organizationId si no tiene membership
      return {
        appUserId: appUser.id,
        organizationId: null,
        needsOrganization: true,
      };
    }

    return {
      appUserId: appUser.id,
      organizationId: membership.organization_id,
      needsOrganization: false,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    throw error;
  }
}

/**
 * Crea una nueva organización y asocia al usuario como owner
 */
export async function createOrganization({ name, slug }) {
  try {
    const context = await getUserContext();
    
    if (!context.appUserId) {
      throw new Error('Usuario no autenticado');
    }
    
    const { appUserId } = context;

    // Crear la organización
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        created_by: appUserId,
      })
      .select()
      .single();

    if (orgError) {
      throw new Error(`Error creando organización: ${orgError.message}`);
    }

    // Crear el membership con rol 'owner'
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: organization.id,
        user_id: appUserId,
        role: 'owner',
      })
      .select()
      .single();

    if (membershipError) {
      // Si falla el membership, eliminar la organización creada
      await supabase.from('organizations').delete().eq('id', organization.id);
      throw new Error(`Error creando membership: ${membershipError.message}`);
    }

    return {
      organization,
      membership,
    };
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

/**
 * Crea un nuevo template con su primera versión
 */
export async function createTemplate({ name, description, html, css, data, projectId }) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { appUserId, organizationId } = context;

    // Si se proporciona projectId, verificar que pertenezca a la organización
    if (projectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, organization_id')
        .eq('id', projectId)
        .eq('organization_id', organizationId)
        .single();

      if (projectError || !project) {
        throw new Error('Proyecto no encontrado o sin permisos');
      }
    }

    // Crear el template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        organization_id: organizationId,
        project_id: projectId || null,
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
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { appUserId } = context;

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
 * Incluye la versión más reciente con is_active = true
 */
export async function getUserTemplates() {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      return []; // Retornar array vacío si no tiene organización
    }
    
    const { organizationId } = context;

    // Obtener templates con información del proyecto
    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        id,
        name,
        description,
        template_type,
        is_archived,
        project_id,
        created_at,
        projects (
          id,
          name,
          slug
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo templates: ${error.message}`);
    }

    // Para cada template, obtener la versión más reciente con is_active = true
    const templatesWithVersions = await Promise.all(
      templates.map(async (template) => {
        // Obtener la versión más reciente activa
        const { data: activeVersion, error: versionError } = await supabase
          .from('template_versions')
          .select('id, version_label, is_default, created_at')
          .eq('template_id', template.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Si no hay versión activa, intentar obtener la más reciente (por si acaso)
        let version = activeVersion;
        if (versionError && versionError.code === 'PGRST116') {
          // No se encontró versión activa, obtener la más reciente sin filtro
          const { data: latestVersion } = await supabase
            .from('template_versions')
            .select('id, version_label, is_default, created_at')
            .eq('template_id', template.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          version = latestVersion || null;
        }

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          template_type: template.template_type,
          project_id: template.project_id,
          project: template.projects ? {
            id: template.projects.id,
            name: template.projects.name,
            slug: template.projects.slug,
          } : null,
          created_at: template.created_at,
          version: version,
        };
      })
    );

    return templatesWithVersions;
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

/**
 * Elimina un template y todas sus versiones
 */
export async function deleteTemplate(templateId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    // Verificar que el template pertenece a la organización del usuario
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('organization_id')
      .eq('id', templateId)
      .single();

    if (templateError) {
      throw new Error(`Error obteniendo template: ${templateError.message}`);
    }

    if (template.organization_id !== context.organizationId) {
      throw new Error('No tienes permiso para eliminar este template');
    }

    // Eliminar template (las versiones se eliminan en cascada)
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (deleteError) {
      throw new Error(`Error eliminando template: ${deleteError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

/**
 * Duplica un template con su versión actual
 */
export async function duplicateTemplate(templateId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { appUserId, organizationId } = context;

    // Obtener el template original
    const originalTemplate = await getTemplate(templateId);

    if (originalTemplate.organization_id !== organizationId) {
      throw new Error('No tienes permiso para duplicar este template');
    }

    // Crear nuevo template con nombre duplicado
    const newName = `${originalTemplate.name} (copia)`;
    const { data: newTemplate, error: templateError } = await supabase
      .from('templates')
      .insert({
        organization_id: organizationId,
        project_id: originalTemplate.project_id || null, // Preservar el project_id del template original
        name: newName,
        description: originalTemplate.description,
        template_type: originalTemplate.template_type,
        created_by: appUserId,
      })
      .select()
      .single();

    if (templateError) {
      throw new Error(`Error creando template duplicado: ${templateError.message}`);
    }

    // Duplicar la versión por defecto
    const { data: newVersion, error: versionError } = await supabase
      .from('template_versions')
      .insert({
        template_id: newTemplate.id,
        version_label: 'v1.0.0',
        major: 1,
        minor: 0,
        patch: 0,
        html: originalTemplate.version.html,
        css: originalTemplate.version.css,
        data_schema: originalTemplate.version.data_schema,
        is_active: true,
        is_default: true,
        notes: `Duplicado de ${originalTemplate.name}`,
        created_by: appUserId,
      })
      .select()
      .single();

    if (versionError) {
      // Si falla la versión, eliminar el template creado
      await supabase.from('templates').delete().eq('id', newTemplate.id);
      throw new Error(`Error creando versión duplicada: ${versionError.message}`);
    }

    return { template: newTemplate, version: newVersion };
  } catch (error) {
    console.error('Error duplicating template:', error);
    throw error;
  }
}

/**
 * Renombra un template
 */
export async function renameTemplate(templateId, newName) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    // Verificar que el template pertenece a la organización del usuario
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('organization_id, name')
      .eq('id', templateId)
      .single();

    if (templateError) {
      throw new Error(`Error obteniendo template: ${templateError.message}`);
    }

    if (template.organization_id !== context.organizationId) {
      throw new Error('No tienes permiso para renombrar este template');
    }

    if (template.name === newName) {
      return { success: true, template };
    }

    // Actualizar el nombre del template
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('templates')
      .update({ name: newName })
      .eq('id', templateId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error renombrando template: ${updateError.message}`);
    }

    return { success: true, template: updatedTemplate };
  } catch (error) {
    console.error('Error renaming template:', error);
    throw error;
  }
}

