import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

/**
 * MyNextAppointment — the logged-in user's upcoming booked slots.
 * Rendered on the Dashboard. When the user has more than one upcoming
 * appointment, it becomes a carousel: page through them with the
 * arrows / dots and cancel each one individually.
 *
 * Props:
 *   appointments — array of upcoming appointment objects (also tolerates a
 *                  single object or null for backwards compatibility)
 *   onChanged    — called after a successful cancel so the Dashboard refreshes
 */
export default function MyNextAppointment({ appointments, onChanged }) {
  // Normalise to an array so callers can pass an array, one object, or null.
  const list = Array.isArray(appointments)
    ? appointments
    : appointments
      ? [appointments]
      : [];

  const [index, setIndex] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  // Keep the index in range when the list shrinks (e.g. after a cancel).
  useEffect(() => {
    if (index > list.length - 1) setIndex(Math.max(0, list.length - 1));
  }, [list.length, index]);

  // Empty state — gentle, light card.
  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            {/* calendar icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">My Next Appointment</h2>
            <p className="text-sm text-gray-400">
              You have no upcoming appointments yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const idx = Math.min(index, list.length - 1);
  const appointment = list[idx];
  const multiple = list.length > 1;

  const start = new Date(appointment.startTime);
  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const timeStr = start.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const shopName = appointment.Barbershop?.name || 'Barbershop';
  const shopCity = appointment.Barbershop?.city || '';
  const shopAddress = appointment.Barbershop?.address || '';

  async function handleCancel(appt) {
    if (!window.confirm('Cancel this appointment? The slot will become available again.')) return;
    setCancellingId(appt.appointmentId);
    setError('');
    try {
      await apiClient.delete(`/appointments/${appt.appointmentId}/book`);
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Could not cancel. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-sm">
      <div className="p-6">
        {/* header: label + carousel navigation */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">
            {multiple ? 'My Appointments' : 'My Next Appointment'}
          </p>

          {multiple && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">{idx + 1} of {list.length}</span>
              <button
                type="button"
                aria-label="Previous appointment"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-white/90 hover:bg-white/10 disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next appointment"
                onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
                disabled={idx === list.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-white/90 hover:bg-white/10 disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* shop + cancel */}
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/90">
              {/* calendar icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold leading-tight">{shopName}</p>
              <p className="text-sm text-white/70">
                {shopCity}{shopAddress ? ` · ${shopAddress}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCancel(appointment)}
            disabled={cancellingId === appointment.appointmentId}
            className="shrink-0 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90
                       hover:bg-white/10 disabled:opacity-50"
          >
            {cancellingId === appointment.appointmentId ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>

        {/* date / time row */}
        <div className="mt-5 flex items-center gap-6 border-t border-white/10 pt-4 text-sm">
          <span className="flex items-center gap-2 text-white/90">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {dateStr}
          </span>
          <span className="flex items-center gap-2 text-white/90">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {timeStr}
          </span>
        </div>

        {/* carousel dots */}
        {multiple && (
          <div className="mt-4 flex items-center gap-1.5">
            {list.map((appt, i) => (
              <button
                key={appt.appointmentId}
                type="button"
                aria-label={`Go to appointment ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
      </div>
    </div>
  );
}
