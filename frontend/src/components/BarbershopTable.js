import { useState } from 'react';
import apiClient from '../services/apiClient';

export default function BarbershopTable({ shops, availFrom, availTo, onBooked }) {
  // Which shop row is currently expanded to show its slots
  const [openShopId, setOpenShopId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!shops || shops.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        No barbershops to display.
      </div>
    );
  }

  function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d) ? '-' : d.toLocaleDateString('en-US');
  }

  function formatSlot(iso) {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      weekday: 'short', day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  async function toggleBook(shopId) {
    if (openShopId === shopId) {
      setOpenShopId(null);
      return;
    }
    setOpenShopId(shopId);
    setSlots([]);
    setSlotsError('');
    setSlotsLoading(true);
    try {
      // Respect the active availability range filter, if any
      const params = new URLSearchParams();
      if (availFrom) params.set('from', availFrom);
      if (availTo) params.set('to', availTo);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.get(`/appointments/available/${shopId}${qs}`);
      setSlots(res.data || []);
    } catch (err) {
      setSlotsError(err.message || 'Could not load available times.');
    } finally {
      setSlotsLoading(false);
    }
  }

  async function confirmSlot(slot) {
    setBookingId(slot.appointmentId);
    setSuccessMsg('');
    try {
      const res = await apiClient.post(`/appointments/${slot.appointmentId}/book`);
      // Remove the now-booked slot from the list
      setSlots((prev) => prev.filter((s) => s.appointmentId !== slot.appointmentId));
      if (onBooked) onBooked(res.data); // let Dashboard refresh "my next appointment"
      setOpenShopId(null);

      // Small green confirmation, auto-dismiss after 4s
      const shopName = res.data?.Barbershop?.name || 'the barbershop';
      const when = new Date(res.data.startTime).toLocaleString('en-US', {
        weekday: 'short', day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      });
      setSuccessMsg(`Appointment confirmed at ${shopName} — ${when}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setSlotsError(err.message || 'Could not book this slot. It may have just been taken.');
    } finally {
      setBookingId(null);
    }
  }

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
              <>
                <tr key={shop.barbershopId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{shop.barbershopId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{shop.name}</td>
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

                {openShopId === shop.barbershopId && (
                  <tr key={`slots-${shop.barbershopId}`} className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Next available times — {shop.name}
                      </p>

                      {slotsLoading ? (
                        <p className="text-sm text-gray-500">Loading available times…</p>
                      ) : slotsError ? (
                        <p className="text-sm text-red-600">{slotsError}</p>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-gray-500">No free slots in this range.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <button
                              key={slot.appointmentId}
                              onClick={() => confirmSlot(slot)}
                              disabled={bookingId === slot.appointmentId}
                              className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-800 hover:border-gray-900 hover:bg-gray-100 disabled:opacity-50"
                            >
                              {bookingId === slot.appointmentId ? 'Booking…' : formatSlot(slot.startTime)}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}