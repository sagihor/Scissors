/**
 * Lightweight fetch wrapper for talking to the backend.
 *
 * - Prepends the base URL so callers use short paths like '/users/me'
 * - Attaches the auth token from localStorage to every request
 * - Parses JSON automatically
 * - Throws on non-2xx responses (so try/catch works as expected)
 * - On 401, clears the local token and redirects to /login
 */

const BASE_URL = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  // Build headers: caller's headers, plus Content-Type if there's a body, plus auth
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Try to parse the response body as JSON (it always should be, per the API contract)
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Body wasn't JSON - leave payload null
  }

  if (!response.ok) {
    // On 401, the token is bad. Clear it and bounce to login (but avoid redirect loops).
    if (response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Throw an error with the backend's message if available
    const message = payload?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default apiClient;