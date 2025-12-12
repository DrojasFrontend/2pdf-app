# 2pdf Data Model Overview

Este documento explica el modelo de datos propuesto para 2pdf y cómo se conectan las entidades principales con la arquitectura que definimos:

- **Engine aislado de render** (servicio privado que genera PDFs).
- **Middleware en Supabase** (edge functions que exponen endpoints públicos, validan API keys, cuotas, permisos, etc.).
- **Frontend autenticado** (editor visual de templates, administración de cuentas, métricas).

La idea es que cualquier desarrollador que se sume al equipo pueda leer esto y entender **qué representa cada tabla** y **cómo se relaciona con las otras capas del sistema**.

---

## 1. Multi-tenant: organizaciones, usuarios, proyectos

### `app_users`

- Representa al **usuario de la aplicación** (no directamente al usuario final de Supabase Auth).
- Se vincula con `auth.users` a través de `auth_user_id`.
- Contiene:
  - `display_name`
  - `avatar_url`
  - `created_at`

> Mentalidad: `auth.users` maneja login / credenciales, `app_users` maneja el contexto de negocio.

---

### `organizations`

- Unidad máxima de **tenant**: una empresa, laboratorio, estudio jurídico, etc.
- Campos clave:
  - `name`
  - `slug`
  - `created_by` (usuario que creó la organización)

> Todo lo demás (proyectos, templates, jobs, documentos, webhooks) cuelga de una organización.

---

### `organization_memberships`

- Relación **N a N** entre `app_users` y `organizations`, con un rol:
  - `role` (ENUM `org_role`: `owner`, `admin`, `developer`, `viewer`).
- Garantiza que un usuario pueda pertenecer a varias organizaciones con permisos distintos.

> Ejemplo: Gonzalo puede ser `owner` en su propia organización y `developer` en la de un cliente.

---

### `projects`

- Subdivisión lógica dentro de una organización.
- Piensa en:
  - "Proyecto LIMS laboratorio A"
  - "Proyecto Contratos Eulogia"
  - "Proyecto Etiquetas Tienda Online"
- Campos clave:
  - `organization_id`
  - `name`
  - `slug`
  - `description`
  - `created_by`

> El **uso real de la API** y los **templates concretos** suelen estar asociados a proyectos, no a toda la organización.

---

## 2. API Keys y acceso a la API pública

### `api_keys`

- Llaves que utilizan los sistemas externos para invocar las edge functions de Supabase.
- Campos clave:
  - `project_id`: la API key pertenece a un proyecto.
  - `environment` (ENUM `env_type`: `sandbox`, `production`).
  - `key_hash`: **nunca se guarda el valor en texto plano**, solo un hash.
  - `last_four`: para mostrar al usuario cuál llave es cuál.
  - `is_active`, `expires_at`, `revoked_at`, `revoked_reason`.
  - Límites opcionales: `daily_limit`, `monthly_limit`.

> En tiempo de ejecución, el middleware valida la API key, identifica `project_id` y `organization_id`, y solo entonces crea un `render_job`.

---

## 3. Templates y versiones (design-time)

Esta parte responde a la pregunta: **¿cómo definimos la “forma” de un documento?**

### `templates`

- Representa el **tipo de documento**:
  - Informe de laboratorio
  - Certificado de curso
  - Contrato de trabajo
  - Etiqueta de producto
- Campos clave:
  - `organization_id`: dueño principal del template.
  - `project_id`: opcional, para asociarlo a un proyecto concreto.
  - `name`, `description`
  - `template_type`: etiqueta libre (`lab_report`, `certificate`, etc.)
  - `is_archived`: para desactivar sin borrar.

> Un template es la idea de “cómo se ve” un documento.  
> El detalle concreto vive en sus versiones.

---

### `template_versions`

- Cada cambio relevante al template genera una **versión inmutable**:
  - `html` y `css` completos en ese momento.
  - `data_schema` opcional (estructura esperada del JSON de entrada).
- Campos clave:
  - `template_id`
  - `version_label` (ej: `1.0.0`, `v2`, etc.)
  - `major`, `minor`, `patch` (ayudan a manejar versiones semánticas).
  - `is_active`: se sigue utilizando para renders.
  - `is_default`: versión por defecto cuando el cliente no especifica una versión.
  - `notes`: comentarios internos.

> Todo **render** debe apuntar a un `template_version_id`.  
> Cambiar el template no afecta documentos generados históricamente.

---

### `template_example_data`

