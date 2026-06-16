import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';
import BarbershopCard from '../components/BarbershopCard';
import BarbershopTable from '../components/BarbershopTable';
import Chat from '../components/Chat';
import AiRecommender from '../components/AiRecommender';
import SearchFilters from '../components/SearchFilters';
import MyNextAppointment from '../components/MyNextAppointment';

export default function Dashboard() {
  const [barbershops, setBarbershops] = useState(null);
  const [error, setError] = useState('');
  const [myAppointment, setMyAppointment] = useState(null);

  // Filter state
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availFrom, setAvailFrom] = useState('');
  const [availTo, setAvailTo] = useState('');

  // Distinct city list for the dropdown (kept from a full unfiltered load)
  const [allCities, setAllCities] = useState([]);

  // Build the query string from the active filters
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minRating) params.set('minRating', minRating);
    if (availFrom) params.set('availFrom', new Date(availFrom).toISOString());
    if (availTo) params.set('availTo', new Date(availTo).toISOString());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [city, minRating, availFrom, availTo]);

  // Load (and reload) the list whenever filters change
  useEffect(() => {
    apiClient
      .get(`/barbershops${buildQuery()}`)
      .then((res) => {
        setBarbershops(res.data);
        // Seed the city dropdown once, from the first load
        setAllCities((prev) => {
          if (prev.length) return prev;
          return [...new Set(res.data.map((s) => s.city))].sort();
        });
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data.');
        setBarbershops([]);
      });
  }, [buildQuery]);

  // Load the user's next appointment on mount
  const loadMyAppointment = useCallback(() => {
    apiClient
      .get('/appointments/me')
      .then((res) => setMyAppointment(res.data))
      .catch(() => setMyAppointment(null));
  }, []);

  useEffect(() => {
    loadMyAppointment();
  }, [loadMyAppointment]);

  function clearFilters() {
    setCity('');
    setMinRating('');
    setAvailFrom('');
    setAvailTo('');
  }

  // Top 3 by rating, descending
  const topThree = useMemo(() => {
    if (!barbershops) return null;
    return [...barbershops].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  }, [barbershops]);

  // ISO versions passed to the table so its slot fetch respects the range filter
  const availFromIso = availFrom ? new Date(availFrom).toISOString() : '';
  const availToIso = availTo ? new Date(availTo).toISOString() : '';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Section: AI Recommender */}
      <section className="mb-10">
        <AiRecommender />
      </section>

      {/* Section: My Next Appointment (between AI and Top Rated) */}
      <section className="mb-10">
        <MyNextAppointment appointment={myAppointment} />
      </section>

      {/* Section 1: Featured cards (top 3 by rating) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Top Rated Barbershops</h2>
        <p className="text-sm text-gray-500 mb-4">
          Our three highest-rated shops, based on customer reviews.
        </p>

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

      {/* Section 2: Search + filters + full table */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">All Barbershops</h2>
        <p className="text-sm text-gray-500 mb-4">
          {barbershops ? `${barbershops.length} shops listed.` : 'Loading…'}
        </p>

        <SearchFilters
          cities={allCities}
          city={city} setCity={setCity}
          minRating={minRating} setMinRating={setMinRating}
          availFrom={availFrom} setAvailFrom={setAvailFrom}
          availTo={availTo} setAvailTo={setAvailTo}
          onClear={clearFilters}
        />

        {barbershops === null ? (
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

      {/* Section 3: Live Chat */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Community Chat</h2>
        <p className="text-sm text-gray-500 mb-4">
          Real-time chat between everyone currently online.
        </p>
        <Chat />
      </section>
    </div>
  );
}