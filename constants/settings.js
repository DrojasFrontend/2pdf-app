import { 
  TemplateIcon, 
  SnippetIcon, 
  DocumentIcon, 
  SettingsIcon, 
  TeamIcon, 
  WebhookIcon, 
  KeyIcon,
  FolderIcon
} from '../components/Icons';

export const NAVIGATION_ITEMS = [
  { id: 'Templates', Icon: TemplateIcon, label: 'Templates' },
  { id: 'Projects', Icon: FolderIcon, label: 'Projects' },
  { id: 'Snippets', Icon: SnippetIcon, label: 'Snippets' },
  { id: 'Documents', Icon: DocumentIcon, label: 'Documents' },
  { id: 'Settings', Icon: SettingsIcon, label: 'Settings' },
  { id: 'Team', Icon: TeamIcon, label: 'Team' },
  { id: 'Webhooks', Icon: WebhookIcon, label: 'Webhooks' },
  { id: 'API Key', Icon: KeyIcon, label: 'API Key' },
];

export const MOCK_TEMPLATES = [
  {
    id: 'BB5DFD85-7FE8-49C4-9916-D8BC4C90B42E',
    name: 'PDF',
    engine: 'v5',
    hasUnpublishedChanges: true,
  },
];

