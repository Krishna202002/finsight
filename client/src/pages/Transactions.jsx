import { useEffect, useState, useCallback } from 'react';
import * as transactionsApi from '../api/transactions';
import AddTransactionForm from '../components/AddTransactionForm';
import { formatCurrency } from '../utils/format';

const TYPE_STYLES = {
  income: 'bg-emerald-50 text-emerald-700',
  expense: 'bg-red-50 text-red-700',
  transfer: 'bg-slate-100 text-slate-700',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    transactionsApi.getTransactions(params)
      .then((data) => { setTransactions(data.transactions); setPagination(data.pagination); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await transactionsApi.deleteTransaction(id);
    loadTransactions();
  };

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const selectClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-950 mb-6">Transactions</h1>

      <AddTransactionForm onAdded={loadTransactions} />

      <div className="flex gap-3 mb-4">
        <select name="type" value={filters.type} onChange={handleFilterChange} className={selectClass}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
        <input name="category" placeholder="Filter by category" value={filters.category} onChange={handleFilterChange} className={selectClass} />
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-slate-500 text-sm">No transactions found.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Merchant</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[t.type]}`}>{t.type}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{t.category || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{t.merchant || '-'}</td>
                  <td className={`px-5 py-3 text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(t._id)} className="text-slate-400 hover:text-red-600 text-xs font-medium transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-sm font-medium text-slate-600 disabled:text-slate-300 hover:text-slate-900 transition">
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="text-sm font-medium text-slate-600 disabled:text-slate-300 hover:text-slate-900 transition">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;