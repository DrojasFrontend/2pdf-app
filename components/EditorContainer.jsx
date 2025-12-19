'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Tabs from './Tabs';
import HtmlEditor from './Editors/HtmlEditor';
import CssEditor from './Editors/CssEditor';
import DataEditor from './Editors/DataEditor';
import PreviewPane from './PreviewPane';
import AIChatSidebar from './AIChatSidebar';
import Toast from './Toast';
import { useEditorStore } from '../store/editorStore';
import { supabase } from '../lib/supabase';
import { useTemplates } from '../hooks/useTemplates';
import { useProjects } from '../hooks/useProjects';

export default function EditorContainer() {
  const [activeTab, setActiveTab] = useState('HTML');
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [currentTemplateName, setCurrentTemplateName] = useState('');
  const [currentTemplateDescription, setCurrentTemplateDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { saveTemplate, updateTemplate, loadTemplate } = useTemplates();
  const { projects } = useProjects();
  
  // Get state from Zustand store
  const html = useEditorStore((state) => state.html);
  const css = useEditorStore((state) => state.css);
  const data = useEditorStore((state) => state.data);
  const setHtml = useEditorStore((state) => state.setHtml);
  const setCss = useEditorStore((state) => state.setCss);
  const setData = useEditorStore((state) => state.setData);
  const updateUserData = useEditorStore((state) => state.updateUserData);
  const markAsSaved = useEditorStore((state) => state.markAsSaved);
  const savedHtml = useEditorStore((state) => state.savedHtml);
  const savedCss = useEditorStore((state) => state.savedCss);
  const savedData = useEditorStore((state) => state.savedData);
  
  // Estado para rastrear cambios no guardados
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Estado para toast notifications
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  
  // Función para verificar cambios no guardados
  const checkUnsavedChanges = () => {
    return html !== savedHtml || css !== savedCss || data !== savedData;
  };
  
  // Función para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Update user data when component mounts or user changes
  useEffect(() => {
    const updateDataWithUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateUserData(user);
      }
    };

    updateDataWithUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateUserData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [updateUserData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleToggleSidebar = () => {
    if (showAISidebar) {
      // Iniciar animación de salida
      setIsClosing(true);
      setTimeout(() => {
        setShowAISidebar(false);
        setIsClosing(false);
      }, 300); // Duración de la animación
    } else {
      setShowAISidebar(true);
    }
  };

  const handleSaveTemplate = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      
      if (currentTemplateId) {
        // Actualizar template existente - usar nombre y descripción actuales
        await updateTemplate(currentTemplateId, {
          html,
          css,
          data,
          notes: `Actualizado: ${new Date().toLocaleString()}`,
        });
        showToast('Template actualizado exitosamente', 'success');
      } else {
        // Crear nuevo template - usar nombre por defecto
        const defaultName = `Template ${new Date().toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`;
        await saveTemplate({ 
          name: defaultName, 
          description: null, 
          html, 
          css, 
          data,
          projectId: selectedProjectId || null
        });
        showToast('Template guardado exitosamente', 'success');
      }
      // Marcar como guardado después de guardar exitosamente
      setTimeout(() => {
        markAsSaved();
        setUnsavedChanges(false);
      }, 100);
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Error al guardar el template: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Verificar cambios no guardados periódicamente
  useEffect(() => {
    const hasChanges = html !== savedHtml || css !== savedCss || data !== savedData;
    setUnsavedChanges(hasChanges);
  }, [html, css, data, savedHtml, savedCss, savedData]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S o Cmd+S → Guardar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!saving) {
          if (unsavedChanges) {
            handleSaveTemplate();
          } else {
            showToast('No hay cambios para guardar', 'info');
          }
        }
      }
      
      // Esc → Cerrar sidebar AI si está abierto, o salir del editor si está cerrado
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showAISidebar) {
          handleToggleSidebar();
        } else {
          handleBackClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, unsavedChanges, showAISidebar]);
  
  // Advertencia al salir sin guardar
  const handleBackClick = () => {
    if (unsavedChanges) {
      const confirmLeave = window.confirm(
        'Tienes cambios no guardados. ¿Estás seguro de que quieres salir sin guardar?'
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.push('/templates');
  };

  // Cargar template desde query params si existe
  useEffect(() => {
    const templateId = router.query.templateId;
    if (templateId && typeof templateId === 'string' && templateId !== currentTemplateId) {
      setCurrentTemplateId(templateId);
        // Cargar el template
      loadTemplate(templateId)
        .then((templateData) => {
          setHtml(templateData.version.html);
          setCss(templateData.version.css);
          setData(templateData.version.data || '{}');
          // Guardar nombre y descripción del template
          setCurrentTemplateName(templateData.name || '');
          setCurrentTemplateDescription(templateData.description || '');
          setSelectedProjectId(templateData.project_id || null);
          // Marcar como guardado después de cargar
          setTimeout(() => {
            markAsSaved();
          }, 100);
        })
        .catch((error) => {
          console.error('Error loading template:', error);
          showToast('Error al cargar el template: ' + error.message, 'error');
        });
    } else if (!templateId && currentTemplateId) {
      // Si no hay templateId en la URL, limpiar el estado
      setCurrentTemplateId(null);
      setCurrentTemplateName('');
      setCurrentTemplateDescription('');
      setSelectedProjectId(null);
      // Marcar como guardado cuando se limpia (nuevo template)
      markAsSaved();
    } else if (!templateId && !currentTemplateId) {
      // Si es un template nuevo, limpiar nombre y descripción
      setCurrentTemplateName('');
      setCurrentTemplateDescription('');
      setSelectedProjectId(null);
      // Marcar estado inicial como guardado
      markAsSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.templateId]);

  const renderEditor = () => {
    switch (activeTab) {
      case 'HTML':
        return <HtmlEditor value={html} onChange={setHtml} />;
      case 'CSS':
        return <CssEditor value={css} onChange={setCss} />;
      case 'Data':
        return <DataEditor value={data} onChange={setData} />;
      default:
        return null;
    }
  };

  return (
    <div className={`editor-layout ${showAISidebar ? 'with-sidebar' : 'no-sidebar'}`}>
      {showAISidebar && (
        <div className={`ai-sidebar-container ${isClosing ? 'closing' : ''}`}>
          <button
            className="ai-toggle-btn"
            onClick={handleToggleSidebar}
            title="Ocultar AI"
          >
            ✕
          </button>
          <AIChatSidebar />
        </div>
      )}
      <div className="left-panel">
        <div className="panel-header">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="back-btn"
              onClick={handleBackClick}
              title="Regresar a Templates"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#30363d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#21262d';
              }}
            >
              ← Regresar
            </button>
            {!showAISidebar && (
              <button
                className="ai-toggle-btn"
                onClick={handleToggleSidebar}
                title="Mostrar AI"
              >
                🤖
              </button>
            )}
            {!currentTemplateId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label 
                  htmlFor="project-selector"
                  style={{
                    fontSize: '0.875rem',
                    color: '#c9d1d9',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Proyecto:
                </label>
                <select
                  id="project-selector"
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value || null)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0d1117',
                    color: '#c9d1d9',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    outline: 'none',
                    minWidth: '180px',
                  }}
                  title="Seleccionar proyecto (opcional)"
                >
                  <option value="">Sin proyecto</option>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Cargando proyectos...</option>
                  )}
                </select>
              </div>
            )}
            <button
              className="save-btn"
              onClick={handleSaveTemplate}
              disabled={saving}
              title={unsavedChanges ? 'Tienes cambios no guardados (Ctrl+S)' : 'Guardar template (Ctrl+S)'}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: saving 
                  ? '#6b7280' 
                  : unsavedChanges 
                    ? '#f59e0b' 
                    : '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = unsavedChanges ? '#d97706' : '#2ea043';
                }
              }}
              onMouseOut={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = unsavedChanges ? '#f59e0b' : '#238636';
                }
              }}
            >
              {unsavedChanges && !saving && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                  }}
                />
              )}
              {saving 
                ? 'Guardando...' 
                : currentTemplateId 
                  ? 'Actualizar' 
                  : 'Guardar'}
              {unsavedChanges && !saving && ' •'}
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#30363d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#21262d';
              }}
            >
              Salir
            </button>
          </div>
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="editor-wrapper">
          {renderEditor()}
        </div>
      </div>
      <div className="right-panel">
        <PreviewPane />
      </div>
      
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

