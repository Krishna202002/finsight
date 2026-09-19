const getScoreColor = (score) => {
  if (score >= 70) return '#10b981'; // emerald
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

const HealthScoreRing = ({ score, breakdown }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-8">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Financial Health Score</h3>
        <div className="space-y-2">
          {[
            { label: 'Savings rate', value: breakdown.savingsRate },
            { label: 'Budget adherence', value: breakdown.budgetAdherence },
            { label: 'Spending flexibility', value: breakdown.flexibilityScore },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-sm text-slate-500 w-36">{row.label}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: `${row.value}%` }} />
              </div>
              <span className="text-sm font-medium text-slate-700 w-10 text-right">{row.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthScoreRing;