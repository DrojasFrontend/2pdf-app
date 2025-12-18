'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { CodeIcon, CopyIcon, AlertIcon, EditIcon, MoreVerticalIcon } from './Icons';
import { useTemplates } from '../hooks/useTemplates';
import { useEditorStore } from '../store/editorStore';

export default function TemplateListItem({ template }) {
  const router = useRouter();
  const { loadTemplate } = useTemplates();
  const { setHtml, setCss, setData } = useEditorStore();
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    try {
      setLoading(true);
      const templateData = await loadTemplate(template.id);
      
      // Cargar el template en el editor
      setHtml(templateData.version.html);
      setCss(templateData.version.css);
      setData(templateData.version.data || '{}');
      
      // Redirigir al editor con el templateId
      router.push(`/?templateId=${template.id}`);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error al cargar el template: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id);
    // Aquí podrías agregar una notificación de éxito si quieres
  };

  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-title">
          <CodeIcon className="template-icon" />
          <span className="template-name">{template.name}</span>
        </div>
        <div className="template-actions">
          <button 
            className="template-edit-btn"
            onClick={handleEdit}
            disabled={loading}
          >
            <EditIcon className="edit-icon" />
            {loading ? 'Cargando...' : 'Edit'}
          </button>
          <button className="template-more-btn">
            <MoreVerticalIcon />
          </button>
        </div>
      </div>
      <div className="template-details">
        {template.description && (
          <div className="template-description" style={{ marginBottom: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
            {template.description}
          </div>
        )}
        <div className="template-id">
          <span>ID: {template.id}</span>
          <button 
            className="copy-btn" 
            title="Copy ID"
            onClick={handleCopyId}
          >
            <CopyIcon />
          </button>
        </div>
        {template.version && (
          <div className="template-version" style={{ marginTop: '4px', color: '#6b7280', fontSize: '0.875rem' }}>
            Versión: {template.version.version_label}
          </div>
        )}
      </div>
    </div>
  );
}

