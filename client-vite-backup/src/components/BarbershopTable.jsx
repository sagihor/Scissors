export default function BarbershopTable({ shops }) {
  if (!shops || shops.length === 0) {
    return (
      /* THEME: empty state */
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        No barbershops to display.
      </div>
    );
  }

  function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d) ? '-' : d.toLocaleDateString();
  }

  return (
    /* THEME: table */
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed since</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {shops.map((shop) => (
            <tr key={shop.barbershopId} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{shop.barbershopId}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{shop.name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{shop.address}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{shop.phone || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <span className="font-semibold tabular-nums">{shop.rating?.toFixed(1) ?? '—'}</span>
                <span className="text-gray-500 ml-1">({shop.reviewCount ?? 0})</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(shop.createDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}