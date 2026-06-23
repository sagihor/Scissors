import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

/**
 * MyNextAppointment — the logged-in user's upcoming booked slots.
 * Carousel through them; each can be RESCHEDULED (UPDATE) or CANCELLED (DELETE).
 *
 * Props:
 *   appointments — array of upcoming appointment objects
 *   onChanged    — called after a successful change so the Dashboard refreshes
 */

// Slot strings are "YYYY-MM-DD HH:00:00". Parse to a local Date with no TZ shift.
function parseSlot(s) {
  const [datePart, timePart] = s.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':');
  return new Date(y, m - 1, d, Number(hh), Number(mm || 0));
}

function formatSlotShort(s) {
  return parseSlot(s).toLocaleString('en-US', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
function dayKeyOf(s) {
  return String(s).split(' ')[0];
}
function dayLabelOf(s) {
  return parseSlot(s).toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  });
}
function hourLabelOf(s) {
  return parseSlot(s).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
function groupByDay(slots) {
  const map = new Map();
  for (const slot of slots) {
    const k = dayKeyOf(slot.startTime);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(slot);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, items]) => ({ day: k, label: dayLabelOf(items[0].startTime), slots: items }));
}

export default function MyNextAppointment({ appointments, onChanged }) {
  const list = Array.isArray(appointments)
    ? appointments
    : appointments
      ? [appointments]
      : [];

  const [index, setIndex] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  // Reschedule state
  const [rescheduleOpenId, setRescheduleOpenId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [savingSlot, setSavingSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (index > list.length - 1) setIndex(Math.max(0, list.length - 1));
  }, [list.length, index]);

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">My Next Appointment</h2>
            <p className="text-sm text-gray-400">You have no upcoming appointments yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const idx = Math.min(index, list.length - 1);
  const appointment = list[idx];
  const multiple = list.length > 1;

  const start = parseSlot(appointment.startTime);
  const dateStr = start.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const shopName = appointment.Barbershop?.name || 'Barbershop';
  const shopCity = appointment.Barbershop?.city || '';
  const shopAddress = appointment.Barbershop?.address || '';

  async function handleCancel(appt) {
    if (!window.confirm('Cancel this appointment? The slot will become available again.')) return;
    setCancellingId(appt.appointmentId);
    setError('');
    try {
      await apiClient.delete(`/appointments/${appt.appointmentId}`); // DELETE
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Could not cancel. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }

  async function openReschedule(appt) {
    if (rescheduleOpenId === appt.appointmentId) {
      setRescheduleOpenId(null);
      return;
    }
    setRescheduleOpenId(appt.appointmentId);
    setSlots([]);
    setSelectedDay(null);
    setError('');
    setSlotsLoading(true);
    try {
      const shopId = appt.Barbershop?.barbershopId ?? appt.barbershopId;
      const res = await apiClient.get(`/appointments/available/${shopId}`);
      const data = res.data || [];
      setSlots(data);
      const days = groupByDay(data);
      if (days.length > 0) setSelectedDay(days[0].day);
    } catch (err) {
      setError(err.message || 'Could not load available times.');
    } finally {
      setSlotsLoading(false);
    }
  }

  async function doReschedule(appt, slot) {
    setSavingSlot(slot.startTime);
    setError('');
    try {
      await apiClient.put(`/appointments/${appt.appointmentId}`, { startTime: slot.startTime }); // UPDATE
      setRescheduleOpenId(null);
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Could not reschedule. The time may have just been taken.');
    } finally {
      setSavingSlot(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-sm">
      <div className="p-6">
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

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/90">
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

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => openReschedule(appointment)}
              className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10"
            >
              {rescheduleOpenId === appointment.appointmentId ? 'Close' : 'Reschedule'}
            </button>
            <button
              onClick={() => handleCancel(appointment)}
              disabled={cancellingId === appointment.appointmentId}
              className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 disabled:opacity-50"
            >
              {cancellingId === appointment.appointmentId ? 'Cancelling…' : 'Cancel'}
            </button>
          </div>
        </div>

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

        {/* Reschedule slot picker (day first, then hours) */}
        {rescheduleOpenId === appointment.appointmentId && (
          <div className="mt-4 rounded-lg border border-white/15 bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              Pick a new day
            </p>
            {slotsLoading ? (
              <p className="text-sm text-white/70">Loading available times…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-white/70">No other free times right now.</p>
            ) : (
              (() => {
                const days = groupByDay(slots);
                const activeDay = days.find((d) => d.day === selectedDay) || days[0];
                return (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {days.map((d) => (
                        <button
                          key={d.day}
                          onClick={() => setSelectedDay(d.day)}
                          className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            activeDay && activeDay.day === d.day
                              ? 'border-white bg-white text-gray-900'
                              : 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    {activeDay && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/60">
                          {activeDay.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activeDay.slots.map((slot) => (
                            <button
                              key={slot.startTime}
                              onClick={() => doReschedule(appointment, slot)}
                              disabled={savingSlot === slot.startTime}
                              className="rounded border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs text-white hover:bg-white/20 disabled:opacity-50"
                            >
                              {savingSlot === slot.startTime ? 'Saving…' : hourLabelOf(slot.startTime)}
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
        )}

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