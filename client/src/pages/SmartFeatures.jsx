import { useEffect, useState } from 'react';
import * as smartApi from '../api/smart';
import HealthScoreRing from '../components/HealthScoreRing';
import { formatCurrency } from '../utils/format';

const SmartFeatures = () => {
  const [recurring, setRecurring] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      smartApi.getRecurring(),
      smartApi.getAnomalies(),
      smartApi.getForecast(),
      smartApi.getHealthScore(),
    ])
      .then(([r, a, f, h]) => {
        setRecurring(r.recurring);
        setAnomalies(a.anomalies);
        setForecast(f);
        setHealth(h);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load smart features'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto px-8 py-16 text-slate-500">Analyzing your finances...</div>;
  if (error) return <div className="max-w-5xl mx-auto px-8 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-950 mb-2">Smart Insights</h1>
      <p className="text-slate-500 text-sm mb-8">Patterns detected automatically from your transaction history.</p>

      <div className="mb-8">
        <HealthScoreRing score={health.score} breakdown={health.breakdown} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Next Month's Forecast</h2>
        <p className="text-sm text-slate-500 mb-4">
          Based on a {forecast.basedOnMonths}-month moving average
        </p>
        {forecast.basedOnMonths === 0 ? (
          <p className="text-slate-500 text-sm">{forecast.message}</p>
        ) : (
          <span className="text-3xl font-bold text-slate-900">{formatCurrency(forecast.forecast)}</span>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Recurring Transactions</h2>
        {recurring.length === 0 ? (
          <p className="text-slate-500 text-sm">No recurring patterns detected yet — this needs at least 3 similar transactions from the same merchant.</p>
        ) : (
          <div className="space-y-3">
            {recurring.map((r) => (
              <div key={r.merchant} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-medium text-slate-900">{r.merchant}</div>
                  <div className="text-xs text-slate-500">
                    Every ~{r.averageIntervalDays} days &middot; {r.occurrences} occurrences
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">{formatCurrency(r.averageAmount)}</div>
                  <div className="text-xs text-slate-500">Next: {new Date(r.estimatedNextDate).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Unusual Transactions</h2>
        {anomalies.length === 0 ? (
          <p className="text-slate-500 text-sm">Nothing unusual — your recent spending fits your normal patterns.</p>
        ) : (
          <div className="space-y-3">
            {anomalies.map((a) => (
              <div key={a.transactionId} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-medium text-slate-900">{a.merchant || a.category}</div>
                  <div className="text-xs text-slate-500">
                    {a.category} &middot; {new Date(a.date).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">{formatCurrency(a.amount)}</div>
                  <div className="text-xs text-slate-500">Usually ~{formatCurrency(a.categoryAverage)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFeatures;