import { useState } from 'react';
import * as accountsApi from '../api/accounts';

const AddAccountForm = ({ onAdded }) => {
  const [form, setForm] = useState({ name: '', type: 'bank', openingBalance: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await accountsApi.createAccount({ ...form, openingBalance: Math.round(Number(form.openingBalance || 0) * 100) });
      setForm({ name: '', type: 'bank', openingBalance: '' });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add account');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex gap-3 flex-wrap items-center">
        <input name="name" placeholder="Account name" value={form.name} onChange={handleChange} required className={`${inputClass} w-44`} />
        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="wallet">Wallet</option>
          <option value="credit_card">Credit Card</option>
        </select>
        <input name="openingBalance" type="number" step="0.01" placeholder="Opening balance (₹)" value={form.openingBalance} onChange={handleChange} className={`${inputClass} w-44`} />
        <button type="submit" disabled={submitting} className="bg-slate-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition">
          {submitting ? 'Adding...' : 'Add Account'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </form>
  );
};

export default AddAccountForm;