import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import ProjectListItem from '../components/ProjectListItem';
import ProjectSkeleton from '../components/ProjectSkeleton';
import SearchBar from '../components/SearchBar';
import ChatWidget from '../components/ChatWidget';
import Toast from '../components/Toast';
import EditProjectModal from '../components/EditProjectModal';

export default function Projects() {
  const [activeSection, setActiveSection] = useState('Projects');
  const { userName, userEmail, refreshUserName } = useUser();
  const { projects, loading, error, refreshProjects, saveProject } = useProjects();
  const router = useRouter();
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Filtrar proyectos basado en el término de búsqueda
  const filteredProjects = projects.filter(project => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const nameMatch = project.name?.toLowerCase().includes(term);
    const descriptionMatch = project.description?.toLowerCase().includes(term);
    const slugMatch = project.slug?.toLowerCase().includes(term);
    const idMatch = project.id?.toLowerCase().includes(term);
    return nameMatch || descriptionMatch || slugMatch || idMatch;
  });

  const handleAddProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateProject = async (name, slug, description) => {
    try {
      setCreating(true);
      await saveProject({ name, slug, description });
      setShowCreateModal(false);
      showToast('Proyecto creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear el proyecto: ' + error.message, 'error');
      throw error;
    } finally {
      setCreating(false);
    }
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

  const handleProjectAction = async (action, projectId, errorMessage) => {
    if (action === 'deleted' || action === 'updated') {
      await refreshProjects();
      const messages = {
        deleted: 'Proyecto eliminado exitosamente',
        updated: 'Proyecto actualizado exitosamente',
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
          title="Projects"
          actionLabel="Add a Project"
          onAction={handleAddProject}
        />

        <div className="settings-content">
          <div className="settings-actions">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar proyectos..."
            />
          </div>

          <div className="templates-list">
            {loading ? (
              <>
                <ProjectSkeleton />
                <ProjectSkeleton />
                <ProjectSkeleton />
                <ProjectSkeleton />
              </>
            ) : filteredProjects.length === 0 ? (
              <div className="templates-empty">
                <p>
                  {searchTerm 
                    ? `No se encontraron proyectos que coincidan con "${searchTerm}"` 
                    : 'No projects yet. Create your first project!'}
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <ProjectListItem 
                  key={project.id} 
                  project={project}
                  onAction={handleProjectAction}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <ChatWidget />
      
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <EditProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
        project={null}
      />
    </div>
  );
}