- Sirve para el **editor visual**, no para el engine.
- Permite guardar JSON de prueba:
  - `template_version_id`
  - `name`: ej. “Ejemplo Informe Trigo”
  - `payload`: JSON completo.
- Utilidad:
  - en el frontend, el usuario puede probar el template con distintas muestras,
  - facilita el diseño, debugging y demos.

---

### `assets`

- Reúne recursos reutilizables:
  - logos,
  - fondos,
  - imágenes de productos,
  - fuentes personalizadas.
- Campos clave:
  - `organization_id` (pueden ser globales a la organización),
  - `project_id` (si son específicos de un proyecto),
  - `asset_type` (`image`, `font`, `other`),
  - `storage_path` (ruta en Supabase Storage, S3, etc.),
  - `metadata` (información extra: tamaño original, dimensiones, etc.)

> Los templates **referencian** assets vía URL o path; la tabla `assets` ayuda a administrarlos y listarlos.

---

## 4. Render jobs: el puente entre middleware y engine

Aquí vivimos en el mundo **run-time**: el momento exacto en que un cliente dice:

> “Con este template y estos datos, necesito un PDF.”

### `render_jobs`

- Representa la **solicitud de generación de documento**.
- Es el registro principal para:
  - trazabilidad,
  - métricas,
  - debugging.
- Campos clave:
  - `organization_id`, `project_id`: permiten saber a quién pertenece el job.
  - `template_version_id`: versión exacta que se utilizó.
  - `api_key_id`: qué llave disparó el pedido.
  - `requested_by_user_id`: opcional, si el render viene directamente desde el frontend.
  - `status` (ENUM `render_job_status`):
    - `queued`
    - `processing`
    - `succeeded`
    - `failed`
    - `cancelled`
    - `expired`
  - `payload`: JSON con los datos que alimentan el template.
  - `options`: instrucciones adicionales (idioma, formato, destino, etc.).
  - Timestamps:
    - `created_at`
    - `queued_at`
    - `started_at`
    - `finished_at`
  - `error_message`: detalle cuando falla.

> A nivel arquitectura, el middleware crea un `render_job`, lo pasa a una cola/engine y actualiza `status` conforme el engine avanza.

---

## 5. Documentos generados (PDF final)

### `documents`

- Representa el **resultado físico** de un job: el PDF generado.
- Campos clave:
  - `render_job_id`: vínculo directo al job.
  - `organization_id`, `project_id`
  - `template_version_id`
  - `file_url`: URL o path al archivo.
  - `storage_provider`: ej. `supabase`, `s3`, `gcs`.
  - `file_size_bytes`
  - `checksum`: hash para verificar integridad.
  - `created_at`, `expires_at`
  - `is_deleted`: soft delete.

> Con esto se puede:
> - Mostrar al usuario un historial de documentos.
> - Mantener control de caducidad (reglas de retención).
> - Validar integridad o evitar duplicados.

---

## 6. Webhooks y entregas

No basta con generar el PDF: muchas integraciones requieren notificación o entrega.

### `webhook_endpoints`

- Define **a dónde** y **qué eventos** quiere recibir cada cliente.
- Campos clave:
  - `organization_id`, `project_id`
  - `name`
  - `target_url`
  - `secret`: para firmar las peticiones con HMAC, por ejemplo.
  - `event_types`: lista como `['document.generated', 'render.failed']`.
  - `is_active`
  - `created_by`

> El middleware consulta estos endpoints y, cuando ocurre un evento relevante, crea `webhook_deliveries`.

---

### `webhook_deliveries`

- Representa **cada intento** de enviar un evento a un endpoint.
- Campos clave:
  - `webhook_endpoint_id`
  - `render_job_id` y/o `document_id` (si aplica)
  - `status` (ENUM `webhook_delivery_status`: `pending`, `success`, `failed`)
  - `request_body`, `response_body`
  - `response_status`
  - `attempt_number`
  - `created_at`, `completed_at`

> Esto permite:
> - reintentar webhooks cuando fallan,
> - debugear qué le llegó al sistema externo,
> - ofrecer panel de "Logs de Webhooks" en el frontend.

---

## 7. Auditoría

### `audit_events`

- Registro compacto de **acciones importantes**:
  - creación o cambio de templates,
  - publicación de una versión,
  - rotación/revocación de API keys,
  - cambios de membresía de usuarios, etc.
- Campos clave:
  - `organization_id`, `project_id`
  - `user_id`: humano asociado a la acción, si existe.
  - `event_type`: ej. `template.created`, `template_version.published`, `api_key.revoked`.
  - `entity_type`: ej. `template`, `template_version`, `api_key`.
  - `entity_id`: id de la entidad afectada.
  - `metadata`: JSON con detalles extras.
  - `created_at`.

