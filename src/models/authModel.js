import { apiFetch } from './api.js';

export const authModel = {
  login: async (email, password) => {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  register: async (name, email, password) => {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }
};
