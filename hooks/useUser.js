import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getUserDisplayName } from '../utils/userUtils';

// Caché global para mantener el nombre de usuario entre montajes del componente
let cachedUserName = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (más largo porque el nombre no cambia frecuentemente)

export function useUser() {
  const [userName, setUserName] = useState(cachedUserName || 'Usuario');
  const [loading, setLoading] = useState(cachedUserName === null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const displayName = getUserDisplayName(user);
          
          // Actualizar caché
          cachedUserName = displayName;
          cacheTimestamp = Date.now();
          
          // Actualizar estado (React optimiza si el valor es el mismo)
          setUserName(displayName);
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
      if (isCacheValid && cachedUserName) {
        setUserName(cachedUserName);
        setLoading(false);
        // Revalidar en segundo plano sin mostrar loading
        fetchUserName();
      } else {
        fetchUserName();
      }
      isInitialMount.current = false;
    } else {
      // Revalidación en segundo plano: no mostrar loading si hay datos en caché
      if (cachedUserName) {
        fetchUserName();
      }
    }
  }, []);

  return { userName, loading };
}

