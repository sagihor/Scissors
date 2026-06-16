import { useState } from 'react';
import apiClient from '../services/apiClient';

/**
 * MyNextAppointment — the logged-in user's next upcoming booked slot.
 * Rendered on the Dashboard. Allows cancelling, which frees the slot in the DB.
 *
 * Props:
 *   appointment  — the next appointment object (or null)
 *   onChanged    — called after a successful cancel so the Dashboard refreshes
 */
export default function MyNextAppointment({ appointment, onChanged }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  // Empty state — gentle, light card.
  if (!appointment) {
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

  async function handleCancel() {
    if (!window.confirm('Cancel this appointment? The slot will become available again.')) return;
    setCancelling(true);
    setError('');
    try {
      await apiClient.delete(`/appointments/${appointment.appointmentId}/book`);
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Could not cancel. Please try again.');
      setCancelling(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/90">
              {/* calendar icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                My Next Appointment
              </p>
              <p className="mt-1 text-lg font-semibold leading-tight">{shopName}</p>
              <p className="text-sm text-white/70">
                {shopCity}{shopAddress ? ` · ${shopAddress}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="shrink-0 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90
                       hover:bg-white/10 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Cancel'}
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

        {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
      </div>
    </div>
  );
}