'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CodeIcon, CopyIcon, AlertIcon, EditIcon, MoreVerticalIcon } from './Icons';
import { useTemplates } from '../hooks/useTemplates';
import { useEditorStore } from '../store/editorStore';
import ConfirmModal from './ConfirmModal';
import RenameModal from './RenameModal';

export default function TemplateListItem({ template, onAction }) {
  const router = useRouter();
  const { loadTemplate, removeTemplate, duplicateTemplate, renameTemplate } = useTemplates();
  const { setHtml, setCss, setData } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const menuRef = useRef(null);

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
      if (onAction) {
        onAction('error', template.id, 'Error al cargar el template: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id);
    if (onAction) {
      onAction('copied', template.id);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      setShowDeleteConfirm(false);
      setShowMenu(false);
      await removeTemplate(template.id);
      if (onAction) {
        onAction('deleted', template.id);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      if (onAction) {
        onAction('error', template.id, error.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      setShowMenu(false);
      await duplicateTemplate(template.id);
      if (onAction) {
        onAction('duplicated', template.id);
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      if (onAction) {
        onAction('error', template.id, error.message);
      }
    } finally {
      setDuplicating(false);
    }
  };

  const handleRename = async (newName) => {
    try {
      setRenaming(true);
      await renameTemplate(template.id, newName);
      if (onAction) {
        onAction('renamed', template.id);
      }
    } catch (error) {
      console.error('Error renaming template:', error);
      if (onAction) {
        onAction('error', template.id, error.message);
      }
      throw error;
    } finally {
      setRenaming(false);
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
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              className="template-more-btn"
              onClick={() => setShowMenu(!showMenu)}
              disabled={deleting || duplicating || renaming}
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
                  onClick={() => {
                    setShowRenameModal(true);
                    setShowMenu(false);
                  }}
                  disabled={renaming}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    border: 'none',
                    textAlign: 'left',
                    cursor: renaming ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #30363d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => {
                    if (!renaming) e.target.style.backgroundColor = '#21262d';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Renombrar
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={duplicating}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: '#c9d1d9',
                    border: 'none',
                    textAlign: 'left',
                    cursor: duplicating ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #30363d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => {
                    if (!duplicating) e.target.style.backgroundColor = '#21262d';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {duplicating ? 'Duplicando...' : 'Duplicar'}
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
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Template"
        message={`¿Estás seguro de que quieres eliminar "${template.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />
      
      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRename}
        currentName={template.name}
      />
    </div>
  );
}

