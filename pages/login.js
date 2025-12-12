import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Construir la URL de redirección de manera segura
      // En desarrollo local, forzar localhost:3000 explícitamente
      let redirectTo;
      if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        if (isLocalhost) {
          // Forzar localhost:3000 en desarrollo
          redirectTo = `http://localhost:${window.location.port || 3000}/`;
        } else {
          redirectTo = `${window.location.origin}/`;
        }
      } else {
        redirectTo = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/';
      }
      
      console.log('Redirect URL:', redirectTo); // Debug
      console.log('Current location:', typeof window !== 'undefined' ? window.location.href : 'server');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });

      if (error) {
        console.error('Error logging in:', error.message);
        alert('Error al iniciar sesión: ' + error.message);
        setLoading(false);
      }
      // No establecer loading en false aquí porque la redirección ocurrirá automáticamente
    } catch (error) {
      console.error('Error:', error);
      alert('Error inesperado al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#161b22',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #30363d',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{
          marginBottom: '1rem',
          fontSize: '1.5rem',
          fontWeight: '600',
        }}>
          Iniciar Sesión
        </h1>
        <p style={{
          marginBottom: '2rem',
          color: '#8b949e',
          fontSize: '0.9rem',
        }}>
          Accede con tu cuenta de Google para continuar
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: loading ? '#30363d' : '#238636',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#2ea043';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#238636';
            }
          }}
        >
          {loading ? (
            <>
              <span>Cargando...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

