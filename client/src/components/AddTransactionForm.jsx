import { useState, useEffect } from 'react';
import * as accountsApi from '../api/accounts';
import * as transactionsApi from '../api/transactions';

const AddTransactionForm = ({ onAdded }) => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountId: '', type: 'expense', amount: '', category: '', merchant: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    accountsApi.getAccounts().then((data) => {
      setAccounts(data.accounts);
      if (data.accounts.length > 0) setForm((f) => ({ ...f, accountId: data.accounts[0]._id }));
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await transactionsApi.createTransaction({ ...form, amount: Math.round(Number(form.amount) * 100) });
      setForm({ ...form, amount: '', category: '', merchant: '', description: '' });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex gap-3 flex-wrap items-center">
        <select name="accountId" value={form.accountId} onChange={handleChange} required className={inputClass}>
          {accounts.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input name="amount" type="number" step="0.01" placeholder="Amount (₹)" value={form.amount} onChange={handleChange} required className={`${inputClass} w-32`} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className={`${inputClass} w-32`} />
        <input name="merchant" placeholder="Merchant" value={form.merchant} onChange={handleChange} className={`${inputClass} w-36`} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className={`${inputClass} w-40`} />
        <button type="submit" disabled={submitting} className="bg-slate-950 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition">
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </form>
  );
};

export default AddTransactionForm;