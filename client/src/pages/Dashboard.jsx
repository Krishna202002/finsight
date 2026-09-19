import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as analyticsApi from '../api/analytics';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/format';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORY_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getMonthly(currentYear),
      analyticsApi.getByCategory(),
    ])
      .then(([summaryData, monthlyData, categoryData]) => {
        setSummary(summaryData);
        setMonthly(monthlyData.monthly.map((m) => ({
          name: MONTH_NAMES[m.month - 1],
          income: m.income / 100,
          expense: m.expense / 100,
        })));
        setCategories(categoryData.categories.map((c) => ({ name: c.category, value: c.total / 100 })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto px-8 py-16 text-slate-500">Loading dashboard...</div>;
  if (error) return <div className="max-w-5xl mx-auto px-8 py-16 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-950 mb-8">Dashboard</h1>

      <div className="flex gap-4 mb-10 flex-wrap">
        <StatCard label="Total Income" value={formatCurrency(summary.income)} tone="good" />
        <StatCard label="Total Expense" value={formatCurrency(summary.expense)} tone="bad" />
        <StatCard label="Net Savings" value={formatCurrency(summary.netSavings)} tone={summary.netSavings >= 0 ? 'good' : 'bad'} />
        <StatCard label="Savings Rate" value={`${summary.savingsRate}%`} tone="neutral" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Monthly Income vs Expense</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Spending by Category</h2>
        {categories.length === 0 ? (
          <p className="text-slate-500 text-sm">No expense data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" outerRadius={100} label>
                {categories.map((_, index) => (
                  <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;