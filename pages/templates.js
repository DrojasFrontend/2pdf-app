import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useTemplates } from '../hooks/useTemplates';
import { supabase } from '../lib/supabase';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import SettingsContent from '../components/SettingsContent';
import ChatWidget from '../components/ChatWidget';

export default function Templates() {
  const [activeSection, setActiveSection] = useState('Templates');
  const { userName } = useUser();
  const { templates, loading, error } = useTemplates();
  const router = useRouter();

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
          title="Templates"
          actionLabel="Add a Template"
          onAction={handleAddTemplate}
        />

        <SettingsContent 
          templates={templates}
          onAddFolder={handleAddFolder}
        />
      </main>

      <ChatWidget />
    </div>
  );
}

