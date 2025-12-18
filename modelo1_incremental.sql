-- 2pdf core data model for Supabase/PostgreSQL
-- VERSIÓN INCREMENTAL: Solo crea lo que no existe (seguro para desarrollo)
-- Run this in the main `public` schema (default in Supabase).

------------------------------------------------------------
-- ENUM TYPES (solo si no existen)
------------------------------------------------------------

-- Environment for API keys / projects
DO $$ BEGIN
  CREATE TYPE env_type AS ENUM ('sandbox', 'production');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Organization membership roles
DO $$ BEGIN
  CREATE TYPE org_role AS ENUM ('owner', 'admin', 'developer', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Status for render jobs
DO $$ BEGIN
  CREATE TYPE render_job_status AS ENUM (
    'queued',
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Status for webhook deliveries
DO $$ BEGIN
  CREATE TYPE webhook_delivery_status AS ENUM (
    'pending',
    'success',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

------------------------------------------------------------
-- CORE MULTI-TENANT STRUCTURE
------------------------------------------------------------

-- Users table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE app_users IS 'Application-level users linked to Supabase auth.users';
COMMENT ON COLUMN app_users.auth_user_id IS 'Foreign key to auth.users.id';

------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL
);

COMMENT ON TABLE organizations IS 'Top-level tenant: company / client account';
COMMENT ON COLUMN organizations.slug IS 'Short unique identifier used in URLs or internal references';

------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'developer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

COMMENT ON TABLE organization_memberships IS 'Membership and role of a user within an organization';

------------------------------------------------------------
-- PROJECTS / APPLICATIONS
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL,
  UNIQUE (organization_id, slug)
);

COMMENT ON TABLE projects IS 'Logical applications inside an organization: e.g. LIMS, contracts, labels';

------------------------------------------------------------
-- API KEYS
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  environment env_type NOT NULL DEFAULT 'production',
  key_hash text NOT NULL,
  last_four text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  daily_limit integer,
  monthly_limit integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL,
  revoked_at timestamptz,
  revoked_reason text
);

CREATE INDEX IF NOT EXISTS api_keys_project_id_idx ON api_keys (project_id);
CREATE INDEX IF NOT EXISTS api_keys_environment_idx ON api_keys (environment);

COMMENT ON TABLE api_keys IS 'Hashed API keys used by clients to access public endpoints';

------------------------------------------------------------
-- TEMPLATES & VERSIONS
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects (id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  template_type text, -- e.g. 'lab_report', 'certificate', 'label', 'contract'
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS templates_org_idx ON templates (organization_id);
CREATE INDEX IF NOT EXISTS templates_project_idx ON templates (project_id);

COMMENT ON TABLE templates IS 'Logical definition of a document type (Informe, Certificado, Contrato, etc.)';

------------------------------------------------------------

CREATE TABLE IF NOT EXISTS template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates (id) ON DELETE CASCADE,
  version_label text NOT NULL, -- e.g. '1.0.0', 'v2', etc.
  major integer DEFAULT 1,
  minor integer DEFAULT 0,
  patch integer DEFAULT 0,
  html text NOT NULL,
  css text,
  data_schema jsonb, -- optional JSON schema or structure of expected payload
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS template_versions_template_id_idx ON template_versions (template_id);
CREATE INDEX IF NOT EXISTS template_versions_is_default_idx ON template_versions (template_id, is_default) WHERE is_default = true;

COMMENT ON TABLE template_versions IS 'Immutable versions of a template. Rendering should always reference a specific version';

------------------------------------------------------------
-- EXAMPLE DATA FOR TEMPLATES (DESIGN-TIME)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS template_example_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_version_id uuid NOT NULL REFERENCES template_versions (id) ON DELETE CASCADE,
  name text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL
);

COMMENT ON TABLE template_example_data IS 'Saved sample payloads to test templates in the visual editor';

------------------------------------------------------------
-- ASSETS (IMAGES, FONTS, ETC.)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects (id) ON DELETE SET NULL,
  name text NOT NULL,
  asset_type text NOT NULL, -- e.g. 'image', 'font', 'other'
  storage_path text NOT NULL, -- e.g. Supabase storage path or S3 key
  content_type text,
  size_bytes bigint,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS assets_org_idx ON assets (organization_id);
CREATE INDEX IF NOT EXISTS assets_project_idx ON assets (project_id);

COMMENT ON TABLE assets IS 'Reusable assets (logos, backgrounds, fonts) referenced from templates';

