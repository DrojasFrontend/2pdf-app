# Guía de Deployment Separado

## Estructura de Carpetas Recomendada

```
proyecto/
├── frontend/          # Next.js app
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── styles/
│   ├── package.json
│   └── next.config.js
│
└── backend/          # Express API
    ├── server.js
    ├── package.json
    └── Dockerfile
```

---

## Backend - Archivos Necesarios

### 1. Estructura mínima:
```
backend/
├── server.js          # Copiar desde backend-server.js
├── package.json        # Copiar desde backend-package.json
├── Dockerfile          # Copiar desde backend-Dockerfile
└── .env               # Variables de entorno (opcional)
```

### 2. Variables de entorno del backend:
```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend.com
```

### 3. Dependencias del backend:
- express
- cors
- handlebars
- playwright

---

## Frontend - Configuración

### 1. Actualizar package.json:
Remover dependencias del backend:
- ❌ express
- ❌ cors
- ❌ handlebars
- ❌ playwright

### 2. Variables de entorno (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# En producción:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com

NEXT_PUBLIC_N8N_WEBHOOK_URL=https://tu-n8n-webhook.com
```

### 3. Actualizar next.config.js (si existe):
```js
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  },
}
```

---

## Pasos para Separar

### Opción 1: Crear carpetas nuevas

```bash
# 1. Crear estructura
mkdir -p backend frontend

# 2. Mover archivos backend
cp server.js backend/
cp Dockerfile backend/Dockerfile
# Renombrar backend-package.json a backend/package.json

# 3. Mover archivos frontend
cp -r components pages store styles frontend/
cp package.json frontend/package.json
# Actualizar frontend/package.json removiendo dependencias backend

# 4. Limpiar raíz (opcional)
rm server.js Dockerfile
```

### Opción 2: Monorepo (mantener todo junto)

Mantener la estructura actual pero con carpetas separadas:
```
proyecto/
├── backend/
├── frontend/
└── README.md
```

---

## Deployment

### Backend (Docker):
```bash
cd backend
docker build -t pdf-render-worker .
docker run -d -p 3000:3000 \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://tu-frontend.com \
  pdf-render-worker
```

### Frontend (Vercel/Netlify):
```bash
cd frontend
npm install
npm run build

# Variables de entorno en plataforma:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com
# NEXT_PUBLIC_N8N_WEBHOOK_URL=https://tu-webhook.com
```

---

## Testing Local Separado

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm start
# Escucha en http://localhost:3000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev
# Escucha en http://localhost:3001
```

---

## Checklist de Separación

- [ ] Crear carpeta `backend/`
- [ ] Mover `server.js` → `backend/server.js`
- [ ] Crear `backend/package.json` (solo dependencias backend)
- [ ] Crear `backend/Dockerfile`
- [ ] Actualizar `frontend/package.json` (remover dependencias backend)
- [ ] Actualizar `PreviewPane.jsx` para usar `NEXT_PUBLIC_API_URL`
- [ ] Configurar variables de entorno en ambos proyectos
- [ ] Probar backend independiente
- [ ] Probar frontend conectado al backend
- [ ] Configurar CORS en backend para producción

