import { useState, useEffect } from 'react';
import { getUserTemplates, createTemplate, createTemplateVersion, getTemplate } from '../lib/templates';

export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const saveTemplate = async ({ name, description, html, css, data }) => {
    try {
      const result = await createTemplate({ name, description, html, css, data });
      await fetchTemplates(); // Refrescar la lista
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateTemplate = async (templateId, { html, css, data, notes }) => {
    try {
      const result = await createTemplateVersion(templateId, { html, css, data, notes });
      await fetchTemplates(); // Refrescar la lista
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

  return {
    templates,
    loading,
    error,
    saveTemplate,
    updateTemplate,
    loadTemplate,
    refreshTemplates: fetchTemplates,
  };
}

