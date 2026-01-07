# 2PDF - Generador de PDFs con Templates

Sistema para crear y gestionar templates de documentos, y generar PDFs dinámicamente mediante API.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

Copia `.env.local.example` a `.env.local` y configura:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Desarrollo Local

```bash
# Iniciar Supabase local
supabase start

# Iniciar aplicación
npm run dev
```

## 📚 Documentación

- [Guía de Pruebas](./docs/TESTING.md) - Cómo probar el sistema
- [Deployment](./docs/DEPLOYMENT.md) - Cómo deployar en producción
- [Pull Requests](./docs/PR_GUIDE.md) - Guía para crear PRs

## 🏗️ Estructura del Proyecto

```
2pdf-app/
├── components/       # Componentes React
├── pages/           # Páginas Next.js
├── lib/             # Utilidades y clientes
├── hooks/           # React Hooks
├── supabase/
│   └── functions/   # Edge Functions
└── docs/            # Documentación
```

## 🔑 Funcionalidades

### Frontend
- ✅ Gestión de API Keys
- ✅ Editor de Templates
- ✅ Gestión de Proyectos
- ✅ Autenticación con Google

### Backend (Edge Functions)
- ✅ Validación de API Keys (`validate-key`)
- ✅ Generación de Documentos (`generate-document`)

## 🧪 Testing

Ver [docs/TESTING.md](./docs/TESTING.md) para instrucciones completas.

### Pruebas Locales

```bash
# Iniciar Supabase local
supabase start

# Servir Edge Functions
supabase functions serve --no-verify-jwt

# Probar validate-key
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "X-API-Key: pk_test_tu_key"
```

### Pruebas en Producción

```bash
# Deployar funciones
supabase functions deploy validate-key
supabase functions deploy generate-document

# Probar
curl -X POST https://tu-project.supabase.co/functions/v1/validate-key \
  -H "X-API-Key: pk_live_tu_key"
```

## 📝 Cambiar entre Local y Remoto

Para desarrollo local, cambia `.env.local`:

```env
# Local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Remoto (producción)
NEXT_PUBLIC_SUPABASE_URL=https://wxtgjdagxhobtrrkyozo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FjE5XiHqFbRWYAqTj4mYoQ_8Hnbz73I
```

## 🔗 Links Útiles

- Supabase Dashboard: https://supabase.com/dashboard
- Documentación Supabase: https://supabase.com/docs

