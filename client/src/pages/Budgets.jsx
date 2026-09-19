import { useEffect, useState, useCallback } from 'react';
import * as budgetsApi from '../api/budgets';
import AddBudgetForm from '../components/AddBudgetForm';
import { formatCurrency } from '../utils/format';

const Budgets = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const load = useCallback(() => {
    setLoading(true);
    budgetsApi.getBudgetProgress({ month: currentMonth, year: currentYear })
      .then((data) => setProgress(data.progress))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load budgets'))
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  useEffect(() => { load(); }, [load]);

  const getBarColor = (percentUsed) => {
    if (percentUsed >= 100) return 'bg-red-500';
    if (percentUsed >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-950 mb-1">Budgets</h1>
      <p className="text-slate-500 text-sm mb-6">
        {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </p>

      <AddBudgetForm onAdded={load} />

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : progress.length === 0 ? (
        <p className="text-slate-500 text-sm">No budgets set for this month yet. Add one above.</p>
      ) : (
        <div className="grid gap-4">
          {progress.map((b) => (
            <div key={b.category} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-slate-900 capitalize">{b.category}</span>
                  {b.isOverBudget && (
                    <span className="ml-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Over budget</span>
                  )}
                </div>
                <span className="text-sm text-slate-500">
                  {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                </span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(b.percentUsed)}`}
                  style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>{b.percentUsed}% used</span>
                <span>
                  {b.remaining >= 0
                    ? `${formatCurrency(b.remaining)} remaining · ${formatCurrency(b.safeDailySpend)}/day safe to spend`
                    : `${formatCurrency(Math.abs(b.remaining))} over limit`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Budgets;