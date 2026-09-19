import api from './axios';

export const getAccounts = () => api.get('/accounts').then((res) => res.data);
export const createAccount = (data) => api.post('/accounts', data).then((res) => res.data);
export const deactivateAccount = (id) => api.delete(`/accounts/${id}`).then((res) => res.data);
