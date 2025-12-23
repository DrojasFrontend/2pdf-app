'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NAVIGATION_ITEMS } from '../constants/settings';
import { ChevronRightIcon, ArrowUpIcon, FileTextIcon, MessageIcon } from './Icons';
import UserSettingsModal from './UserSettingsModal';

export default function SettingsSidebar({ activeSection, onSectionChange, userName, userEmail, onLogout, onUpdateName }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  const handleSaveName = async (newName) => {
    if (onUpdateName) {
      await onUpdateName(newName);
    }
    setShowSettingsModal(false);
  };

  return (
    <aside className="settings-sidebar">
      <div 
        className="sidebar-user"
        onClick={handleUserClick}
        style={{ cursor: 'pointer', position: 'relative' }}
        ref={menuRef}
      >
        <span className="user-name">{userName}</span>
        <ChevronRightIcon className="user-arrow" />
        
        {showUserMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            <button
              onClick={handleSettings}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #30363d',
                color: '#c9d1d9',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#21262d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Ajustes
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#c9d1d9',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#21262d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = item.Icon;
          const handleClick = () => {
            onSectionChange(item.id);
            // Navegar a la ruta correspondiente
            if (item.id === 'Templates') {
              router.push('/templates');
            } else if (item.id === 'Projects') {
              router.push('/projects');
            } else if (item.id === 'Team') {
              router.push('/team');
            }
            // Agregar más rutas según sea necesario
          };
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={handleClick}
            >
              <span className="nav-icon">
                <IconComponent />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="upgrade-btn">
          <ArrowUpIcon className="upgrade-icon" />
          <span>UPGRADE NOW!</span>
        </button>
        <button className="footer-link">
          <FileTextIcon className="footer-icon" />
          <span>Documentation</span>
        </button>
        <button className="footer-link">
          <MessageIcon className="footer-icon" />
          <span>What's new?</span>
          <span className="notification-badge">5</span>
        </button>
      </div>

      <UserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentName={userName !== userEmail ? userName : ''}
        onSave={handleSaveName}
      />
    </aside>
  );
}

