import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { checkSession } from '../api/client';

export function ProtectedRoute() {
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    let cancelled = false;
    checkSession()
      .then((res) => {
        if (!cancelled) {
          setState(res.authenticated ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        if (!cancelled) setState('unauthenticated');
      });
    return () => { cancelled = true; };
  }, []);

  if (state === 'loading') {
    return (
      <div className="loading-screen">
        <p>Checking session...</p>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
