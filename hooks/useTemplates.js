import { useState, useEffect, useRef } from 'react';
import { getUserTemplates, createTemplate, createTemplateVersion, getTemplate, deleteTemplate, duplicateTemplate, renameTemplate } from '../lib/templates';

// Caché global para mantener los templates entre montajes del componente
let cachedTemplates = [];
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useTemplates() {
  const [templates, setTemplates] = useState(cachedTemplates);
  const [loading, setLoading] = useState(cachedTemplates.length === 0);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  const fetchTemplates = async (showLoading = true) => {
    try {
      // Solo mostrar loading si no hay datos en caché o si se solicita explícitamente
      if (showLoading || cachedTemplates.length === 0) {
        setLoading(true);
      }
      setError(null);
      const data = await getUserTemplates();
      
      // Actualizar caché
      cachedTemplates = data;
      cacheTimestamp = Date.now();
      
      // Actualizar estado
      setTemplates(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (isInitialMount.current) {
      // Primera carga: usar caché si es válida, sino cargar
      if (isCacheValid && cachedTemplates.length > 0) {
        setTemplates(cachedTemplates);
        setLoading(false);
        // Revalidar en segundo plano sin mostrar loading
        fetchTemplates(false);
      } else {
        fetchTemplates(true);
      }
      isInitialMount.current = false;
    } else {
      // Revalidación en segundo plano: no mostrar loading si hay datos
      if (cachedTemplates.length > 0) {
        fetchTemplates(false);
      }
    }
  }, []);

  const saveTemplate = async ({ name, description, html, css, data, projectId }) => {
    try {
      const result = await createTemplate({ name, description, html, css, data, projectId });
      await fetchTemplates(true); // Refrescar la lista (mostrar loading porque es una acción explícita)
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateTemplate = async (templateId, { html, css, data, notes }) => {
    try {
      const result = await createTemplateVersion(templateId, { html, css, data, notes });
      await fetchTemplates(true); // Refrescar la lista (mostrar loading porque es una acción explícita)
      return result;
    } catch (err) {
      throw err;
    }
  };

  const loadTemplate = async (templateId) => {
    try {
      const template = await getTemplate(templateId);
      return template;
    } catch (err) {
      throw err;
    }
  };

  const removeTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId);
      await fetchTemplates(true); // Refrescar la lista (mostrar loading porque es una acción explícita)
    } catch (err) {
      throw err;
    }
  };

  const duplicateTemplateAction = async (templateId) => {
    try {
      await duplicateTemplate(templateId);
      await fetchTemplates(true); // Refrescar la lista (mostrar loading porque es una acción explícita)
    } catch (err) {
      throw err;
    }
  };

  const renameTemplateAction = async (templateId, newName) => {
    try {
      await renameTemplate(templateId, newName);
      await fetchTemplates(true); // Refrescar la lista (mostrar loading porque es una acción explícita)
    } catch (err) {
      throw err;
    }
  };

  return {
    templates,
    loading,
    error,
    saveTemplate,
    updateTemplate,
    loadTemplate,
    removeTemplate,
    duplicateTemplate: duplicateTemplateAction,
    renameTemplate: renameTemplateAction,
    refreshTemplates: fetchTemplates,
  };
}

