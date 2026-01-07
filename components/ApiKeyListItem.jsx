'use client';
import { useState, useRef, useEffect } from 'react';
import { KeyIcon, MoreVerticalIcon, CopyIcon, FolderIcon } from './Icons';
import ConfirmModal from './ConfirmModal';

export default function ApiKeyListItem({ apiKey, onAction }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const menuRef = useRef(null);

  const isRevoked = !apiKey.is_active;
  const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();

  const handleCopyId = () => {
    navigator.clipboard.writeText(apiKey.id);
    if (onAction) {
      onAction('copied', apiKey.id, 'ID copiado al portapapeles');
    }
  };

  const handleCopyLastFour = () => {
    navigator.clipboard.writeText(`...${apiKey.last_four}`);
    if (onAction) {
      onAction('copied', apiKey.id, 'Últimos 4 caracteres copiados');
    }
  };

  const handleRevoke = async () => {
    try {
      setActionLoading(true);
      setShowRevokeConfirm(false);
      setShowMenu(false);
      if (onAction) {
        await onAction('revoke', apiKey.id);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      if (onAction) {
        onAction('error', apiKey.id, error.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setActionLoading(true);
      setShowMenu(false);
      if (onAction) {
        await onAction('reactivate', apiKey.id);
      }
    } catch (error) {
      console.error('Error reactivating API key:', error);
      if (onAction) {
        onAction('error', apiKey.id, error.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      setShowDeleteConfirm(false);
      setShowMenu(false);
      if (onAction) {
        await onAction('delete', apiKey.id);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      if (onAction) {
        onAction('error', apiKey.id, error.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getStatusBadge = () => {
    if (isRevoked) {
      return (
        <span style={{
          fontSize: '0.75rem',
          color: '#f85149',
          backgroundColor: 'rgba(248, 81, 73, 0.2)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          Revocada
        </span>
      );
    }
    if (isExpired) {
      return (
        <span style={{
          fontSize: '0.75rem',
          color: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          Expirada
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '0.75rem',
        color: '#238636',
        backgroundColor: 'rgba(35, 134, 54, 0.2)',
        padding: '2px 8px',
        borderRadius: '4px',
      }}>
        Activa
      </span>
    );
  };

  const getEnvironmentBadge = () => {
    const isProduction = apiKey.environment === 'production';
    return (
      <span style={{
        fontSize: '0.75rem',
        color: isProduction ? '#238636' : '#f59e0b',
        backgroundColor: isProduction ? 'rgba(35, 134, 54, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        padding: '2px 8px',
        borderRadius: '4px',
        border: `1px solid ${isProduction ? 'rgba(35, 134, 54, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
      }}>
        {isProduction ? 'production' : 'sandbox'}
      </span>
    );
  };

  return (
    <div 
      className="template-card"
      style={{
        opacity: isRevoked || isExpired ? 0.7 : 1,
      }}
    >
      <div className="template-header">
        <div className="template-title">
          <KeyIcon className="template-icon" />
          <span className="template-name">{apiKey.name}</span>
          {getStatusBadge()}
          {getEnvironmentBadge()}
        </div>
        <div className="template-actions">
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              className="template-more-btn"
              onClick={() => setShowMenu(!showMenu)}
              disabled={actionLoading}
            >
              <MoreVerticalIcon />
            </button>
            
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 100,
                minWidth: '160px',
              }}>
                {isRevoked ? (
                  <button
                    onClick={handleReactivate}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: '#238636',
                      border: 'none',
                      textAlign: 'left',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      borderBottom: '1px solid #30363d',
                    }}
                    onMouseOver={(e) => {
                      if (!actionLoading) e.target.style.backgroundColor = '#21262d';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Reactivar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowRevokeConfirm(true);
                      setShowMenu(false);
                    }}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: '#f59e0b',
                      border: 'none',
                      textAlign: 'left',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      borderBottom: '1px solid #30363d',
                    }}
                    onMouseOver={(e) => {
                      if (!actionLoading) e.target.style.backgroundColor = '#21262d';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Revocar
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  disabled={actionLoading}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: '#f85149',
                    border: 'none',
                    textAlign: 'left',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                  onMouseOver={(e) => {
                    if (!actionLoading) e.target.style.backgroundColor = '#21262d';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="template-details">
        <div className="template-id" style={{ marginBottom: '4px' }}>
          <span style={{ fontFamily: 'monospace', color: '#8b949e' }}>
            ...{apiKey.last_four}
          </span>
          <button 
            className="copy-btn" 
            title="Copiar últimos 4 caracteres"
            onClick={handleCopyLastFour}
          >
            <CopyIcon />
          </button>
        </div>
        
        {apiKey.projects && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginTop: '8px',
            color: '#ec4899', 
            fontSize: '0.875rem',
          }}>
            <FolderIcon style={{ width: '14px', height: '14px' }} />
            <span>Proyecto: {apiKey.projects.name}</span>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '16px',
          marginTop: '8px',
          fontSize: '0.75rem',
          color: '#6b7280',
        }}>
          <span>
            Creada: {new Date(apiKey.created_at).toLocaleDateString('es-ES')}
          </span>
          {apiKey.expires_at && (
            <span>
              Expira: {new Date(apiKey.expires_at).toLocaleDateString('es-ES')}
            </span>
          )}
          {apiKey.revoked_at && (
            <span style={{ color: '#f85149' }}>
              Revocada: {new Date(apiKey.revoked_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>

        {apiKey.revoked_reason && (
          <div style={{ 
            marginTop: '8px',
            fontSize: '0.75rem',
            color: '#8b949e',
            fontStyle: 'italic',
          }}>
            Razón: {apiKey.revoked_reason}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        onConfirm={handleRevoke}
        title="Revocar API Key"
        message={`¿Estás seguro de que quieres revocar "${apiKey.name}"? Los sistemas que usen esta key dejarán de funcionar inmediatamente.`}
        confirmText="Revocar"
        cancelText="Cancelar"
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar API Key"
        message={`¿Estás seguro de que quieres eliminar permanentemente "${apiKey.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}

