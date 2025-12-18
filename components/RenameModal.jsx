'use client';
import { useState, useEffect } from 'react';

export default function RenameModal({ isOpen, onClose, onSave, currentName }) {
  const [name, setName] = useState(currentName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || '');
      setError(null);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (name.trim() === currentName) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Error al renombrar el template');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName(currentName || '');
      setError(null);
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
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
          color: '#c9d1d9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
          Renombrar Template
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="template-name" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                color: '#c9d1d9'
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
              placeholder="Nombre del template"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#c9d1d9',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1f6feb';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#30363d';
              }}
            />
          </div>
          {error && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '10px',
              backgroundColor: '#f85149',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.875rem'
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
              }}
              onMouseOver={(e) => {
                if (!saving) e.target.style.backgroundColor = '#30363d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#21262d';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: saving || !name.trim() ? '#21262d' : '#238636',
                color: saving || !name.trim() ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                if (!saving && name.trim()) e.target.style.backgroundColor = '#2ea043';
              }}
              onMouseOut={(e) => {
                if (!saving && name.trim()) e.target.style.backgroundColor = '#238636';
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

