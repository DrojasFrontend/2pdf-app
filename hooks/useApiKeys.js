import { useState, useEffect, useRef } from 'react';
import { 
  getOrganizationApiKeys, 
  getProjectApiKeys, 
  createApiKey, 
  revokeApiKey, 
  deleteApiKey,
  reactivateApiKey 
} from '../lib/apiKeys';

// Caché global
let cachedApiKeys = [];
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useApiKeys(projectId = null) {
  const [apiKeys, setApiKeys] = useState(cachedApiKeys);
  const [loading, setLoading] = useState(cachedApiKeys.length === 0);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  const fetchApiKeys = async (showLoading = true) => {
    try {
      if (showLoading || cachedApiKeys.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      const data = projectId 
        ? await getProjectApiKeys(projectId)
        : await getOrganizationApiKeys();
      
      cachedApiKeys = data;
      cacheTimestamp = Date.now();
      setApiKeys(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (isInitialMount.current) {
      if (isCacheValid && cachedApiKeys.length > 0) {
        setApiKeys(cachedApiKeys);
        setLoading(false);
        fetchApiKeys(false);
      } else {
        fetchApiKeys(true);
      }
      isInitialMount.current = false;
    }
  }, [projectId]);

  const createKey = async ({ projectId, name, environment }) => {
    try {
      const result = await createApiKey({ projectId, name, environment });
      await fetchApiKeys(true);
      return result; // Retorna la key completa (solo esta vez)
    } catch (err) {
      throw err;
    }
  };

  const revokeKey = async (keyId, reason) => {
    try {
      await revokeApiKey(keyId, reason);
      await fetchApiKeys(true);
    } catch (err) {
      throw err;
    }
  };

  const deleteKey = async (keyId) => {
    try {
      await deleteApiKey(keyId);
      await fetchApiKeys(true);
    } catch (err) {
      throw err;
    }
  };

  const reactivateKey = async (keyId) => {
    try {
      await reactivateApiKey(keyId);
      await fetchApiKeys(true);
    } catch (err) {
      throw err;
    }
  };

  return {
    apiKeys,
    loading,
    error,
    createKey,
    revokeKey,
    deleteKey,
    reactivateKey,
    refreshApiKeys: fetchApiKeys,
  };
}