> Sirve para:
> - cumplimiento (compliance),
> - investigaciones internas,
> - transparencias hacia el cliente ("quién cambió qué y cuándo").

---

## 8. Uso y métricas

### `usage_counters`

- Tabla de **agregados** para facilitar métricas de uso.
- Campos clave:
  - `organization_id`, `project_id`
  - `period_start`, `period_end` (ej. mes calendario)
  - `documents_generated`
  - `last_updated_at`
- `UNIQUE (organization_id, project_id, period_start, period_end)` evita duplicados.

> Esta tabla se puede poblar:
> - vía triggers cuando se crean `documents`,
> - o vía jobs periódicos que consoliden datos desde `render_jobs` / `documents`.

---

## 9. Sesiones de asistencia IA (opcional pero listo para crecer)

### `ai_assist_sessions`

- Pensada para registrar interacciones de IA en el diseño de templates:
  - Ejemplo: “Generar HTML base para un informe de laboratorio”.
- Campos clave:
  - `organization_id`, `project_id`
  - `template_id`, `template_version_id`
  - `user_id`
  - `prompt`, `response`
  - `model_name` (ej. `gpt-5.1`)
  - `was_applied`: indica si el resultado fue aplicado al template.
  - `created_at`

> Permite:
> - entender cómo se usa la IA dentro de 2pdf,
> - analizar qué tipo de prompts funcionan mejor,
> - construir features más avanzadas de copiloto de diseño.

---

## 10. Cómo encaja todo con la arquitectura

Si lo miramos por capas:

### Capa 1: Engine (servicio aislado)

- No expone endpoints públicos.
- Recibe un comando interno del middleware:
  - `render_job_id`
  - datos necesarios (`template_version`, `payload`, `options`).
- Escribe/actualiza:
  - `render_jobs.status`, `started_at`, `finished_at`, `error_message`.
  - crea registros en `documents`.

> A nivel de modelo, el engine solo necesita entender `render_jobs`, `template_versions` y `documents`.

---

### Capa 2: Middleware en Supabase (edge functions)

- Recibe las peticiones externas.
- Valida:
  - API key -> `api_keys`, `projects`, `organizations`.
  - límites -> `usage_counters` + conteo en `render_jobs`/`documents`.
- Crea:
  - un `render_job` en `queued`.
- Publica el trabajo al engine.
- Cuando el engine termina:
  - actualiza `render_jobs`,
  - genera `documents`,
  - dispara `webhook_deliveries` según `webhook_endpoints`.

> Es la “puerta de acceso y validación de petición” que imaginaste.

---

### Capa 3: Frontend autenticado

- Se apoya en:
  - `app_users`, `organizations`, `organization_memberships`.
  - `projects`.
  - `templates`, `template_versions`, `template_example_data`, `assets`.
  - `render_jobs`, `documents` (historial y detalle de ejecuciones).
  - `webhook_endpoints`, `webhook_deliveries`.
  - `audit_events` (página de auditoría).
  - `usage_counters` (panel de métricas).

> Es donde el usuario diseña, administra, revisa y entiende qué está pasando con sus documentos.

---

## 11. Resumen

El modelo de datos de 2pdf busca:

1. **Multi-tenant real**:
   - organizaciones, usuarios y proyectos bien separados.
2. **Claridad entre design-time y run-time**:
   - `templates` / `template_versions` vs `render_jobs` / `documents`.
3. **Seguridad y control de acceso**:
   - `api_keys` ligadas a proyectos y entornos (`sandbox`, `production`).
4. **Automatización y entrega continua**:
   - `webhook_endpoints` + `webhook_deliveries`.
5. **Trazabilidad y auditoría**:
   - `audit_events`, `usage_counters`.
6. **Espacio para IA como copiloto de diseño**:
   - `ai_assist_sessions`.

Sobre este modelo puedes:

- construir RLS en Supabase (por `organization_id` / `project_id`),
- agregar planes de pricing y suscripciones como capa adicional,
- escalar la infraestructura manteniendo la semántica de negocio clara.

La idea es que cualquier persona que lea este documento pueda contestar:

> “Cuando 2pdf genera un documento, ¿qué tablas se tocan y qué historia queda escrita?”

Y la respuesta es siempre trazable de punta a punta:  
**Usuario / Proyecto / Template / Versión / Job / Documento / Entregas / Logs.**
