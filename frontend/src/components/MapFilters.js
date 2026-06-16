/**
 * MapFilters — controls for the map section: city, minimum rating, and
 * maximum distance from the user. Includes "Show all" (ignore filters) and
 * "Clear" (back to the default empty state).
 */
export default function MapFilters({
  cities,
  city, setCity,
  minRating, setMinRating,
  maxDistanceKm, setMaxDistanceKm,
  onShowAll, onClear,
  hasUserLocation,
}) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Min rating</label>
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Max distance (km)
        </label>
        <input
          type="number"
          min="0"
          step="1"
          value={maxDistanceKm}
          onChange={(e) => setMaxDistanceKm(e.target.value)}
          placeholder={hasUserLocation ? 'e.g. 10' : 'set address first'}
          disabled={!hasUserLocation}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
        />
      </div>

      <button
        onClick={onShowAll}
        className="px-3 py-2 rounded bg-gray-900 text-white text-sm font-medium hover:bg-gray-700"
      >
        Show all
      </button>

      <button
        onClick={onClear}
        className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
      >
        Clear
      </button>
    </div>
  );
}