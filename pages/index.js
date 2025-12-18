import { useEffect } from 'react';
import { useRouter } from 'next/router';
import EditorContainer from '../components/EditorContainer';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a /templates solo si:
    // - No hay templateId (para editar)
    // - No hay ?new=true (para crear nuevo)
    // - No hay ningún query parameter que indique que quiere usar el editor
    if (!router.query.templateId && !router.query.new) {
      router.replace('/templates');
    }
  }, [router]);

  // Mostrar el editor si hay templateId (editar) o ?new=true (crear nuevo)
  if (router.query.templateId || router.query.new) {
    return (
      <main>
        <EditorContainer />
      </main>
    );
  }

  // Mientras redirige, mostrar loading
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

