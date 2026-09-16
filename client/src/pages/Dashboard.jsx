import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as analyticsApi from '../api/analytics';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/format';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORY_COLORS = ['#4f8ef7', '#f78e4f', '#4ff7a1', '#f74f8e', '#a14ff7', '#f7d64f'];

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
        setMonthly(
          monthlyData.monthly.map((m) => ({
            name: MONTH_NAMES[m.month - 1],
            income: m.income / 100,
            expense: m.expense / 100,
          }))
        );
        setCategories(categoryData.categories.map((c) => ({ name: c.category, value: c.total / 100 })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 40 }}>Loading dashboard...</p>;
  if (error) return <p style={{ padding: 40, color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Total Income" value={formatCurrency(summary.income)} tone="good" />
        <StatCard label="Total Expense" value={formatCurrency(summary.expense)} tone="bad" />
        <StatCard label="Net Savings" value={formatCurrency(summary.netSavings)} tone={summary.netSavings >= 0 ? 'good' : 'bad'} />
        <StatCard label="Savings Rate" value={`${summary.savingsRate}%`} tone="neutral" />
      </div>

      <h2>Monthly Income vs Expense</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthly}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
          <Legend />
          <Bar dataKey="income" fill="#1a7f37" name="Income" />
          <Bar dataKey="expense" fill="#cf222e" name="Expense" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: 40 }}>Spending by Category</h2>
      {categories.length === 0 ? (
        <p>No expense data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" outerRadius={100} label>
              {categories.map((_, index) => (
                <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Dashboard;