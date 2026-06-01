import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../services/AuthContext';

/**
 * Reusable field-with-save card. Independent state per field.
 */
function SettingField({
  label,
  description,
  type = 'text',
  options,           // for select fields
  initialValue,
  onSave,            // (newValue) => Promise<savedValue>
  validate,          // (value) => string | null
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Keep local state in sync if initialValue changes (e.g. on initial load)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const isDirty = value !== initialValue;

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (validate) {
      const v = validate(value);
      if (v) {
        setError(v);
        return;
      }
    }

    setSaving(true);
    try {
      const saved = await onSave(value);
      setValue(saved);
      setSuccess('Saved.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-white shadow rounded-lg p-6 space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}

        {options ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                       disabled:bg-gray-100"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                       disabled:bg-gray-100"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-md
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function Settings() {
  const { setTheme: applyTheme } = useAuth();

  const [loaded, setLoaded] = useState(null); // null = loading, else { username, email, theme }
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    apiClient
      .get('/settings')
      .then((res) => setLoaded(res.data))
      .catch((err) => setLoadError(err.message || 'Failed to load settings.'));
  }, []);

  if (loadError) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {loadError}
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <p className="text-gray-500">Loading settings…</p>
      </div>
    );
  }

  // Save handlers — each updates one field via PUT /api/settings
  async function saveUsername(newUsername) {
    const res = await apiClient.put('/settings', { username: newUsername });
    setLoaded({ ...loaded, username: res.data.username });
    return res.data.username;
  }

  async function saveEmail(newEmail) {
    const res = await apiClient.put('/settings', { email: newEmail });
    setLoaded({ ...loaded, email: res.data.email });
    return res.data.email;
  }

  async function saveTheme(newTheme) {
    const res = await apiClient.put('/settings', { theme: newTheme });
    setLoaded({ ...loaded, theme: res.data.theme });
    applyTheme(res.data.theme); // immediate UI effect
    return res.data.theme;
  }

  // Validators
  function validateUsername(v) {
    if (!v || !v.trim()) return 'Username cannot be empty.';
    return null;
  }

  function validateEmail(v) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email.';
    return null;
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <p className="text-sm text-gray-500">
        Each setting saves independently. Modify any one and click Save.
      </p>

      <SettingField
        label="Username"
        initialValue={loaded.username || ''}
        onSave={saveUsername}
        validate={validateUsername}
      />

      <SettingField
        label="Email"
        type="email"
        initialValue={loaded.email || ''}
        onSave={saveEmail}
        validate={validateEmail}
      />

      <SettingField
        label="Theme preference"
        description="Applied immediately after saving. Affects backgrounds and text colors."
        initialValue={loaded.theme}
        onSave={saveTheme}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />
    </div>
  );
}