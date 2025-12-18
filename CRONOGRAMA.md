# Cronograma de Implementación - Templates por Usuario

## Objetivo
Permitir que los usuarios guarden templates y los vean en la vista de templates.

---

## FASE 1: Preparación de Base de Datos (Fundación)

### ✅ Paso 1.1: Ejecutar modelo SQL en Supabase
**Branch:** `setup/database-schema`  
**Descripción:** Ejecutar el modelo SQL completo en Supabase  
**Validación:** Verificar que todas las tablas se crearon correctamente  
**Commit:** `feat: ejecutar modelo de base de datos en Supabase`

**Checklist:**
- [ ] Ejecutar `modelo1.sql` en Supabase SQL Editor
- [ ] Verificar creación de ENUMs (env_type, org_role, render_job_status, webhook_delivery_status)
- [ ] Verificar creación de tablas principales (app_users, organizations, templates, template_versions)
- [ ] Verificar índices creados
- [ ] Verificar foreign keys

---

### ✅ Paso 1.2: Agregar Foreign Key a auth.users
**Branch:** `setup/add-auth-fk`  
**Descripción:** Agregar constraint FK de app_users.auth_user_id → auth.users.id  
**Validación:** Verificar que la FK se creó y funciona  
**Commit:** `feat: agregar foreign key de app_users a auth.users`

**SQL a ejecutar:**
```sql
ALTER TABLE app_users
  ADD CONSTRAINT app_users_auth_user_id_fkey
  FOREIGN KEY (auth_user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
```

---

### ✅ Paso 1.3: Agregar constraint para template_versions.is_default
**Branch:** `setup/template-version-constraint`  
**Descripción:** Asegurar que solo una versión sea default por template  
**Validación:** Probar insertar múltiples versiones default (debe fallar)  
**Commit:** `feat: agregar constraint único para versión default de templates`

**SQL a ejecutar:**
```sql
-- Crear función para validar solo una versión default
CREATE UNIQUE INDEX template_versions_one_default_idx 
ON template_versions (template_id) 
WHERE is_default = true;
```

---

### ✅ Paso 1.4: Agregar índice en templates.created_by
**Branch:** `setup/templates-created-by-index`  
**Descripción:** Optimizar consultas de templates por creador  
**Validación:** Verificar que el índice se creó  
**Commit:** `feat: agregar índice en templates.created_by`

**SQL a ejecutar:**
```sql
CREATE INDEX templates_created_by_idx ON templates (created_by);
```

---

## FASE 2: Servicios Base (Backend)

### ✅ Paso 2.1: Crear servicio de usuarios (app_users)
**Branch:** `feature/user-service`  
**Descripción:** Crear funciones para crear/obtener app_users  
**Validación:** Probar crear app_user desde auth_user_id  
**Commit:** `feat: crear servicio para gestionar app_users`

**Archivos:**
- `services/userService.js`
- Funciones: `getAppUserId()`, `ensureAppUser()`

---

### ✅ Paso 2.2: Crear servicio de organizaciones
**Branch:** `feature/organization-service`  
**Descripción:** Crear funciones para crear/obtener organizaciones  
**Validación:** Probar crear organización y membership  
**Commit:** `feat: crear servicio para gestionar organizaciones`

**Archivos:**
- `services/organizationService.js`
- Funciones: `getUserOrganization()`, `createOrganization()`, `ensureUserOrganization()`

---

### ✅ Paso 2.3: Crear servicio de templates
**Branch:** `feature/templates-service`  
**Descripción:** Crear funciones CRUD para templates  
**Validación:** Probar crear, leer, actualizar templates  
**Commit:** `feat: crear servicio CRUD para templates`

**Archivos:**
- `services/templatesService.js`
- Funciones: `getUserTemplates()`, `createTemplate()`, `updateTemplate()`, `getTemplateById()`

---

## FASE 3: Hooks y Estado (Frontend)

### ✅ Paso 3.1: Crear hook useTemplates
**Branch:** `feature/use-templates-hook`  
**Descripción:** Hook para cargar templates del usuario  
**Validación:** Verificar que carga templates desde BD  
**Commit:** `feat: crear hook useTemplates para cargar templates`

**Archivos:**
- `hooks/useTemplates.js`

---

### ✅ Paso 3.2: Actualizar página templates.js para usar datos reales
**Branch:** `feature/templates-page-real-data`  
**Descripción:** Reemplazar MOCK_TEMPLATES con datos de BD  
**Validación:** Verificar que se muestran templates reales  
**Commit:** `feat: conectar página templates con datos reales de BD`

