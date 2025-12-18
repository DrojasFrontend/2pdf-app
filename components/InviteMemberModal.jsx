'use client';
import { useState } from 'react';

export default function InviteMemberModal({ isOpen, onClose, onInvite, loading }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Email inválido');
      return;
    }

    try {
      setError(null);
      await onInvite({ 
        email: email.trim(), 
        firstName: firstName.trim(), 
        lastName: lastName.trim() 
      });
      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al enviar invitación');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setFirstName('');
      setLastName('');
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
          Invitar Miembro
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="invite-email"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Email *
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                boxSizing: 'border-box',
              }}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="invite-firstname"
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
              id="invite-firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
                boxSizing: 'border-box',
              }}
              placeholder="Juan"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="invite-lastname"
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Apellido *
            </label>
            <input
              id="invite-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
                boxSizing: 'border-box',
              }}
              placeholder="Pérez"
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
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = '#30363d';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#21262d';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim() || !firstName.trim() || !lastName.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: loading || !email.trim() || !firstName.trim() || !lastName.trim() ? '#30363d' : '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !email.trim() || !firstName.trim() || !lastName.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (!loading && email.trim() && firstName.trim() && lastName.trim()) {
                  e.target.style.backgroundColor = '#2ea043';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && email.trim() && firstName.trim() && lastName.trim()) {
                  e.target.style.backgroundColor = '#238636';
                }
              }}
            >
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

