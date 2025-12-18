import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getOrganizationMembers, getUserRole, isOwner } from '../lib/team';

// Caché global para mantener los datos entre montajes del componente
let cachedMembers = [];
let cachedUserRole = null;
let cachedIsUserOwner = false;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useTeam() {
  const [members, setMembers] = useState(cachedMembers);
  const [loading, setLoading] = useState(cachedMembers.length === 0);
  const [userRole, setUserRole] = useState(cachedUserRole);
  const [isUserOwner, setIsUserOwner] = useState(cachedIsUserOwner);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  const fetchMembers = async (showLoading = true) => {
    try {
      // Solo mostrar loading si no hay datos en caché o si se solicita explícitamente
      if (showLoading || cachedMembers.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const [membersData, role, owner] = await Promise.all([
        getOrganizationMembers(),
        getUserRole(),
        isOwner(),
      ]);
      
      // Actualizar caché
      cachedMembers = membersData;
      cachedUserRole = role;
      cachedIsUserOwner = owner;
      cacheTimestamp = Date.now();
      
      // Actualizar estado
      setMembers(membersData);
      setUserRole(role);
      setIsUserOwner(owner);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (isInitialMount.current) {
      // Primera carga: usar caché si es válida, sino cargar
      if (isCacheValid && cachedMembers.length > 0) {
        setMembers(cachedMembers);
        setUserRole(cachedUserRole);
        setIsUserOwner(cachedIsUserOwner);
        setLoading(false);
        // Revalidar en segundo plano sin mostrar loading
        fetchMembers(false);
      } else {
        fetchMembers(true);
      }
      isInitialMount.current = false;
    } else {
      // Revalidación en segundo plano: no mostrar loading si hay datos
      if (cachedMembers.length > 0) {
        fetchMembers(false);
      }
    }
  }, []);

  const inviteUser = async ({ email, firstName, lastName }) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON recibida:', text.substring(0, 200));
        throw new Error('El servidor devolvió una respuesta inesperada. Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada en .env.local');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar invitación');
      }

      // Refrescar la lista de miembros (mostrar loading porque es una acción explícita)
      await fetchMembers(true);
      
      return data;
    } catch (err) {
      console.error('Error en inviteUser:', err);
      throw err;
    }
  };

  return {
    members,
    loading,
    userRole,
    isUserOwner,
    error,
    inviteUser,
    refreshMembers: fetchMembers,
  };
}

