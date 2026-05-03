import { apiFetch } from './api.js';

export const stationModel = {
  getAll: async () => {
    return apiFetch('/api/stations');
  }
};
