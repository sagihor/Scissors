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

// Translate the "when" choice into an availability window [from, to].
// Returns Date objects (or {} for "no time filter").
function computeWindow(when, customFrom, customTo) {
  const now = new Date();
  switch (when) {
    case '1h':
      return { from: now, to: new Date(now.getTime() + 60 * 60 * 1000) };
    case '2h':
      return { from: now, to: new Date(now.getTime() + 2 * 60 * 60 * 1000) };
    case 'today': {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { from: now, to: end };
    }
    case 'tomorrow': {
      const start = new Date(now);
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'custom': {
      if (!customFrom) return {};
      const start = new Date(customFrom);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customTo || customFrom);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    default:
      return {};
  }
}

function formatSlot(s) {
  const [datePart, timePart] = String(s).split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':');
  const local = new Date(y, m - 1, d, Number(hh), Number(mm || 0));
  return local.toLocaleString('en-US', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// Day-first picker helpers (wall-clock strings, no TZ conversion).
function parseSlotLocal(s) {
  const [datePart, timePart] = String(s).split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':');
  return new Date(y, m - 1, d, Number(hh), Number(mm || 0));
}
function slotDayKey(s) {
  return String(s).split(' ')[0];
}
function slotDayLabel(s) {
  return parseSlotLocal(s).toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  });
}
function slotHourLabel(s) {
  return parseSlotLocal(s).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
function groupSlotsByDay(slots) {
  const map = new Map();
  for (const slot of slots) {
    const k = slotDayKey(slot.startTime);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(slot);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, items]) => ({ day: k, label: slotDayLabel(items[0].startTime), slots: items }));
}

/**
 * MapShopModal — full-screen overlay shown when a map marker is clicked.
 * Displays the shop's name / address / phone and its free upcoming slots,
 * and lets the user book a slot without leaving the map.
 */
