import api from './axios';

export const getRecurring = () => api.get('/smart/recurring').then((res) => res.data);
export const getAnomalies = () => api.get('/smart/anomalies').then((res) => res.data);
export const getForecast = () => api.get('/smart/forecast').then((res) => res.data);
export const getHealthScore = () => api.get('/smart/health-score').then((res) => res.data);