'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Tabs from './Tabs';
import HtmlEditor from './Editors/HtmlEditor';
import CssEditor from './Editors/CssEditor';
import DataEditor from './Editors/DataEditor';
import PreviewPane from './PreviewPane';
import AIChatSidebar from './AIChatSidebar';
import SaveTemplateModal from './SaveTemplateModal';
import { useEditorStore } from '../store/editorStore';
import { supabase } from '../lib/supabase';
import { useTemplates } from '../hooks/useTemplates';

export default function EditorContainer() {
  const [activeTab, setActiveTab] = useState('HTML');
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const router = useRouter();
  const { saveTemplate, updateTemplate, loadTemplate } = useTemplates();
  
  // Get state from Zustand store
  const html = useEditorStore((state) => state.html);
  const css = useEditorStore((state) => state.css);
  const data = useEditorStore((state) => state.data);
  const setHtml = useEditorStore((state) => state.setHtml);
  const setCss = useEditorStore((state) => state.setCss);
  const setData = useEditorStore((state) => state.setData);
  const updateUserData = useEditorStore((state) => state.updateUserData);

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

  const handleSaveTemplate = async ({ name, description }) => {
    try {
      if (currentTemplateId) {
        // Actualizar template existente
        await updateTemplate(currentTemplateId, {
          html,
          css,
          data,
          notes: `Actualizado: ${new Date().toLocaleString()}`,
        });
        alert('Template actualizado exitosamente');
      } else {
        // Crear nuevo template
        await saveTemplate({ name, description, html, css, data });
        alert('Template guardado exitosamente');
      }
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al guardar el template: ' + error.message);
    }
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
        })
        .catch((error) => {
          console.error('Error loading template:', error);
          alert('Error al cargar el template: ' + error.message);
        });
    } else if (!templateId && currentTemplateId) {
      // Si no hay templateId en la URL, limpiar el estado
      setCurrentTemplateId(null);
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
              onClick={() => router.push('/templates')}
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
            <button
              className="save-btn"
              onClick={() => setShowSaveModal(true)}
              title="Guardar template"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2ea043';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#238636';
              }}
            >
              {currentTemplateId ? 'Actualizar' : 'Guardar'}
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
      
      <SaveTemplateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTemplate}
        isUpdate={!!currentTemplateId}
      />
    </div>
  );
}

