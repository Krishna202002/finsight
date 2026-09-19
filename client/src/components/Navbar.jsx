import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/accounts', label: 'Accounts' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white rounded-2xl mt-2.5">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-slate-950 text-lg font-bold tracking-tight">FinSight</span>
          <div className="flex gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;