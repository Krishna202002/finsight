import { useEffect, useState, useCallback } from 'react';
import * as accountsApi from '../api/accounts';
import AddAccountForm from '../components/AddAccountForm';
import { formatCurrency } from '../utils/format';

const TYPE_LABELS = { bank: 'Bank', cash: 'Cash', wallet: 'Wallet', credit_card: 'Credit Card' };

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAccounts = useCallback(() => {
    setLoading(true);
    accountsApi.getAccounts()
      .then((data) => setAccounts(data.accounts))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load accounts'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this account?')) return;
    await accountsApi.deactivateAccount(id);
    loadAccounts();
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-950 mb-6">Accounts</h1>

      <AddAccountForm onAdded={loadAccounts} />

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : accounts.length === 0 ? (
        <p className="text-slate-500 text-sm">No accounts yet. Add one above to get started.</p>
      ) : (
        <>
          <div className="bg-slate-950 text-white rounded-xl p-5 mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-400">Total balance across all accounts</span>
            <span className="text-xl font-bold">{formatCurrency(totalBalance)}</span>
          </div>
          <div className="grid gap-3">
            {accounts.map((a) => (
              <div key={a._id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{a.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{TYPE_LABELS[a.type]}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-slate-900">{formatCurrency(a.currentBalance)}</span>
                  <button onClick={() => handleDeactivate(a._id)} className="text-xs font-medium text-slate-400 hover:text-red-600 transition">
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Accounts;