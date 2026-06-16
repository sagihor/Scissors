import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../services/AuthContext';
import BarbershopCard from '../components/BarbershopCard';
import BarbershopTable from '../components/BarbershopTable';
import Chat from '../components/Chat';
import AiRecommender from '../components/AiRecommender';
import SearchFilters from '../components/SearchFilters';
import MyNextAppointment from '../components/MyNextAppointment';
import BarbershopMap from '../components/BarbershopMap';
import MapFilters from '../components/MapFilters';

export default function Dashboard() {
  const { effectiveLocation } = useAuth();

  // ---- All Barbershops table (existing feature) ----
  const [barbershops, setBarbershops] = useState(null);
  const [error, setError] = useState('');
  const [allCities, setAllCities] = useState([]);
  const [tableApplied, setTableApplied] = useState(false); // default: table hidden

  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availFrom, setAvailFrom] = useState('');
  const [availTo, setAvailTo] = useState('');

  // ---- My next appointment ----
  const [myAppointment, setMyAppointment] = useState(null);

  // ---- Map section (its own filters; default shows NO shops) ----
  const [mapShops, setMapShops] = useState([]);     // shops plotted on the map
  const [mapApplied, setMapApplied] = useState(false); // has the user filtered yet?
  const [mapCity, setMapCity] = useState('');
  const [mapMinRating, setMapMinRating] = useState('');
  const [mapMaxDistance, setMapMaxDistance] = useState('');

  const hasUserLocation = !!(effectiveLocation && effectiveLocation.latitude != null);

  // Build query string for the All Barbershops table
  const buildTableQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minRating) params.set('minRating', minRating);
    if (availFrom) params.set('availFrom', new Date(availFrom).toISOString());
    if (availTo) params.set('availTo', new Date(availTo).toISOString());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [city, minRating, availFrom, availTo]);

  // Load (and reload) the data whenever table filters change. This always runs
  // so Top Rated and the city dropdown have data; the TABLE itself is only
  // shown after the user applies a filter or clicks "Show all".
  useEffect(() => {
    apiClient
      .get(`/barbershops${buildTableQuery()}`)
      .then((res) => {
        setBarbershops(res.data);
        setAllCities((prev) => (prev.length ? prev : [...new Set(res.data.map((s) => s.city))].sort()));
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data.');
        setBarbershops([]);
      });
  }, [buildTableQuery]);

  // Load the user's next appointment
  const loadMyAppointment = useCallback(() => {
    apiClient
      .get('/appointments/me')
      .then((res) => setMyAppointment(res.data))
      .catch(() => setMyAppointment(null));
  }, []);
  useEffect(() => { loadMyAppointment(); }, [loadMyAppointment]);

  function applyTableFilters() {
    setTableApplied(true); // reveal the table with whatever filters are set
  }
  function showAllTable() {
    setCity(''); setMinRating(''); setAvailFrom(''); setAvailTo('');
    setTableApplied(true);
  }
  function clearTableFilters() {
    setCity(''); setMinRating(''); setAvailFrom(''); setAvailTo('');
    setTableApplied(false); // back to default hidden state
  }

  // ---- Map data loading ----
  const fetchMapShops = useCallback(async (opts) => {
    const params = new URLSearchParams();
    if (opts.city) params.set('city', opts.city);
    if (opts.minRating) params.set('minRating', opts.minRating);
    if (opts.maxDistanceKm && hasUserLocation) {
      params.set('lat', effectiveLocation.latitude);
      params.set('lng', effectiveLocation.longitude);
      params.set('maxDistanceKm', opts.maxDistanceKm);
    } else if (hasUserLocation) {
      // still pass location so the response includes distanceKm + nearest sort
      params.set('lat', effectiveLocation.latitude);
      params.set('lng', effectiveLocation.longitude);
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/barbershops${qs}`);
    setMapShops(res.data);
    setMapApplied(true);
  }, [effectiveLocation, hasUserLocation]);

  function applyMapFilters() {
    fetchMapShops({ city: mapCity, minRating: mapMinRating, maxDistanceKm: mapMaxDistance });
  }
  function showAllOnMap() {
    setMapCity(''); setMapMinRating(''); setMapMaxDistance('');
    fetchMapShops({}); // no filters -> all shops (with distance if location known)
  }
  function clearMap() {
    setMapCity(''); setMapMinRating(''); setMapMaxDistance('');
    setMapShops([]);
    setMapApplied(false); // back to default empty state
  }

  // Re-apply map filters automatically whenever a filter value changes,
  // but only after the user has interacted at least once.
  useEffect(() => {
    if (!mapApplied) return;
    fetchMapShops({ city: mapCity, minRating: mapMinRating, maxDistanceKm: mapMaxDistance });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCity, mapMinRating, mapMaxDistance]);

  // When a shop's "Book" is clicked on the map, scroll to the table.
  function handleMapBook() {
    const el = document.getElementById('all-barbershops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  const topThree = useMemo(() => {
    if (!barbershops) return null;
    return [...barbershops].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  }, [barbershops]);

  const availFromIso = availFrom ? new Date(availFrom).toISOString() : '';
  const availToIso = availTo ? new Date(availTo).toISOString() : '';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
      )}

      {/* AI Recommender */}
      <section className="mb-10">
        <AiRecommender />
      </section>

      {/* Map + map filters (below AI, above My Next Appointment) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Find Barbershops on the Map</h2>
        <p className="text-sm text-gray-500 mb-4">
          Filter by city, rating, or distance from your location. Use “Show all” to see every shop.
          {!hasUserLocation && ' Set your address in Settings to enable distance filtering.'}
        </p>

        <MapFilters
          cities={allCities}
          city={mapCity} setCity={setMapCity}
          minRating={mapMinRating} setMinRating={setMapMinRating}
          maxDistanceKm={mapMaxDistance} setMaxDistanceKm={setMapMaxDistance}
          onShowAll={showAllOnMap}
          onClear={clearMap}
          hasUserLocation={hasUserLocation}
        />

        {/* Apply button for the city/rating/distance combo */}
        <div className="mb-4">
          <button
            onClick={applyMapFilters}
            className="px-3 py-2 rounded border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Apply filters
          </button>
        </div>

        <BarbershopMap
          shops={mapApplied ? mapShops : []}
          userLocation={effectiveLocation}
          onBook={handleMapBook}
        />

        {!mapApplied ? (
          <p className="text-sm text-gray-500 mt-3">
            No barbershops shown yet. Apply a filter or click “Show all”.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            Showing {mapShops.length} barbershop{mapShops.length === 1 ? '' : 's'} on the map.
          </p>
        )}
      </section>

      {/* My Next Appointment */}
      <section className="mb-10">
        <MyNextAppointment appointment={myAppointment} onChanged={loadMyAppointment} />
      </section>

      {/* Top Rated */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Top Rated Barbershops</h2>
        <p className="text-sm text-gray-500 mb-4">Our three highest-rated shops, based on customer reviews.</p>

        {topThree === null ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">Loading barbershops…</div>
        ) : topThree.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">No barbershops to display.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topThree.map((shop) => (
              <BarbershopCard key={shop.barbershopId} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* All Barbershops (existing filters) — table hidden by default */}
      <section id="all-barbershops">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">All Barbershops</h2>
        <p className="text-sm text-gray-500 mb-4">
          Use the filters and click “Apply”, or “Show all” to list every shop.
          {tableApplied && barbershops ? ` ${barbershops.length} shops listed.` : ''}
        </p>

        <SearchFilters
          cities={allCities}
          city={city} setCity={setCity}
          minRating={minRating} setMinRating={setMinRating}
          availFrom={availFrom} setAvailFrom={setAvailFrom}
          availTo={availTo} setAvailTo={setAvailTo}
          onClear={clearTableFilters}
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={applyTableFilters}
            className="px-3 py-2 rounded border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Apply filters
          </button>
          <button
            onClick={showAllTable}
            className="px-3 py-2 rounded bg-gray-900 text-white text-sm font-medium hover:bg-gray-700"
          >
            Show all
          </button>
        </div>

        {!tableApplied ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            No barbershops shown yet. Apply a filter or click “Show all”.
          </div>
        ) : barbershops === null ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">Loading data…</div>
        ) : (
          <BarbershopTable
            shops={barbershops}
            availFrom={availFromIso}
            availTo={availToIso}
            onBooked={() => loadMyAppointment()}
          />
        )}
      </section>

      {/* Live Chat */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Community Chat</h2>
        <p className="text-sm text-gray-500 mb-4">Real-time chat between everyone currently online.</p>
        <Chat />
      </section>
    </div>
  );
}