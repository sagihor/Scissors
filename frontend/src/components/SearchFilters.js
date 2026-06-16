/**
 * SearchFilters — city, minimum rating, and availability date-range filters
 * for the barbershop list. Lifts state up to the Dashboard via props.
 */
export default function SearchFilters({
  cities, city, setCity,
  minRating, setMinRating,
  availFrom, setAvailFrom,
  availTo, setAvailTo,
  onClear,
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
        <label className="block text-xs font-medium text-gray-600 mb-1">Available from</label>
        <input
          type="datetime-local"
          value={availFrom}
          onChange={(e) => setAvailFrom(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Available to</label>
        <input
          type="datetime-local"
          value={availTo}
          onChange={(e) => setAvailTo(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <button
        onClick={onClear}
        className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
      >
        Clear filters
      </button>
    </div>
  );
}