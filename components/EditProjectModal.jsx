'use client';
import { useState, useEffect } from 'react';

export default function EditProjectModal({ isOpen, onClose, onSave, project }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const isEdit = !!project;

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setName(project.name || '');
        setSlug(project.slug || '');
        setDescription(project.description || '');
        setSlugManuallyEdited(true); // En modo edición, el slug ya existe y no debe sobrescribirse automáticamente
      } else {
        setName('');
        setSlug('');
        setDescription('');
        setSlugManuallyEdited(false); // En modo creación, permitir generación automática
      }
      setError(null);
    }
  }, [isOpen, project, isEdit]);

  // Generar slug automático desde el nombre (solo si no fue editado manualmente)
  useEffect(() => {
    if (!isEdit && name && !slugManuallyEdited) {
      const autoSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setSlug(autoSlug);
    }
  }, [name, isEdit, slugManuallyEdited]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(name.trim(), slug.trim() || null, description.trim() || null);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setSlug('');
      setDescription('');
      setError(null);
      setSlugManuallyEdited(false);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          color: '#c9d1d9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600', textAlign: 'center' }}>
          {isEdit ? 'Editar Proyecto' : 'Crear Proyecto'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="project-name"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Nombre *
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#c9d1d9',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
              placeholder="Nombre del proyecto"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="project-slug"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Slug
            </label>
            <input
              id="project-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true); // Marcar como editado manualmente
              }}
              disabled={saving}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#c9d1d9',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
              placeholder="slug-del-proyecto (se genera automáticamente)"
            />
            <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#6b7280' }}>
              Identificador único para URLs. Se genera automáticamente desde el nombre.
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="project-description"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Descripción
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#c9d1d9',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              placeholder="Descripción del proyecto (opcional)"
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              borderRadius: '6px',
              color: '#f85149',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              style={{
                padding: '10px 20px',
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (!saving) e.target.style.backgroundColor = '#30363d';
              }}
              onMouseOut={(e) => {
                if (!saving) e.target.style.backgroundColor = '#21262d';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: saving || !name.trim() ? '#30363d' : '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (!saving && name.trim()) e.target.style.backgroundColor = '#2ea043';
              }}
              onMouseOut={(e) => {
                if (!saving && name.trim()) e.target.style.backgroundColor = '#238636';
              }}
            >
              {saving ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

