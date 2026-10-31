import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, getSession, setSession } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getSession()?.admin ?? null);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setSession({ token: data.token, admin: data.admin });
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setAdmin(null);
  }, []);

  // api.js fires this when the server rejects the token (expired or invalid)
  useEffect(() => {
    const onUnauthorized = () => setAdmin(null);
    window.addEventListener('orbit:unauthorized', onUnauthorized);
    return () => window.removeEventListener('orbit:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }) {
  const { admin } = useAuth();
  const location = useLocation();
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}
