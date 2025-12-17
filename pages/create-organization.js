import { useState } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '../hooks/useOrganization';

export default function CreateOrganization() {
  const router = useRouter();
  const { createOrganization, loading, error } = useOrganization();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Generar slug automáticamente desde el nombre
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    // Generar slug automáticamente
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setFormError('El nombre es requerido');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      await createOrganization({ 
        name: name.trim(), 
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-') 
      });
      
      // Esperar un momento para que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirigir a templates después de crear (usar window.location para forzar recarga)
      window.location.href = '/templates';
    } catch (err) {
      setFormError(err.message || 'Error al crear la organización');
      setSaving(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#161b22',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #30363d',
        maxWidth: '500px',
        width: '100%',
      }}>
        <h1 style={{
          marginBottom: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: '600',
        }}>
          Crear Organización
        </h1>
        <p style={{
          marginBottom: '2rem',
          color: '#8b949e',
          fontSize: '0.9rem',
        }}>
          Necesitas crear una organización para comenzar a usar la plataforma
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="org-name"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Nombre de la Organización *
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={handleNameChange}
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
                boxSizing: 'border-box',
              }}
              placeholder="Mi Organización"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="org-slug"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Slug (opcional)
            </label>
            <input
              id="org-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
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
                boxSizing: 'border-box',
              }}
              placeholder="mi-organizacion"
            />
            <p style={{
              marginTop: '4px',
              fontSize: '0.75rem',
              color: '#8b949e',
            }}>
              Identificador único para URLs (se genera automáticamente si se deja vacío)
            </p>
          </div>

          {(error || formError) && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              borderRadius: '6px',
              color: '#f85149',
              fontSize: '0.875rem',
            }}>
              {error || formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
              {saving ? 'Creando...' : 'Crear Organización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

