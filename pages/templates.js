import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useTemplates } from '../hooks/useTemplates';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import SettingsContent from '../components/SettingsContent';
import ChatWidget from '../components/ChatWidget';
import Toast from '../components/Toast';

export default function Templates() {
  const [activeSection, setActiveSection] = useState('Templates');
  const { userName, userEmail, refreshUserName } = useUser();
  const { templates, loading, error, refreshTemplates } = useTemplates();
  const router = useRouter();
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar templates basado en el término de búsqueda
  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) {
      return templates;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return templates.filter(template => {
      const nameMatch = template.name?.toLowerCase().includes(term);
      const descriptionMatch = template.description?.toLowerCase().includes(term);
      const idMatch = template.id?.toLowerCase().includes(term);
      return nameMatch || descriptionMatch || idMatch;
    });
  }, [templates, searchTerm]);

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

        <SettingsContent 
          templates={templates}
          filteredTemplates={filteredTemplates}
          onAddFolder={handleAddFolder}
          onTemplateAction={handleTemplateAction}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={loading}
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

