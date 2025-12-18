'use client';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) {
  if (!isOpen) return null;

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
      onClick={onClose}
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
        <h2 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: '600' }}>
          {title}
        </h2>
        <p style={{ marginBottom: '20px', fontSize: '0.875rem', color: '#8b949e' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#21262d',
              color: '#c9d1d9',
              border: '1px solid #30363d',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#30363d';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#21262d';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: isDestructive ? '#f85149' : '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = isDestructive ? '#da3633' : '#2ea043';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = isDestructive ? '#f85149' : '#238636';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