**Archivos:**
- `pages/templates.js`

---

## FASE 4: Funcionalidad de Guardado

### ✅ Paso 4.1: Agregar botón "Save" en editor
**Branch:** `feature/save-template-button`  
**Descripción:** Agregar botón para guardar template desde editor  
**Validación:** Verificar que el botón aparece y funciona  
**Commit:** `feat: agregar botón de guardar template en editor`

**Archivos:**
- `components/EditorContainer.jsx`

---

### ✅ Paso 4.2: Implementar guardado de template nuevo
**Branch:** `feature/save-new-template`  
**Descripción:** Guardar template nuevo (crear template + versión)  
**Validación:** Crear template y verificar en BD y en lista  
**Commit:** `feat: implementar guardado de templates nuevos`

**Archivos:**
- `components/EditorContainer.jsx`
- `services/templatesService.js`

---

### ✅ Paso 4.3: Implementar actualización de template existente
**Branch:** `feature/update-existing-template`  
**Descripción:** Guardar cambios creando nueva versión  
**Validación:** Editar template y verificar nueva versión en BD  
**Commit:** `feat: implementar actualización de templates existentes`

**Archivos:**
- `components/EditorContainer.jsx`
- `services/templatesService.js`

---

## FASE 5: Integración Completa

### ✅ Paso 5.1: Cargar template en editor al hacer clic en "Edit"
**Branch:** `feature/load-template-in-editor`  
**Descripción:** Al hacer clic en Edit, cargar template en editor  
**Validación:** Click en Edit carga HTML/CSS/Data en editor  
**Commit:** `feat: cargar template en editor al hacer clic en Edit`

**Archivos:**
- `components/TemplateListItem.jsx`
- `pages/template-editor.jsx`
- `store/editorStore.js`

---

### ✅ Paso 5.2: Manejar estado "Unpublished changes"
**Branch:** `feature/unpublished-changes-state`  
**Descripción:** Detectar cambios no guardados y mostrar advertencia  
**Validación:** Modificar template y ver advertencia en lista  
**Commit:** `feat: implementar detección de cambios no guardados`

**Archivos:**
- `components/TemplateListItem.jsx`
- `services/templatesService.js`

---

### ✅ Paso 5.3: Agregar modal/formulario para crear template
**Branch:** `feature/create-template-modal`  
**Descripción:** Modal para nombre y descripción al crear template  
**Validación:** Crear template con nombre personalizado  
**Commit:** `feat: agregar modal para crear nuevo template`

**Archivos:**
- `components/CreateTemplateModal.jsx`
- `pages/templates.js`

---

## FASE 6: Mejoras y Pulido

### ✅ Paso 6.1: Manejo de errores y loading states
**Branch:** `feature/error-handling-templates`  
**Descripción:** Mejorar manejo de errores y estados de carga  
**Validación:** Probar casos de error y loading  
**Commit:** `feat: mejorar manejo de errores en templates`

---

### ✅ Paso 6.2: Agregar validaciones
**Branch:** `feature/template-validations`  
**Descripción:** Validar datos antes de guardar  
**Validación:** Probar guardar con datos inválidos  
**Commit:** `feat: agregar validaciones para templates`

---

### ✅ Paso 6.3: Testing y ajustes finales
**Branch:** `feature/templates-testing`  
**Descripción:** Probar flujo completo end-to-end  
**Validación:** Flujo completo funciona sin errores  
**Commit:** `feat: ajustes finales y testing de templates`

---

## Orden de Ejecución Recomendado

1. **FASE 1** (Preparación BD) - Todo primero
2. **FASE 2** (Servicios) - Paso 2.1 → 2.2 → 2.3
3. **FASE 3** (Hooks) - Paso 3.1 → 3.2
4. **FASE 4** (Guardado) - Paso 4.1 → 4.2 → 4.3
5. **FASE 5** (Integración) - Paso 5.1 → 5.2 → 5.3
6. **FASE 6** (Mejoras) - Opcional según necesidad

---

## Notas Importantes

- ✅ Cada paso debe validarse antes de hacer commit
- ✅ Cada paso en su propio branch
- ✅ Commits descriptivos y claros
- ✅ Si algo falla, arreglar antes de continuar
- ✅ Probar en desarrollo antes de mergear a main

---

## Estado Actual
- [ ] FASE 1: Preparación de Base de Datos
- [ ] FASE 2: Servicios Base
- [ ] FASE 3: Hooks y Estado
- [ ] FASE 4: Funcionalidad de Guardado
- [ ] FASE 5: Integración Completa
- [ ] FASE 6: Mejoras y Pulido

