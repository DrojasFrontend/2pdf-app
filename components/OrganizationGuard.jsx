import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '../hooks/useOrganization';

export default function OrganizationGuard({ children }) {
  const router = useRouter();
  const { loading, needsOrganization } = useOrganization();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    // Rutas que no requieren organización
    const publicRoutes = ['/login', '/create-organization'];
    const isPublicRoute = publicRoutes.includes(router.pathname);

    // Solo redirigir si necesita organización y NO está en una ruta pública
    // No redirigir si ya está en create-organization (evitar loops)
    if (needsOrganization && !isPublicRoute && router.pathname !== '/create-organization') {
      router.push('/create-organization');
    }
  }, [needsOrganization, loading, router.pathname, mounted]);

  if (!mounted || loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Si necesita organización y no está en la página de crear, no renderizar nada
  // (el useEffect redirigirá)
  if (needsOrganization && router.pathname !== '/create-organization') {
    return null;
  }

  return <>{children}</>;
}

