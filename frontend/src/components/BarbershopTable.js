import { Fragment, useState } from 'react';
import apiClient from '../services/apiClient';

// Slots are plain "YYYY-MM-DD HH:00:00" wall-clock strings. We parse with
// explicit local components (never new Date(isoString)) so there is no TZ shift.
function parseSlot(s) {
  const [datePart, timePart] = String(s).split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':');
  return new Date(y, m - 1, d, Number(hh), Number(mm || 0));
}
function dayKey(s) {
  return String(s).split(' ')[0]; // "YYYY-MM-DD"
}
function dayLabel(s) {
  return parseSlot(s).toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  });
}
function hourLabel(s) {
  return parseSlot(s).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
// Group an array of slot objects into ordered days.
function groupByDay(slots) {
  const map = new Map();
  for (const slot of slots) {
    const k = dayKey(slot.startTime);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(slot);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, items]) => ({ day: k, label: dayLabel(items[0].startTime), slots: items }));
}

export default function BarbershopTable({ shops, availFrom, availTo, onBooked }) {
  const [openShopId, setOpenShopId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [bookingKey, setBookingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"

  const [openInfoShopId, setOpenInfoShopId] = useState(null);
  const [info, setInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState('');

  if (!shops || shops.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        No barbershops to display.
      </div>
    );
  }

  async function toggleBook(shopId) {
    if (openShopId === shopId) {
      setOpenShopId(null);
      setSelectedDay(null);
      return;
    }
    setOpenShopId(shopId);
    setSelectedDay(null);
    setSlots([]);
    setSlotsError('');
    setSlotsLoading(true);
    try {
      const params = new URLSearchParams();
      if (availFrom) params.set('from', availFrom);
      if (availTo) params.set('to', availTo);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.get(`/appointments/available/${shopId}${qs}`);
      const data = res.data || [];
      setSlots(data);
      const days = groupByDay(data);
      if (days.length > 0) setSelectedDay(days[0].day); // preselect first day
    } catch (err) {
      setSlotsError(err.message || 'Could not load available times.');
    } finally {
      setSlotsLoading(false);
    }
  }

  async function toggleInfo(shopId) {
    if (openInfoShopId === shopId) {
      setOpenInfoShopId(null);
      return;
    }
    setOpenInfoShopId(shopId);
    setInfo(null);
    setInfoError('');
    setInfoLoading(true);
    try {
      const res = await apiClient.get(`/barbershops/${shopId}/barbers`);
      setInfo(res.data);
    } catch (err) {
      setInfoError(err.message || 'Could not load shop details.');
    } finally {
      setInfoLoading(false);
    }
  }

  async function confirmSlot(slot) {
    setBookingKey(slot.startTime);
    setSuccessMsg('');
    try {
      const res = await apiClient.post('/appointments/book', {
        barbershopId: slot.barbershopId,
        startTime: slot.startTime,
      });
      // Remove the booked slot locally so it disappears immediately.
      setSlots((prev) => prev.filter((s) => s.startTime !== slot.startTime));
      if (onBooked) onBooked(res.data);
      const shopName = res.data?.Barbershop?.name || 'the barbershop';
      setSuccessMsg(`Appointment confirmed at ${shopName} — ${dayLabel(slot.startTime)}, ${hourLabel(slot.startTime)}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setSlotsError(err.message || 'Could not book this slot. It may have just been taken.');
    } finally {
      setBookingKey(null);
    }
  }

  const days = groupByDay(slots);
  const activeDay = days.find((d) => d.day === selectedDay) || days[0];

  return (
    <div>
      {successMsg && (
        <div className="mb-3 bg-green-50 border border-green-300 text-green-800 px-4 py-2 rounded text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shops.map((shop) => (
              <Fragment key={shop.barbershopId}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{shop.barbershopId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <button
                      type="button"
                      onClick={() => toggleInfo(shop.barbershopId)}
                      className="group inline-flex items-center gap-1 text-left font-medium text-gray-900 hover:text-gray-600"
                      title="Show barbers & services"
                    >
                      <span className="underline decoration-dotted underline-offset-2 group-hover:decoration-solid">
                        {shop.name}
                      </span>
                      <svg
                        className={`h-3.5 w-3.5 text-gray-400 transition-transform ${openInfoShopId === shop.barbershopId ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{shop.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{shop.address}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="font-semibold tabular-nums">{shop.rating?.toFixed(1) ?? '—'}</span>
                    <span className="text-gray-500 ml-1">({shop.reviewCount ?? 0})</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleBook(shop.barbershopId)}
                      className="px-3 py-1 rounded bg-gray-900 text-white text-xs font-medium hover:bg-gray-700"
                    >
                      {openShopId === shop.barbershopId ? 'Close' : 'Book'}
                    </button>
                  </td>
                </tr>

                {openInfoShopId === shop.barbershopId && (
                  <tr className="bg-gray-50/70">
                    <td colSpan={6} className="px-4 py-5">
                      {infoLoading ? (
                        <p className="text-sm text-gray-500">Loading shop details…</p>
                      ) : infoError ? (
                        <p className="text-sm text-red-600">{infoError}</p>
                      ) : info ? (
                        <div className="mx-auto max-w-3xl grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* Barbers card */}
                          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              </svg>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Barbers</h4>
                            </div>
                            {info.barbers && info.barbers.length > 0 ? (
                              <ul className="space-y-2">
                                {info.barbers.map((b) => (
                                  <li key={b.userId} className="flex items-center gap-3 text-sm text-gray-800">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                                      {`${b.firstName?.[0] || ''}${b.lastName?.[0] || ''}`.toUpperCase()}
                                    </span>
                                    <span>{b.firstName} {b.lastName}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400">No barbers listed.</p>
                            )}
                          </div>

                          {/* Services card */}
                          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                              </svg>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Services</h4>
                            </div>
                            {info.Services && info.Services.length > 0 ? (
                              <ul className="space-y-1">
                                {info.Services.map((s) => (
                                  <li key={s.serviceId} className="flex items-baseline justify-between gap-3 border-b border-gray-100 py-1.5 last:border-0 text-sm">
                                    <span className="text-gray-800">{s.name}</span>
                                    <span className="shrink-0 font-semibold text-gray-900 tabular-nums">₪{s.price}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400">No services listed.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )}

                {openShopId === shop.barbershopId && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-800 mb-3">
                        Pick a day — {shop.name}
                      </p>

                      {slotsLoading ? (
                        <p className="text-sm text-gray-500">Loading available times…</p>
                      ) : slotsError ? (
                        <p className="text-sm text-red-600">{slotsError}</p>
                      ) : days.length === 0 ? (
                        <p className="text-sm text-gray-500">No free slots in this range.</p>
                      ) : (
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
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                Available times — {activeDay.label}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {activeDay.slots.map((slot) => (
                                  <button
                                    key={slot.startTime}
                                    onClick={() => confirmSlot(slot)}
                                    disabled={bookingKey === slot.startTime}
                                    className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-800 hover:border-gray-900 hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    {bookingKey === slot.startTime ? 'Booking…' : hourLabel(slot.startTime)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}