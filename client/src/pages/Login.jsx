import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="text-white text-xl font-bold tracking-tight">FinSight</div>

        <div className="relative z-10">
          <h1 className="text-white text-4xl font-extrabold leading-tight mb-4 max-w-md">
            See where your money actually goes.
          </h1>
          <p className="text-slate-400 text-base max-w-sm leading-relaxed">
            Track accounts, catch unusual spending, and understand your habits with data pulled straight from your own transactions.
          </p>
        </div>

        {/* Decorative line-chart motif */}
        <svg viewBox="0 0 400 140" className="absolute bottom-0 left-0 w-full opacity-60" preserveAspectRatio="none">
          <polyline
            points="0,110 50,95 100,100 150,60 200,75 250,40 300,55 350,20 400,35"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          <polyline
            points="0,110 50,95 100,100 150,60 200,75 250,40 300,55 350,20 400,35 400,140 0,140"
            fill="url(#fade)"
            stroke="none"
          />
          <defs>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-slate-900 text-xl font-bold tracking-tight mb-10">FinSight</div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Log in to see your financial overview.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-950 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            No account?{' '}
            <Link to="/register" className="text-emerald-600 font-medium hover:text-emerald-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;