import { useState } from 'react';
import * as budgetsApi from '../api/budgets';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const AddBudgetForm = ({ onAdded }) => {
  const now = new Date();
  const [form, setForm] = useState({
    category: '',
    monthlyLimit: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await budgetsApi.createBudget({
        ...form,
        monthlyLimit: Math.round(Number(form.monthlyLimit) * 100),
        month: Number(form.month),
        year: Number(form.year),
      });
      setForm({ ...form, category: '', monthlyLimit: '' });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add budget');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex gap-3 flex-wrap items-center">
        <input name="category" placeholder="Category (e.g. food)" value={form.category} onChange={handleChange} required className={`${inputClass} w-44`} />
        <input name="monthlyLimit" type="number" step="0.01" placeholder="Monthly limit (₹)" value={form.monthlyLimit} onChange={handleChange} required className={`${inputClass} w-44`} />
        <select name="month" value={form.month} onChange={handleChange} className={inputClass}>
          {MONTH_NAMES.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
        </select>
        <input name="year" type="number" value={form.year} onChange={handleChange} className={`${inputClass} w-24`} />
        <button type="submit" disabled={submitting} className="bg-slate-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition">
          {submitting ? 'Adding...' : 'Add Budget'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </form>
  );
};

export default AddBudgetForm;