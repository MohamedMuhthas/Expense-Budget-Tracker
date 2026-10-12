import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener('expense-tracker:logout', handleForcedLogout);
    return () => window.removeEventListener('expense-tracker:logout', handleForcedLogout);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [logout]);

  const saveAuth = useCallback(({ token, user: authenticatedUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return saveAuth(data);
  }, [saveAuth]);

  const register = useCallback(async (details) => {
    const { data } = await api.post('/auth/register', details);
    return saveAuth(data);
  }, [saveAuth]);

  const value = useMemo(() => ({ user, login, register, logout, loading }), [user, login, register, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
