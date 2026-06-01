/**
 * Reusable card displaying one barbershop.
 * Receives a single shop object via the `shop` prop.
 * Rendered N times by Dashboard via .map(), satisfying "reused at least 3 times".
 */
export default function BarbershopCard({ shop }) {
  // Render N full stars + half star + empty stars for a 0–5 rating
  const fullStars = Math.floor(shop.rating);
  const hasHalf = (shop.rating % 1) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    /* THEME: card */
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header: name + rating */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {shop.name}
        </h3>
        <div className="flex flex-col items-end ml-3 shrink-0">
          <span className="text-base font-bold text-gray-900 tabular-nums">
            {shop.rating?.toFixed(1) ?? '—'}
          </span>
          <div className="flex text-yellow-500 text-sm leading-none">
            {Array.from({ length: fullStars }).map((_, i) => (
              <span key={`f${i}`}>★</span>
            ))}
            {hasHalf && <span>⯨</span>}
            {Array.from({ length: emptyStars }).map((_, i) => (
              <span key={`e${i}`} className="text-gray-300">★</span>
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-0.5">
            {shop.reviewCount ?? 0} reviews
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Address: </span>
          {shop.address}
        </p>
        <p>
          <span className="font-medium text-gray-700">Phone: </span>
          {shop.phone || '-'}
        </p>
      </div>
    </div>
  );
}