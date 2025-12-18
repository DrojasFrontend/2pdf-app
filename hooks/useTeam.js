import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getOrganizationMembers, getUserRole, isOwner } from '../lib/team';

export function useTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [membersData, role, owner] = await Promise.all([
        getOrganizationMembers(),
        getUserRole(),
        isOwner(),
      ]);
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
    fetchMembers();
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

      // Refrescar la lista de miembros
      await fetchMembers();
      
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

