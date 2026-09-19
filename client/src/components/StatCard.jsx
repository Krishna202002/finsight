const TONE_STYLES = {
  good: 'text-emerald-600',
  bad: 'text-red-600',
  neutral: 'text-slate-900',
};

const StatCard = ({ label, value, tone }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1 min-w-[160px]">
    <div className="text-sm text-slate-500 mb-1">{label}</div>
    <div className={`text-2xl font-bold ${TONE_STYLES[tone] || TONE_STYLES.neutral}`}>{value}</div>
  </div>
);

export default StatCard;