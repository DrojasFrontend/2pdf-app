import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useApiKeys } from '../hooks/useApiKeys';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import ApiKeyListItem from '../components/ApiKeyListItem';
import CreateApiKeyModal from '../components/CreateApiKeyModal';
import ApiKeyRevealModal from '../components/ApiKeyRevealModal';
import ChatWidget from '../components/ChatWidget';
import Toast from '../components/Toast';
import SearchBar from '../components/SearchBar';

// Skeleton para loading
function ApiKeySkeleton() {
  return (
    <div className="template-card" style={{ opacity: 0.5 }}>
      <div className="template-header">
        <div className="template-title">
          <div style={{ width: '20px', height: '20px', backgroundColor: '#30363d', borderRadius: '4px' }} />
          <div style={{ width: '150px', height: '20px', backgroundColor: '#30363d', borderRadius: '4px' }} />
        </div>
      </div>
      <div className="template-details">
        <div style={{ width: '100px', height: '16px', backgroundColor: '#30363d', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ width: '200px', height: '14px', backgroundColor: '#30363d', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export default function ApiKeys() {
  const [activeSection, setActiveSection] = useState('API Key');
  const { userName, userEmail, refreshUserName } = useUser();
  const { apiKeys, loading, error, createKey, revokeKey, deleteKey, reactivateKey, refreshApiKeys } = useApiKeys();
  const { projects } = useProjects();
  const router = useRouter();
  
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');

  // Filtrar API Keys
  const filteredApiKeys = apiKeys.filter(key => {
    // Filtrar por proyecto
    if (selectedProjectFilter && key.project_id !== selectedProjectFilter) {
      return false;
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const nameMatch = key.name?.toLowerCase().includes(term);
      const projectMatch = key.projects?.name?.toLowerCase().includes(term);
      const lastFourMatch = key.last_four?.toLowerCase().includes(term);
      return nameMatch || projectMatch || lastFourMatch;
    }
    
    return true;
  });

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

  const handleCreateApiKey = async ({ projectId, name, environment }) => {
    try {
      setCreating(true);
      const result = await createKey({ projectId, name, environment });
      setNewApiKey(result);
      setShowCreateModal(false);
      setShowRevealModal(true);
      showToast('API Key creada exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear API Key: ' + error.message, 'error');
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const handleApiKeyAction = async (action, keyId, errorMessage) => {
    try {
      if (action === 'revoke') {
        await revokeKey(keyId);
        showToast('API Key revocada exitosamente', 'success');
      } else if (action === 'reactivate') {
        await reactivateKey(keyId);
        showToast('API Key reactivada exitosamente', 'success');
      } else if (action === 'delete') {
        await deleteKey(keyId);
        showToast('API Key eliminada exitosamente', 'success');
      } else if (action === 'copied') {
        showToast(errorMessage || 'Copiado al portapapeles', 'success');
      } else if (action === 'error') {
        showToast(errorMessage || 'Ocurrió un error', 'error');
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleCloseRevealModal = () => {
    setShowRevealModal(false);
    setNewApiKey(null);
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
          title="API Keys"
          actionLabel="Crear API Key"
          onAction={() => setShowCreateModal(true)}
        />

        <div className="settings-content">
          <div className="settings-actions">
            {projects && projects.length > 0 && (
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '180px',
                }}
                title="Filtrar por proyecto"
              >
                <option value="">Todos los proyectos</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar API Keys..."
            />
          </div>

          {/* Info box */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#0369a1', 
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span>
                Las API Keys permiten a tus aplicaciones generar PDFs usando la API de 2pdf. 
                Cada key está asociada a un proyecto y puede tener límites de uso.
              </span>
            </p>
          </div>

          <div className="templates-list">
            {loading ? (
              <>
                <ApiKeySkeleton />
                <ApiKeySkeleton />
                <ApiKeySkeleton />
              </>
            ) : error ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#f85149',
                backgroundColor: 'rgba(248, 81, 73, 0.1)',
                borderRadius: '8px',
              }}>
                Error: {error}
              </div>
            ) : filteredApiKeys.length === 0 ? (
              <div className="templates-empty">
                <p>
                  {searchTerm || selectedProjectFilter
                    ? 'No se encontraron API Keys con esos filtros' 
                    : 'No hay API Keys aún. Crea tu primera API Key para comenzar a usar la API.'}
                </p>
                {!searchTerm && !selectedProjectFilter && projects?.length === 0 && (
                  <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
                    Primero debes crear un proyecto en la sección &quot;Projects&quot;.
                  </p>
                )}
              </div>
            ) : (
              filteredApiKeys.map((apiKey) => (
                <ApiKeyListItem 
                  key={apiKey.id} 
                  apiKey={apiKey}
                  onAction={handleApiKeyAction}
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

      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateApiKey}
        projects={projects}
        loading={creating}
      />

      <ApiKeyRevealModal
        isOpen={showRevealModal}
        onClose={handleCloseRevealModal}
        apiKey={newApiKey}
      />
    </div>
  );
}

