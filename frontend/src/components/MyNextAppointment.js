/**
 * MyNextAppointment — shows the logged-in user's next upcoming booked slot.
 * Rendered on the Dashboard between the AI feature and the Top Rated section.
 * Receives the appointment (or null) via props from the Dashboard.
 */
export default function MyNextAppointment({ appointment }) {
  if (!appointment) {
    return (
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">My Next Appointment</h2>
        <p className="text-sm text-gray-500">
          You have no upcoming appointments. Book one from the list below.
        </p>
      </div>
    );
  }

  const when = new Date(appointment.startTime).toLocaleString('en-US', {
    weekday: 'long', day: '2-digit', month: 'long',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const shopName = appointment.Barbershop?.name || 'Barbershop';
  const shopCity = appointment.Barbershop?.city || '';

  return (
    <div className="bg-gray-900 text-white shadow rounded-lg p-5">
      <h2 className="text-lg font-semibold mb-1">My Next Appointment</h2>
      <p className="text-sm">
        <span className="font-semibold">{shopName}</span>
        {shopCity ? ` · ${shopCity}` : ''}
      </p>
      <p className="text-sm text-gray-300 mt-0.5">{when}</p>
    </div>
  );
}