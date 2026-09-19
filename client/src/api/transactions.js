import api from './axios';

export const getTransactions = (params) => api.get('/transactions', { params }).then((res) => res.data);
export const createTransaction = (data) => api.post('/transactions', data).then((res) => res.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then((res) => res.data);
export const transferMoney = (data) => api.post('/transactions/transfer', data).then((res) => res.data);