'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FolderIcon, MoreVerticalIcon, CopyIcon } from './Icons';
import { useProjects } from '../hooks/useProjects';
import ConfirmModal from './ConfirmModal';
import EditProjectModal from './EditProjectModal';

export default function ProjectListItem({ project, onAction }) {
  const router = useRouter();
  const { removeProject, updateProject } = useProjects();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const menuRef = useRef(null);

  const handleViewTemplates = () => {
    router.push(`/templates?projectId=${project.id}`);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(project.id);
    if (onAction) {
      onAction('copied', project.id);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      setShowDeleteConfirm(false);
      setShowMenu(false);
      await removeProject(project.id);
      if (onAction) {
        onAction('deleted', project.id);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      if (onAction) {
        onAction('error', project.id, error.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (name, slug, description) => {
    try {
      setUpdating(true);
      setShowEditModal(false);
      setShowMenu(false);
      await updateProject(project.id, { name, slug, description });
      if (onAction) {
        onAction('updated', project.id);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      if (onAction) {
        onAction('error', project.id, error.message);
      }
    } finally {
      setUpdating(false);
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

  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-title">
          <FolderIcon className="template-icon" />
          <span 
            className="template-name" 
            onClick={handleViewTemplates}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
            onMouseOver={(e) => {
              e.target.style.textDecoration = 'underline';
              e.target.style.color = '#ec4899';
            }}
            onMouseOut={(e) => {
              e.target.style.textDecoration = 'none';
              e.target.style.color = 'inherit';
            }}
          >
            {project.name}
          </span>
        </div>
        <div className="template-actions">
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              className="template-more-btn"
              onClick={() => setShowMenu(!showMenu)}
              disabled={deleting || updating}
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
                <button
                  onClick={handleViewTemplates}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #30363d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#21262d';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Ver Templates
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  disabled={updating}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    border: 'none',
                    textAlign: 'left',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #30363d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => {
                    if (!updating) e.target.style.backgroundColor = '#21262d';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  disabled={deleting}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: '#f85149',
                    border: 'none',
                    textAlign: 'left',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => {
                    if (!deleting) e.target.style.backgroundColor = '#21262d';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="template-details">
        {project.description && (
          <div className="template-description" style={{ marginBottom: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
            {project.description}
          </div>
        )}
        <div className="template-id">
          <span>Slug: {project.slug || 'N/A'}</span>
          <button 
            className="copy-btn" 
            title="Copy ID"
            onClick={handleCopyId}
          >
            <CopyIcon />
          </button>
        </div>
        <div className="template-id" style={{ marginTop: '4px' }}>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>ID: {project.id}</span>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que quieres eliminar "${project.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdate}
        project={project}
      />
    </div>
  );
}

