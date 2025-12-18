import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useTeam } from '../hooks/useTeam';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import InviteMemberModal from '../components/InviteMemberModal';
import ConfirmModal from '../components/ConfirmModal';
import ChatWidget from '../components/ChatWidget';
import UserItemSkeleton from '../components/UserItemSkeleton';
import Toast from '../components/Toast';

export default function Team() {
  const { userName, userEmail, refreshUserName } = useUser();
  const { members, loading, isUserOwner, error, inviteUser, removeUser } = useTeam();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const router = useRouter();

  // Obtener el userId del usuario actual
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: appUser } = await supabase
            .from('app_users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();
          if (appUser) {
            setCurrentUserId(appUser.id);
          }
        }
      } catch (error) {
        console.error('Error obteniendo userId actual:', error);
      }
    };
    getCurrentUserId();
  }, []);
  
  // activeSection siempre será 'Team' en esta página
  const activeSection = 'Team';
  const setActiveSection = () => {}; // No-op, solo para mantener compatibilidad

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

  const handleInvite = async ({ email, firstName, lastName }) => {
    try {
      setInviting(true);
      await inviteUser({ email, firstName, lastName });
      showToast('Invitación enviada exitosamente', 'success');
      setShowInviteModal(false);
    } catch (err) {
      showToast('Error al enviar invitación: ' + err.message, 'error');
      throw err;
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteClick = (member) => {
    setUserToDelete(member);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleting(true);
      await removeUser(userToDelete.userId);
      showToast('Usuario eliminado exitosamente', 'success');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      showToast('Error al eliminar usuario: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      owner: 'Owner',
      admin: 'Admin',
      developer: 'Developer',
      viewer: 'Viewer',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      owner: '#ec4899',
      admin: '#8b5cf6',
      developer: '#3b82f6',
      viewer: '#6b7280',
    };
    return colors[role] || '#6b7280';
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
          title="Team"
          actionLabel={isUserOwner ? "Invitar Miembro" : null}
          onAction={isUserOwner ? () => setShowInviteModal(true) : null}
        />

        <div className="settings-content" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <UserItemSkeleton />
              <UserItemSkeleton />
              <UserItemSkeleton />
              <UserItemSkeleton />
            </div>
          ) : error ? (
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'rgba(248, 81, 73, 0.1)', 
              border: '1px solid rgba(248, 81, 73, 0.3)',
              borderRadius: '8px',
              color: '#f85149',
            }}>
              Error: {error}
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#8b949e', padding: '40px' }}>
              <p>No hay miembros en la organización aún.</p>
              {isUserOwner && (
                <p style={{ marginTop: '8px', fontSize: '0.875rem' }}>
                  Haz clic en "Invitar Miembro" para comenzar.
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="template-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {member.displayName && (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#111827',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}>
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      {member.displayName && (
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '16px', marginBottom: '4px' }}>
                          {member.displayName}
                        </div>
                      )}
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {member.authUserId ? 'Usuario activo' : 'Invitación pendiente'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: getRoleColor(member.role) + '20',
                      color: getRoleColor(member.role),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}>
                      {getRoleLabel(member.role)}
                    </div>
                    {isUserOwner && member.userId !== currentUserId && (
                      <button
                        onClick={() => handleDeleteClick(member)}
                        disabled={deleting}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'transparent',
                          border: '1px solid #f85149',
                          borderRadius: '6px',
                          color: '#f85149',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: deleting ? 'not-allowed' : 'pointer',
                          opacity: deleting ? 0.5 : 1,
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                          if (!deleting) {
                            e.target.style.backgroundColor = 'rgba(248, 81, 73, 0.1)';
                          }
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ChatWidget />

      {isUserOwner && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          loading={inviting}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={userToDelete 
          ? `¿Estás seguro de que quieres eliminar a "${userToDelete.displayName || 'este usuario'}"? Esta acción eliminará permanentemente su cuenta y no se puede deshacer.`
          : ''}
        confirmText={deleting ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
        isDestructive={true}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