------------------------------------------------------------
-- RENDER JOBS (MIDDLEWARE <-> ENGINE)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS render_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  template_version_id uuid NOT NULL REFERENCES template_versions (id) ON DELETE RESTRICT,
  api_key_id uuid REFERENCES api_keys (id) ON DELETE SET NULL,
  requested_by_user_id uuid REFERENCES app_users (id) ON DELETE SET NULL,
  status render_job_status NOT NULL DEFAULT 'queued',
  payload jsonb NOT NULL, -- data sent by client
  options jsonb,          -- e.g. delivery instructions, localization, etc.
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  queued_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS render_jobs_org_idx ON render_jobs (organization_id);
CREATE INDEX IF NOT EXISTS render_jobs_project_idx ON render_jobs (project_id);
CREATE INDEX IF NOT EXISTS render_jobs_template_version_idx ON render_jobs (template_version_id);
CREATE INDEX IF NOT EXISTS render_jobs_status_idx ON render_jobs (status);
CREATE INDEX IF NOT EXISTS render_jobs_created_at_idx ON render_jobs (created_at);

COMMENT ON TABLE render_jobs IS 'Each request to generate a document: tracks payload, template version, status and timing';

------------------------------------------------------------
-- GENERATED DOCUMENTS
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  render_job_id uuid NOT NULL REFERENCES render_jobs (id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  template_version_id uuid NOT NULL REFERENCES template_versions (id) ON DELETE RESTRICT,
  file_url text NOT NULL,
  storage_provider text DEFAULT 'supabase', -- e.g. 'supabase', 's3', 'gcs', 'custom'
  file_size_bytes bigint,
  checksum text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS documents_org_idx ON documents (organization_id);
CREATE INDEX IF NOT EXISTS documents_project_idx ON documents (project_id);
CREATE INDEX IF NOT EXISTS documents_render_job_idx ON documents (render_job_id);

COMMENT ON TABLE documents IS 'Final generated PDFs, with storage location and metadata';

------------------------------------------------------------
-- WEBHOOKS & DELIVERY
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  target_url text NOT NULL,
  secret text,
  event_types text[], -- e.g. ['document.generated', 'render.failed']
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES app_users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS webhook_endpoints_org_idx ON webhook_endpoints (organization_id);
CREATE INDEX IF NOT EXISTS webhook_endpoints_project_idx ON webhook_endpoints (project_id);

COMMENT ON TABLE webhook_endpoints IS 'Registered webhooks that receive events such as document.generated or render.failed';

------------------------------------------------------------

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_endpoint_id uuid NOT NULL REFERENCES webhook_endpoints (id) ON DELETE CASCADE,
  render_job_id uuid REFERENCES render_jobs (id) ON DELETE SET NULL,
  document_id uuid REFERENCES documents (id) ON DELETE SET NULL,
  status webhook_delivery_status NOT NULL DEFAULT 'pending',
  request_body jsonb,
  response_body jsonb,
  response_status integer,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS webhook_deliveries_endpoint_idx ON webhook_deliveries (webhook_endpoint_id);
CREATE INDEX IF NOT EXISTS webhook_deliveries_status_idx ON webhook_deliveries (status);

COMMENT ON TABLE webhook_deliveries IS 'Each attempt to send an event payload to a webhook endpoint';

------------------------------------------------------------
-- AUDIT EVENTS
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects (id) ON DELETE SET NULL,
  user_id uuid REFERENCES app_users (id) ON DELETE SET NULL,
  event_type text NOT NULL, -- e.g. 'template.created', 'template_version.published', 'api_key.revoked'
  entity_type text,         -- e.g. 'template', 'template_version', 'api_key'
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_org_idx ON audit_events (organization_id);
CREATE INDEX IF NOT EXISTS audit_events_project_idx ON audit_events (project_id);
CREATE INDEX IF NOT EXISTS audit_events_type_idx ON audit_events (event_type);

COMMENT ON TABLE audit_events IS 'High-level audit log of significant actions across the platform';

------------------------------------------------------------
-- USAGE / METRICS (BASIC)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects (id) ON DELETE SET NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  documents_generated integer NOT NULL DEFAULT 0,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, project_id, period_start, period_end)
);

COMMENT ON TABLE usage_counters IS 'Aggregated usage metrics per org/project and period (e.g. monthly)';

------------------------------------------------------------
-- OPTIONAL: AI ASSIST SESSIONS (FOR TEMPLATE DESIGN)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_assist_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects (id) ON DELETE SET NULL,
  template_id uuid REFERENCES templates (id) ON DELETE SET NULL,
  template_version_id uuid REFERENCES template_versions (id) ON DELETE SET NULL,
  user_id uuid REFERENCES app_users (id) ON DELETE SET NULL,
  prompt text NOT NULL,
  response text,
  model_name text,
  was_applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_assist_sessions IS 'History of AI-assisted interactions when designing or editing templates';

------------------------------------------------------------
-- AGREGAR FOREIGN KEY A auth.users (solo si no existe)
------------------------------------------------------------

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'app_users_auth_user_id_fkey'
  ) THEN
    ALTER TABLE app_users
      ADD CONSTRAINT app_users_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END $$;
