export default function Footer() {
  const year = new Date().getFullYear();

  return (
    /* THEME: footer */
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p className="font-semibold text-gray-700">Scissors</p>
        <p>Smart appointment management for modern barbershops</p>
        <p className="mt-2">© {year} Scissors Team. All rights reserved.</p>
      </div>
    </footer>
  );
}