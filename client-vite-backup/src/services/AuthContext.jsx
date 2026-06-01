import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from './apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState('light');

  // On mount: restore session + load theme from /settings
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      apiClient.get('/users/me'),
      apiClient.get('/settings').catch(() => null), // settings may fail silently if not seeded
    ])
      .then(([meRes, settingsRes]) => {
        setCurrentUser(meRes.data);
        if (settingsRes?.data?.theme) {
          setThemeState(settingsRes.data.theme);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Apply theme to the document whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  async function login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);

    // After login, fetch settings so theme picks up
    try {
      const settingsRes = await apiClient.get('/settings');
      if (settingsRes?.data?.theme) setThemeState(settingsRes.data.theme);
    } catch {
      // ignore
    }

    return user;
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    setCurrentUser(null);
    setThemeState('light'); // reset to light on logout
  }

  // Called by Settings page when theme is saved so the change is immediate
  function setTheme(newTheme) {
    setThemeState(newTheme);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}