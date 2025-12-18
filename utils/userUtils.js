/**
 * Obtiene el nombre de visualización del usuario desde los metadatos de Supabase
 * Si no hay nombre, retorna el email completo
 * @param {Object} user - Objeto de usuario de Supabase
 * @returns {string} - Nombre de visualización del usuario o email
 */
export function getUserDisplayName(user) {
  if (!user) return null;
  
  // Priorizar display_name de app_users, luego metadata, luego email
  return user?.user_metadata?.display_name || 
         user?.user_metadata?.full_name || 
         user?.user_metadata?.name ||
         user?.email || 
         null;
}

