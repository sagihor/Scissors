import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../services/AuthContext';
import USER_ADDRESSES, { ADDRESS_CITIES } from '../data/userAddresses';

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
      if (v) { setError(v); return; }
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
    <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}

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
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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

/**
 * Address picker — TWO STEPS:
 *   1. pick a city
 *   2. pick a real address from that city's known list
 * (Free-text autocomplete isn't allowed on the public OSM geocoder, so we offer
 * a verified set.) Saving stores lat/lng + label on the user's account.
 */
function AddressField({ initialLabel, onSave }) {
  // Derive the initial city from the saved label, if any.
  const initial = USER_ADDRESSES.find((a) => a.label === initialLabel);

  const [city, setCity] = useState(initial ? initial.city : '');
  const [label, setLabel] = useState(initial ? initial.label : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Re-sync when the loaded value arrives/changes.
  useEffect(() => {
    const found = USER_ADDRESSES.find((a) => a.label === initialLabel);
    if (found) {
      setCity(found.city);
      setLabel(found.label);
    }
  }, [initialLabel]);

  // Addresses available for the currently selected city.
  const cityAddresses = USER_ADDRESSES.filter((a) => a.city === city);

  const isDirty = label !== initialLabel;

  function handleCityChange(e) {
    const newCity = e.target.value;
    setCity(newCity);
    setLabel(''); // force the user to pick an address in the new city
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const chosen = USER_ADDRESSES.find((a) => a.label === label);
    if (!chosen) { setError('Please choose a city and an address.'); return; }

    setSaving(true);
    try {
      await onSave(chosen); // { label, latitude, longitude, city }
      setSuccess('Saved.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">My address</label>
        <p className="text-xs text-gray-500 mb-3">
          Choose your location in two steps. Used to show the map and filter
          barbershops by distance. Only verified real addresses are listed.
        </p>

        {/* Step 1: city */}
        <label className="block text-xs font-medium text-gray-600 mb-1">Step 1 — City</label>
        <select
          value={city}
          onChange={handleCityChange}
          disabled={saving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                     disabled:bg-gray-100"
        >
          <option value="">Select a city…</option>
          {ADDRESS_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Step 2: address within that city */}
        <label className="block text-xs font-medium text-gray-600 mb-1">Step 2 — Address</label>
        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={saving || !city}
          className="w-full px-3 py-2 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                     disabled:bg-gray-100"
        >
          <option value="">{city ? 'Select an address…' : 'Pick a city first'}</option>
          {cityAddresses.map((a) => (
            <option key={a.label} value={a.label}>{a.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !isDirty || !label}
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
  const { setTheme: applyTheme, refreshUser } = useAuth();

  const [loaded, setLoaded] = useState(null);
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{loadError}</div>
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
    applyTheme(res.data.theme);
    return res.data.theme;
  }

  async function saveAddress(addr) {
    const res = await apiClient.put('/settings', {
      latitude: addr.latitude,
      longitude: addr.longitude,
      addressLabel: addr.label,
    });
    setLoaded({ ...loaded, ...res.data });
    if (refreshUser) refreshUser(); // so the Dashboard map picks up the new location
    return res.data.addressLabel;
  }

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

      <AddressField
        initialLabel={loaded.addressLabel}
        onSave={saveAddress}
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