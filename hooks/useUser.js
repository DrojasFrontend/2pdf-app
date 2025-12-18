import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getUserDisplayName } from '../utils/userUtils';

// Caché global para mantener el nombre de usuario entre montajes del componente
let cachedUserName = null;
let cachedUserEmail = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (más largo porque el nombre no cambia frecuentemente)

export function useUser() {
  const [userName, setUserName] = useState(cachedUserName || cachedUserEmail || 'Usuario');
  const [userEmail, setUserEmail] = useState(cachedUserEmail);
  const [loading, setLoading] = useState(cachedUserName === null && cachedUserEmail === null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email;
          
          // Obtener display_name desde app_users
          const { data: appUser } = await supabase
            .from('app_users')
            .select('display_name')
            .eq('auth_user_id', user.id)
            .single();
          
          // Priorizar display_name de app_users, luego metadata
          // Si no hay nombre válido, usar email
          const displayNameFromDB = appUser?.display_name?.trim();
          const displayNameFromMeta = getUserDisplayName(user);
          
          // Si el nombre de la DB es igual al email o está vacío, usar email
          const displayName = (displayNameFromDB && displayNameFromDB !== email) 
                            ? displayNameFromDB 
                            : (displayNameFromMeta && displayNameFromMeta !== email)
                            ? displayNameFromMeta
                            : email;
          
          // Actualizar caché
          cachedUserName = displayName;
          cachedUserEmail = email;
          cacheTimestamp = Date.now();
          
          // Actualizar estado
          setUserName(displayName);
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;

    if (isInitialMount.current) {
      // Primera carga: usar caché si es válida, sino cargar
      if (isCacheValid && (cachedUserName || cachedUserEmail)) {
        setUserName(cachedUserName || cachedUserEmail);
        setUserEmail(cachedUserEmail);
        setLoading(false);
        // Revalidar en segundo plano sin mostrar loading
        fetchUserData();
      } else {
        fetchUserData();
      }
      isInitialMount.current = false;
    } else {
      // Revalidación en segundo plano: no mostrar loading si hay datos en caché
      if (cachedUserName || cachedUserEmail) {
        fetchUserData();
      }
    }
  }, []);

  // Función para refrescar el nombre después de actualizarlo
  const refreshUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: appUser } = await supabase
          .from('app_users')
          .select('display_name')
          .eq('auth_user_id', user.id)
          .single();
        
        const displayNameFromDB = appUser?.display_name?.trim();
        const displayNameFromMeta = getUserDisplayName(user);
        const displayName = (displayNameFromDB && displayNameFromDB !== user.email) 
                          ? displayNameFromDB 
                          : (displayNameFromMeta && displayNameFromMeta !== user.email)
                          ? displayNameFromMeta
                          : user.email;
        
        cachedUserName = displayName;
        cacheTimestamp = Date.now();
        setUserName(displayName);
      }
    } catch (error) {
      console.error('Error refreshing user name:', error);
    }
  };

  return { userName, userEmail, loading, refreshUserName };
}

