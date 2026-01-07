'use client';
import { useState, useEffect } from 'react';

export default function CreateApiKeyModal({ isOpen, onClose, onSave, projects, loading }) {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProjectId(projects?.[0]?.id || '');
      setEnvironment('production');
      setError(null);
    }
  }, [isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!projectId) {
      setError('Debes seleccionar un proyecto');
      return;
    }

    try {
      setError(null);
      await onSave({ projectId, name: name.trim(), environment });
    } catch (err) {
      setError(err.message || 'Error al crear la API Key');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setProjectId('');
      setEnvironment('production');
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
          maxWidth: '500px',
          color: '#c9d1d9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600' }}>
          Crear API Key
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="key-name"
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
              id="key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
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
              placeholder="Ej: Producción Backend, Mobile App..."
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="key-project"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Proyecto *
            </label>
            <select
              id="key-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loading}
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
                cursor: 'pointer',
              }}
            >
              <option value="">Selecciona un proyecto</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {(!projects || projects.length === 0) && (
              <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#f85149' }}>
                Debes crear un proyecto primero
              </p>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Entorno
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="environment"
                  value="production"
                  checked={environment === 'production'}
                  onChange={(e) => setEnvironment(e.target.value)}
                  disabled={loading}
                  style={{ accentColor: '#238636' }}
                />
                <span style={{ fontSize: '0.875rem' }}>Producción</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#238636',
                  backgroundColor: 'rgba(35, 134, 54, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  pk_live_
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="environment"
                  value="sandbox"
                  checked={environment === 'sandbox'}
                  onChange={(e) => setEnvironment(e.target.value)}
                  disabled={loading}
                  style={{ accentColor: '#f59e0b' }}
                />
                <span style={{ fontSize: '0.875rem' }}>Sandbox</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  pk_test_
                </span>
              </label>
            </div>
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
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !projectId}
              style={{
                padding: '10px 20px',
                backgroundColor: loading || !name.trim() || !projectId ? '#30363d' : '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !name.trim() || !projectId ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              {loading ? 'Creando...' : 'Crear API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

