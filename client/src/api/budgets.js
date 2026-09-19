import api from './axios';

export const getBudgets = (params) => api.get('/budgets', { params }).then((res) => res.data);
export const getBudgetProgress = (params) => api.get('/budgets/progress', { params }).then((res) => res.data);
export const createBudget = (data) => api.post('/budgets', data).then((res) => res.data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`).then((res) => res.data);