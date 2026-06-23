import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from './apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState('light');

  // The effective location used by the map/distance features.
  // Priority: live browser geolocation (if granted) -> user's saved address.
  const [browserLocation, setBrowserLocation] = useState(null);

  // On mount: restore session + load theme from /settings
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      apiClient.get('/users/me'),
      apiClient.get('/settings').catch(() => null),
    ])
      .then(([meRes, settingsRes]) => {
        setCurrentUser(meRes.data);
        if (settingsRes?.data?.theme) setThemeState(settingsRes.data.theme);
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Try the browser's geolocation once. If denied/unavailable, we silently
  // fall back to the user's saved address (handled by effectiveLocation below).
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          addressLabel: 'Your current location',
        });
      },
      () => setBrowserLocation(null), // denied or failed -> use saved default
      { timeout: 8000 }
    );
  }, []);

  // Apply theme to the document whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  async function login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);

    try {
      const settingsRes = await apiClient.get('/settings');
      if (settingsRes?.data?.theme) setThemeState(settingsRes.data.theme);
    } catch {}

    return user;
  }

  // Register a new customer, then sign them in (same flow as login).
  async function register(form) {
    const res = await apiClient.post('/auth/register', form);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);

    try {
      const settingsRes = await apiClient.get('/settings');
      if (settingsRes?.data?.theme) setThemeState(settingsRes.data.theme);
    } catch {}

    return user;
  }

  async function logout() {
    try { await apiClient.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    setCurrentUser(null);
    setThemeState('light');
  }

  function setTheme(newTheme) {
    setThemeState(newTheme);
  }

  // Re-fetch the current user (e.g. after changing address in Settings)
  async function refreshUser() {
    try {
      const meRes = await apiClient.get('/users/me');
      setCurrentUser(meRes.data);
    } catch {}
  }

  // The location the map should use: browser location if we have it,
  // otherwise the user's saved address (their default).
  const effectiveLocation =
    browserLocation ||
    (currentUser && currentUser.latitude != null
      ? {
          latitude: currentUser.latitude,
          longitude: currentUser.longitude,
          addressLabel: currentUser.addressLabel,
        }
      : null);

  return (
    <AuthContext.Provider
      value={{
        currentUser, loading, login, register, logout, theme, setTheme,
        refreshUser, effectiveLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}