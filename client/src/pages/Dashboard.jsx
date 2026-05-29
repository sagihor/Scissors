import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import BarbershopCard from '../components/BarbershopCard';
import BarbershopTable from '../components/BarbershopTable';

export default function Dashboard() {
  const [barbershops, setBarbershops] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get('/barbershops')
      .then((res) => setBarbershops(res.data))
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data.');
        setBarbershops([]);
      });
  }, []);

  // Top 3 by rating, descending. Returns null while loading.
  const topThree = barbershops
    ? [...barbershops]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 3)
    : null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        /* THEME: error banner */
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Section 1: Featured cards (top 3 by rating) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Top Rated Barbershops</h2>
        <p className="text-sm text-gray-500 mb-4">
          Our three highest-rated shops, based on customer reviews.
        </p>

        {topThree === null ? (
          /* THEME: loading state */
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            Loading barbershops…
          </div>
        ) : topThree.length === 0 ? (
          /* THEME: empty state */
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            No barbershops to display.
          </div>
        ) : (
          /* THEME: card grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topThree.map((shop) => (
              <BarbershopCard key={shop.barbershopId} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Full data table */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">All Barbershops</h2>
        <p className="text-sm text-gray-500 mb-4">
          {barbershops ? `${barbershops.length} shops listed.` : 'Loading…'}
        </p>

        {barbershops === null ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            Loading data…
          </div>
        ) : (
          <BarbershopTable shops={barbershops} />
        )}
      </section>
    </div>
  );
}