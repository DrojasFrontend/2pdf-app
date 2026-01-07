# 📝 Guía para Crear Pull Requests

## PR: API Keys Management + Edge Functions

### Branch
```
feature/edge-function-generate-document
```

### Título
```
feat: Implementar gestión de API Keys y Edge Functions para generación de documentos
```

### Descripción

```markdown
## 📋 Descripción

Implementación completa del sistema de API Keys y Edge Functions para generar documentos PDF mediante API pública.

## ✨ Funcionalidades

### Frontend
- Gestión de API Keys (crear, listar, revocar, reactivar, eliminar)
- Página de administración de API Keys
- Integración con sistema de proyectos

### Backend (Edge Functions)
- `validate-key`: Validación de API Keys
- `generate-document`: Generación de documentos usando templates

## 📁 Archivos Principales

### Frontend
- `pages/api-keys.js` - Página principal
- `components/CreateApiKeyModal.jsx` - Modal para crear keys
- `components/ApiKeyListItem.jsx` - Item de lista
- `lib/apiKeys.js` - Lógica de API Keys
- `hooks/useApiKeys.js` - Hook React

### Backend
- `supabase/functions/validate-key/index.ts`
- `supabase/functions/generate-document/index.ts`
- `supabase/functions/_shared/` - Utilidades compartidas

## 🧪 Testing

Ver `docs/TESTING.md` para instrucciones completas.

## ✅ Checklist

- [x] Frontend de API Keys implementado
- [x] Edge Functions creadas
- [x] Validación de API Keys
- [x] Procesamiento de templates
- [x] Documentación completa
- [ ] Generación real de PDF (pendiente)
```

### Crear el PR

1. Ve a: https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/edge-function-generate-document
2. Copia el título y descripción de arriba
3. Agrega reviewers
4. Click en "Create Pull Request"

