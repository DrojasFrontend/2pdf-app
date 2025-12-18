import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useTeam } from '../hooks/useTeam';
import { supabase } from '../lib/supabase';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import InviteMemberModal from '../components/InviteMemberModal';
import ChatWidget from '../components/ChatWidget';
import UserItemSkeleton from '../components/UserItemSkeleton';

export default function Team() {
  const { userName } = useUser();
  const { members, loading, isUserOwner, error, inviteUser } = useTeam();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const router = useRouter();
  
  // activeSection siempre será 'Team' en esta página
  const activeSection = 'Team';
  const setActiveSection = () => {}; // No-op, solo para mantener compatibilidad

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleInvite = async ({ email, firstName, lastName }) => {
    try {
      setInviting(true);
      await inviteUser({ email, firstName, lastName });
      alert('Invitación enviada exitosamente');
      setShowInviteModal(false);
    } catch (err) {
      alert('Error al enviar invitación: ' + err.message);
      throw err;
    } finally {
      setInviting(false);
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
        onLogout={handleLogout}
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
                  style={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    padding: '16px',
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
                        backgroundColor: '#21262d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c9d1d9',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}>
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      {member.displayName && (
                        <div style={{ fontWeight: '500', color: '#c9d1d9', marginBottom: '4px' }}>
                          {member.displayName}
                        </div>
                      )}
                      <div style={{ fontSize: '0.875rem', color: '#8b949e' }}>
                        {member.authUserId ? 'Usuario activo' : 'Invitación pendiente'}
                      </div>
                    </div>
                  </div>
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
    </div>
  );
}

