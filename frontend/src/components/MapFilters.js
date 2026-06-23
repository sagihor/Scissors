/**
 * MapFilters — "appointment finder" controls for the map section, styled like a
 * ride-hailing request: pick WHEN you want an appointment, how far you'll go,
 * and (optionally) narrow by city / rating. "Show all" ignores every filter,
 * "Clear" resets back to the default empty state.
 */
const WHEN_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: '1h', label: 'Next 1 hour' },
  { value: '2h', label: 'Next 2 hours' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'custom', label: 'Pick dates' },
];

export default function MapFilters({
  cities,
  when, setWhen,
  customFrom, setCustomFrom,
  customTo, setCustomTo,
  city, setCity,
  minRating, setMinRating,
  maxDistanceKm, setMaxDistanceKm,
  onApply, onShowAll, onClear,
  hasUserLocation,
}) {
  return (
    <div className="bg-white shadow rounded-lg p-5 mb-4">
      {/* When — quick appointment-time chips */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          When do you want an appointment?
        </label>
        <div className="flex flex-wrap gap-2">
          {WHEN_OPTIONS.map((opt) => {
            const active = when === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWhen(opt.value)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {when === 'custom' && (
          <div className="mt-3 flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From date</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To date</label>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Distance + optional narrowing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max distance (km)</label>
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

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            City <span className="text-gray-400 font-normal">(optional)</span>
          </label>
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
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Min rating <span className="text-gray-400 font-normal">(optional)</span>
          </label>
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
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onApply}
          className="px-4 py-2 rounded bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700"
        >
          Find appointments
        </button>
        <button
          onClick={onShowAll}
          className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Show all
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
