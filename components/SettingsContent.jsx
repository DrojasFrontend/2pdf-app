'use client';
import TemplateListItem from './TemplateListItem';
import SearchBar from './SearchBar';

export default function SettingsContent({ templates, onAddFolder, onTemplateAction, searchTerm, onSearchChange, filteredTemplates }) {
  return (
    <div className="settings-content">
      <div className="settings-actions">
        <button className="add-folder-btn" onClick={onAddFolder}>
          <span className="add-folder-icon">+</span>
          <span>Add a folder</span>
        </button>
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          placeholder="Buscar templates..."
        />
      </div>

      <div className="templates-list">
        {filteredTemplates.length === 0 ? (
          <div className="templates-empty">
            <p>
              {searchTerm 
                ? `No se encontraron templates que coincidan con "${searchTerm}"` 
                : 'No templates yet. Create your first template!'}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
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

