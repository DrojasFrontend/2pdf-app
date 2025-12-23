import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useTemplates } from '../hooks/useTemplates';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import SettingsContent from '../components/SettingsContent';
import ChatWidget from '../components/ChatWidget';
import Toast from '../components/Toast';
import { FolderIcon } from '../components/Icons';

export default function Templates() {
  const [activeSection, setActiveSection] = useState('Templates');
  const { userName, userEmail, refreshUserName } = useUser();
  const { templates, loading, error, refreshTemplates } = useTemplates();
  const { projects } = useProjects();
  const router = useRouter();
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');

  // Detectar projectId desde query params y aplicar filtro
  useEffect(() => {
    const projectId = router.query.projectId;
    if (projectId && typeof projectId === 'string') {
      setSelectedProjectFilter(projectId);
    } else {
      setSelectedProjectFilter('');
    }
  }, [router.query.projectId]);

  // Filtrar templates basado en el término de búsqueda y proyecto
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filtrar por proyecto
    if (selectedProjectFilter) {
      filtered = filtered.filter(template => template.project_id === selectedProjectFilter);
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(template => {
        const nameMatch = template.name?.toLowerCase().includes(term);
        const descriptionMatch = template.description?.toLowerCase().includes(term);
        const idMatch = template.id?.toLowerCase().includes(term);
        const projectMatch = template.project?.name?.toLowerCase().includes(term);
        return nameMatch || descriptionMatch || idMatch || projectMatch;
      });
    }

    return filtered;
  }, [templates, searchTerm, selectedProjectFilter]);

  const handleAddTemplate = () => {
    // Redirigir al editor para crear un nuevo template
    router.push('/?new=true');
  };

  const handleAddFolder = () => {
    // TODO: Implementar lógica para agregar folder
    console.log('Add folder clicked');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpdateName = async (newName) => {
    try {
      await updateUserDisplayName(newName);
      await refreshUserName();
      showToast('Nombre actualizado exitosamente', 'success');
    } catch (err) {
      showToast('Error al actualizar el nombre: ' + err.message, 'error');
      throw err;
    }
  };

  const handleTemplateAction = async (action, templateId, errorMessage) => {
    if (action === 'deleted' || action === 'duplicated' || action === 'renamed') {
      await refreshTemplates();
      const messages = {
        deleted: 'Template eliminado exitosamente',
        duplicated: 'Template duplicado exitosamente',
        renamed: 'Template renombrado exitosamente',
      };
      showToast(messages[action] || 'Acción completada', 'success');
    } else if (action === 'copied') {
      showToast('ID copiado al portapapeles', 'success');
    } else if (action === 'error') {
      showToast(errorMessage || 'Ocurrió un error', 'error');
    }
  };

  return (
    <div className="settings-layout">
      <SettingsSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onUpdateName={handleUpdateName}
      />

      <main className="settings-main">
        <SettingsHeader 
          title="Templates"
          actionLabel="Add a Template"
          onAction={handleAddTemplate}
        />

        {/* Breadcrumb cuando hay filtro de proyecto */}
        {selectedProjectFilter && projects && projects.length > 0 && (
          <div style={{
            padding: '16px 24px',
            marginBottom: '24px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            <button
              onClick={() => {
                setSelectedProjectFilter('');
                router.push('/templates');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ec4899',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '0.875rem',
              }}
            >
              Templates
            </button>
            <span style={{ margin: '0 4px' }}>/</span>
            <FolderIcon style={{ width: '16px', height: '16px', color: '#ec4899', marginRight: '4px' }} />
            <span style={{ color: '#111827', fontWeight: '500' }}>
              {projects.find(p => p.id === selectedProjectFilter)?.name || 'Proyecto'}
            </span>
            <button
              onClick={() => {
                setSelectedProjectFilter('');
                router.push('/templates');
              }}
              style={{
                marginLeft: 'auto',
                padding: '6px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ffffff';
              }}
            >
              Ver todos
            </button>
          </div>
        )}

        <SettingsContent 
          templates={templates}
          filteredTemplates={filteredTemplates}
          onAddFolder={handleAddFolder}
          onTemplateAction={handleTemplateAction}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={loading}
          projects={projects}
          selectedProjectFilter={selectedProjectFilter}
          onProjectFilterChange={(projectId) => {
            setSelectedProjectFilter(projectId);
            if (projectId) {
              router.push(`/templates?projectId=${projectId}`, undefined, { shallow: true });
            } else {
              router.push('/templates', undefined, { shallow: true });
            }
          }}
        />
      </main>

      <ChatWidget />
      
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

