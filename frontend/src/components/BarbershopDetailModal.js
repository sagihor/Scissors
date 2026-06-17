/**
 * BarbershopDetailModal
 * ---------------------
 * Opened by clicking a barbershop card or table row. On open it calls the
 * RELATIONAL JOIN endpoint:
 *
 *     GET /api/barbershops/:id/barbers
 *
 * which returns the shop together with:
 *   - its Services  (ONE-TO-MANY:  Barbershop -> Service)
 *   - its barbers   (MANY-TO-MANY: User <-> Barbershop, via the junction table)
 *
 * This makes both required ORM relationships visible directly in the UI.
 */
import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export default function BarbershopDetailModal({ shop, onClose }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    setLoading(true);
    setError('');
    apiClient
      .get(`/barbershops/${shop.barbershopId}/barbers`)
      .then((res) => setDetails(res.data))
      .catch((err) => setError(err.message || 'Failed to load barbershop details.'))
      .finally(() => setLoading(false));
  }, [shop]);

  // Close on Escape for convenience
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!shop) return null;

  const services = details?.Services || [];
  const barbers = details?.barbers || [];

  return (
    /* THEME: modal overlay */
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      {/* Stop clicks inside the panel from closing it */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
            <p className="text-sm text-gray-500">{shop.address}{shop.city ? `, ${shop.city}` : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {loading && <p className="text-gray-500 text-sm">Loading details…</p>}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Services — ONE-TO-MANY */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Services <span className="font-normal text-gray-400">(one-to-many)</span>
                </h4>
                {services.length === 0 ? (
                  <p className="text-sm text-gray-500">No services listed.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded">
                    {services.map((sv) => (
                      <li key={sv.serviceId} className="flex justify-between px-3 py-2 text-sm">
                        <span className="text-gray-800">{sv.name}</span>
                        <span className="text-gray-600 tabular-nums">{sv.price}₪</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Barbers — MANY-TO-MANY (via junction table) */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Barbers <span className="font-normal text-gray-400">(many-to-many)</span>
                </h4>
                {barbers.length === 0 ? (
                  <p className="text-sm text-gray-500">No barbers assigned to this shop.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {barbers.map((b) => (
                      <li
                        key={b.userId}
                        className="bg-gray-100 text-gray-800 text-sm rounded-full px-3 py-1"
                      >
                        {b.firstName} {b.lastName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}