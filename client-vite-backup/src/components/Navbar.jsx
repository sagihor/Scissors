import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  // Prefer username, fall back to firstName + lastName
  const displayName = currentUser
    ? (currentUser.username || `${currentUser.firstName} ${currentUser.lastName || ''}`.trim())
    : '';

  return (
    /* THEME: navbar */
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo / project name */}
        <Link to="/dashboard" className="text-xl font-bold text-gray-900">
          Scissors ✂️
        </Link>

        {/* Navigation + user info */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Settings
          </Link>

          {currentUser && (
            <>
              <span className="text-sm text-gray-500">{displayName}</span>
              <button
                onClick={logout}
                className="text-sm bg-gray-900 hover:bg-gray-700 text-white font-medium px-3 py-1.5 rounded"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}