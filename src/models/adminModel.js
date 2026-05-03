import { apiFetch } from './api.js';

export const adminModel = {
  getStats: async (token) => {
    return apiFetch('/api/admin/stats', { token });
  },
  getStations: async (token) => {
    // In AdminPage it was fetching from /api/stations but with a token
    return apiFetch('/api/stations', { token });
  },
  getUsers: async (token) => {
    return apiFetch('/api/admin/users', { token });
  },
  createStation: async (token, stationData) => {
    return apiFetch('/api/admin/stations', {
      method: 'POST',
      token,
      body: JSON.stringify(stationData)
    });
  },
  updateStation: async (token, id, stationData) => {
    return apiFetch(`/api/admin/stations/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(stationData)
    });
  },
  deleteStation: async (token, id) => {
    return apiFetch(`/api/admin/stations/${id}`, {
      method: 'DELETE',
      token
    });
  },
  deleteUser: async (token, id) => {
    return apiFetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      token
    });
  }
};
