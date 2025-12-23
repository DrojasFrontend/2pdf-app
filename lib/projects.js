import { supabase } from './supabase';
import { getUserContext } from './templates';

/**
 * Crea un nuevo proyecto en la organización del usuario
 */
export async function createProject({ name, slug, description }) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { appUserId, organizationId } = context;

    // Generar slug automático si no se proporciona
    const projectSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Verificar que el slug no exista en la organización
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('slug', projectSlug)
      .single();

    if (existingProject) {
      throw new Error('Ya existe un proyecto con ese nombre o slug');
    }

    // Crear el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        organization_id: organizationId,
        name,
        slug: projectSlug,
        description: description || null,
        created_by: appUserId,
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Error creando proyecto: ${projectError.message}`);
    }

    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Obtiene todos los proyectos de la organización del usuario
 */
export async function getUserProjects() {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      return []; // Retornar array vacío si no tiene organización
    }
    
    const { organizationId } = context;

    // Obtener proyectos
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        slug,
        description,
        created_at,
        created_by
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo proyectos: ${error.message}`);
    }

    return projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Obtiene un proyecto por ID
 */
export async function getProject(projectId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { organizationId } = context;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        slug,
        description,
        created_at,
        created_by,
        organization_id
      `)
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      throw new Error(`Error obteniendo proyecto: ${error.message}`);
    }

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

/**
 * Actualiza un proyecto
 */
export async function updateProject(projectId, { name, slug, description }) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { organizationId } = context;

    // Verificar que el proyecto pertenece a la organización
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, slug')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !existingProject) {
      throw new Error('Proyecto no encontrado o sin permisos');
    }

    // Si se cambia el slug, verificar que no exista otro proyecto con ese slug
    if (slug && slug !== existingProject.slug) {
      const { data: duplicateProject } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('slug', slug)
        .neq('id', projectId)
        .single();

      if (duplicateProject) {
        throw new Error('Ya existe un proyecto con ese slug');
      }
    }

    // Generar slug automático si se cambia el nombre y no se proporciona slug
    const projectSlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : existingProject.slug);

    // Actualizar el proyecto
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (projectSlug !== undefined) updateData.slug = projectSlug;
    if (description !== undefined) updateData.description = description || null;

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error actualizando proyecto: ${updateError.message}`);
    }

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Elimina un proyecto
 */
export async function deleteProject(projectId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { organizationId } = context;

    // Verificar que el proyecto pertenece a la organización
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !project) {
      throw new Error('Proyecto no encontrado o sin permisos');
    }

    // Eliminar el proyecto (CASCADE eliminará templates asociados si está configurado)
    // Por ahora, solo eliminamos si no tiene templates asociados
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('id')
      .eq('project_id', projectId)
      .limit(1);

    if (templatesError) {
      throw new Error(`Error verificando templates: ${templatesError.message}`);
    }

    if (templates && templates.length > 0) {
      throw new Error('No se puede eliminar el proyecto porque tiene templates asociados. Primero elimina o mueve los templates.');
    }

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      throw new Error(`Error eliminando proyecto: ${deleteError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

