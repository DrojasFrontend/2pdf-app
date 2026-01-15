#!/bin/bash

echo "🔍 Validando Edge Functions..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar estructura de archivos
echo "1️⃣ Verificando estructura de archivos..."
if [ -f "supabase/functions/validate-key/index.ts" ]; then
    echo -e "${GREEN}✓${NC} validate-key/index.ts existe"
else
    echo -e "${RED}✗${NC} validate-key/index.ts NO existe"
    exit 1
fi

if [ -f "supabase/functions/generate-document/index.ts" ]; then
    echo -e "${GREEN}✓${NC} generate-document/index.ts existe"
else
    echo -e "${RED}✗${NC} generate-document/index.ts NO existe"
    exit 1
fi

if [ -f "supabase/functions/_shared/cors.ts" ]; then
    echo -e "${GREEN}✓${NC} _shared/cors.ts existe"
else
    echo -e "${RED}✗${NC} _shared/cors.ts NO existe"
    exit 1
fi

if [ -f "supabase/functions/_shared/hash.ts" ]; then
    echo -e "${GREEN}✓${NC} _shared/hash.ts existe"
else
    echo -e "${RED}✗${NC} _shared/hash.ts NO existe"
    exit 1
fi

if [ -f "supabase/functions/_shared/supabase.ts" ]; then
    echo -e "${GREEN}✓${NC} _shared/supabase.ts existe"
else
    echo -e "${RED}✗${NC} _shared/supabase.ts NO existe"
    exit 1
fi

echo ""
echo "2️⃣ Verificando imports y sintaxis básica..."

# Verificar imports en validate-key
if grep -q "from '../_shared/cors.ts'" supabase/functions/validate-key/index.ts; then
    echo -e "${GREEN}✓${NC} validate-key: imports correctos"
else
    echo -e "${RED}✗${NC} validate-key: imports incorrectos"
fi

# Verificar imports en generate-document
if grep -q "from '../_shared/cors.ts'" supabase/functions/generate-document/index.ts; then
    echo -e "${GREEN}✓${NC} generate-document: imports correctos"
else
    echo -e "${RED}✗${NC} generate-document: imports incorrectos"
fi

echo ""
echo "3️⃣ Verificando que Supabase local esté corriendo..."
if curl -s http://127.0.0.1:54321/rest/v1/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Supabase local está corriendo"
else
    echo -e "${YELLOW}⚠${NC} Supabase local NO está corriendo. Ejecuta: supabase start"
fi

echo ""
echo "4️⃣ Resumen de funciones creadas:"
echo "   - validate-key: Valida API keys"
echo "   - generate-document: Genera documentos PDF"
echo ""
echo -e "${GREEN}✅ Validación básica completada${NC}"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Servir funciones localmente: supabase functions serve"
echo "   2. Probar con curl o Postman"
echo "   3. Hacer deploy a producción cuando esté listo"

