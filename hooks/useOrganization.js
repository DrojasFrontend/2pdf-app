import { useState, useEffect } from 'react';
import { getUserContext, createOrganization } from '../lib/templates';

export function useOrganization() {
  const [loading, setLoading] = useState(true);
  const [needsOrganization, setNeedsOrganization] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState(null);

  const checkOrganization = async () => {
    try {
      setLoading(true);
      setError(null);
      const context = await getUserContext();
      setNeedsOrganization(context.needsOrganization);
      setOrganizationId(context.organizationId);
    } catch (err) {
      setError(err.message);
      console.error('Error checking organization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOrganization();
  }, []);

  const createOrg = async ({ name, slug }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createOrganization({ name, slug });
      // Refrescar el estado
      await checkOrganization();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    needsOrganization,
    organizationId,
    error,
    createOrganization: createOrg,
    refresh: checkOrganization,
  };
}

