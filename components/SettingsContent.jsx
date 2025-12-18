'use client';
import TemplateListItem from './TemplateListItem';

export default function SettingsContent({ templates, onAddFolder, onTemplateAction }) {
  return (
    <div className="settings-content">
      <button className="add-folder-btn" onClick={onAddFolder}>
        <span className="add-folder-icon">+</span>
        <span>Add a folder</span>
      </button>

      <div className="templates-list">
        {templates.length === 0 ? (
          <div className="templates-empty">
            <p>No templates yet. Create your first template!</p>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateListItem 
              key={template.id} 
              template={template}
              onAction={onTemplateAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