function MapShopModal({ shop, onClose, onBooked }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const loadSlots = useCallback(() => {
    setLoading(true);
    setError('');
    apiClient
      .get(`/appointments/available/${shop.barbershopId}`)
      .then((res) => {
        const data = res.data || [];
        setSlots(data);
        const days = groupSlotsByDay(data);
        if (days.length > 0) setSelectedDay(days[0].day);
      })
      .catch((err) => setError(err.message || 'Could not load available times.'))
      .finally(() => setLoading(false));
  }, [shop.barbershopId]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  async function book(slot) {
    setBookingId(slot.startTime);
    setError('');
    try {
      const res = await apiClient.post('/appointments/book', {
        barbershopId: slot.barbershopId,
        startTime: slot.startTime,
      });
      setSlots((prev) => prev.filter((s) => s.startTime !== slot.startTime));
      if (onBooked) onBooked(res.data);
      setSuccessMsg(`Appointment confirmed — ${slotDayLabel(slot.startTime)}, ${slotHourLabel(slot.startTime)}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not book this slot. It may have just been taken.');
    } finally {
      setBookingId(null);
    }
  }

  const addressLine = [shop.address, shop.city].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
            {addressLine && <p className="mt-0.5 text-sm text-gray-600">{addressLine}</p>}
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {shop.phone}
              </a>
            )}
            {shop.rating != null && (
              <p className="mt-1 text-sm text-gray-500">
                ★ {shop.rating.toFixed(1)} ({shop.reviewCount || 0} review{shop.reviewCount === 1 ? '' : 's'})
                {shop.distanceKm != null ? ` · ${shop.distanceKm} km away` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {successMsg && (
            <div className="mb-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
              ✓ {successMsg}
            </div>
          )}

          <p className="mb-2 text-sm font-semibold text-gray-800">Pick a day</p>

          {loading ? (
            <p className="text-sm text-gray-500">Loading available times…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-500">No free slots right now.</p>
          ) : (
            (() => {
              const days = groupSlotsByDay(slots);
              const activeDay = days.find((d) => d.day === selectedDay) || days[0];
              return (
                <div>
                  {/* Step 1: day chips */}
                  <div className="flex flex-wrap gap-2">
                    {days.map((d) => (
                      <button
                        key={d.day}
                        onClick={() => setSelectedDay(d.day)}
                        className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                          activeDay && activeDay.day === d.day
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-gray-900'
                        }`}
                      >
                        {d.label}
                        <span className={`ml-1.5 text-xs ${activeDay && activeDay.day === d.day ? 'text-white/70' : 'text-gray-400'}`}>
                          {d.slots.length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Step 2: hours for the selected day */}
                  {activeDay && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Available times — {activeDay.label}
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {activeDay.slots.map((slot) => (
                          <button
                            key={slot.startTime}
                            onClick={() => book(slot)}
                            disabled={bookingId === slot.startTime}
                            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:border-gray-900 hover:bg-gray-100 disabled:opacity-50"
                          >
                            {bookingId === slot.startTime ? '…' : slotHourLabel(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

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

  // ---- My upcoming appointments ----
  const [myAppointments, setMyAppointments] = useState([]);

  // ---- Map section (its own filters; default shows NO shops) ----
  const [mapShops, setMapShops] = useState([]);     // shops plotted on the map
  const [mapApplied, setMapApplied] = useState(false); // has the user filtered yet?
  const [mapCity, setMapCity] = useState('');
  const [mapMinRating, setMapMinRating] = useState('');
  const [mapMaxDistance, setMapMaxDistance] = useState('');
  const [mapWhen, setMapWhen] = useState('any'); // 'any'|'1h'|'2h'|'today'|'tomorrow'|'custom'
  const [mapCustomFrom, setMapCustomFrom] = useState('');
  const [mapCustomTo, setMapCustomTo] = useState('');
  const [selectedShop, setSelectedShop] = useState(null); // shop whose modal is open

  const hasUserLocation = !!(effectiveLocation && effectiveLocation.latitude != null);

  // Build query string for the All Barbershops table
  const buildTableQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minRating) params.set('minRating', minRating);
    // Pass dates as bare YYYY-MM-DD (the date inputs' native format). The
    // backend treats availFrom as start-of-day and availTo as end-of-day, so
    // the whole "to" day is included. Sending a UTC ISO timestamp here would
    // chop the last day off in +offset timezones.
    if (availFrom) params.set('availFrom', availFrom);
    if (availTo) params.set('availTo', availTo);
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

  // Load all of the user's upcoming appointments
  const loadMyAppointments = useCallback(() => {
    apiClient
      .get('/appointments/mine')
      .then((res) => setMyAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMyAppointments([]));
  }, []);
  useEffect(() => { loadMyAppointments(); }, [loadMyAppointments]);

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
    if (opts.availFrom) params.set('availFrom', opts.availFrom);
    if (opts.availTo) params.set('availTo', opts.availTo);
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
    const { from, to } = computeWindow(mapWhen, mapCustomFrom, mapCustomTo);
    fetchMapShops({
      city: mapCity,
      minRating: mapMinRating,
      maxDistanceKm: mapMaxDistance,
      availFrom: from ? from.toISOString() : '',
      availTo: to ? to.toISOString() : '',
    });
  }
  function showAllOnMap() {
    setMapCity(''); setMapMinRating(''); setMapMaxDistance('');
    setMapWhen('any'); setMapCustomFrom(''); setMapCustomTo('');
    fetchMapShops({}); // no filters -> all shops (with distance if location known)
  }
  function clearMap() {
    setMapCity(''); setMapMinRating(''); setMapMaxDistance('');
    setMapWhen('any'); setMapCustomFrom(''); setMapCustomTo('');
    setMapShops([]);
    setMapApplied(false); // back to default empty state
  }

  // Re-apply map filters automatically whenever a filter value changes,
  // but only after the user has interacted at least once.
  useEffect(() => {
    if (!mapApplied) return;
    const { from, to } = computeWindow(mapWhen, mapCustomFrom, mapCustomTo);
    fetchMapShops({
      city: mapCity,
      minRating: mapMinRating,
      maxDistanceKm: mapMaxDistance,
      availFrom: from ? from.toISOString() : '',
      availTo: to ? to.toISOString() : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCity, mapMinRating, mapMaxDistance, mapWhen, mapCustomFrom, mapCustomTo]);

  const topThree = useMemo(() => {
    if (!barbershops) return null;
    return [...barbershops].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  }, [barbershops]);

  // Bare YYYY-MM-DD (date-input format). The backend applies start-of-day /
  // end-of-day so the full range — including the final day — is covered.
  const availFromIso = availFrom || '';
  const availToIso = availTo || '';

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
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Get the Nearest Appointment</h2>
        <p className="text-sm text-gray-500 mb-4">
          Tell us when you want a haircut and how far you'll travel — we'll find barbershops
          with open slots near you, sorted by distance. Use “Show all” to see every shop.
          {!hasUserLocation && ' Set your address in Settings to enable distance sorting.'}
        </p>

        <MapFilters
          cities={allCities}
          when={mapWhen} setWhen={setMapWhen}
          customFrom={mapCustomFrom} setCustomFrom={setMapCustomFrom}
          customTo={mapCustomTo} setCustomTo={setMapCustomTo}
          city={mapCity} setCity={setMapCity}
          minRating={mapMinRating} setMinRating={setMapMinRating}
          maxDistanceKm={mapMaxDistance} setMaxDistanceKm={setMapMaxDistance}
          onApply={applyMapFilters}
          onShowAll={showAllOnMap}
          onClear={clearMap}
          hasUserLocation={hasUserLocation}
        />

        <BarbershopMap
          shops={mapApplied ? mapShops : []}
          userLocation={effectiveLocation}
          onSelectShop={setSelectedShop}
        />

        {!mapApplied ? (
          <p className="text-sm text-gray-500 mt-3">
            No barbershops shown yet. Pick a time and click “Find appointments”, or “Show all”.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            Showing {mapShops.length} barbershop{mapShops.length === 1 ? '' : 's'} on the map.
          </p>
        )}
      </section>

      {/* My Next Appointment */}
      <section className="mb-10">
        <MyNextAppointment appointments={myAppointments} onChanged={loadMyAppointments} />
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
            onBooked={() => loadMyAppointments()}
          />
        )}
      </section>

      {/* Live Chat */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Community Chat</h2>
        <p className="text-sm text-gray-500 mb-4">Real-time chat between everyone currently online.</p>
        <Chat />
      </section>

      {/* Map marker details + booking modal */}
      {selectedShop && (
        <MapShopModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onBooked={() => loadMyAppointments()}
        />
      )}
    </div>
  );
}