'use client';
import { useState } from 'react';

export default function SaveTemplateModal({ isOpen, onClose, onSave, isUpdate = false, templateName = '' }) {
  const [name, setName] = useState(templateName);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      await onSave({ name: name.trim(), description: description.trim() });
      // Reset form
      setName(templateName);
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el template');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName(templateName);
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay"
      onClick={handleClose}
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
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          color: '#c9d1d9',
        }}
      >
        <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600' }}>
          {isUpdate ? 'Actualizar Template' : 'Guardar Template'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="template-name"
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
              id="template-name"
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
              placeholder="Nombre del template"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="template-description"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Descripción (opcional)
            </label>
            <textarea
              id="template-description"
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
              placeholder="Descripción del template"
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

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
              {saving ? 'Guardando...' : (isUpdate ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

