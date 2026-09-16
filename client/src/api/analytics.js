import api from './axios';

export const getSummary = () => api.get('/analytics/summary').then((res) => res.data);
export const getMonthly = (year) => api.get(`/analytics/monthly?year=${year}`).then((res) => res.data);
export const getByCategory = () => api.get('/analytics/by-category').then((res) => res.data);
export const getTopMerchants = () => api.get('/analytics/top-merchants?limit=5').then((res) => res.data);