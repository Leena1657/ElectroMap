import { useState, useEffect, useCallback } from 'react';
import { adminModel } from '../models/adminModel.js';
import { authModel } from '../models/authModel.js';

export function useAdminController() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ email: 'admin@electromap.com', password: '' });
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | station-object
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await authModel.login(loginForm.email, loginForm.password);
      if (!data.user?.isAdmin) {
        setLoginError('Not an admin account');
        return;
      }
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message || 'Network error');
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const data = await adminModel.getStats(token);
      setStats(data);
    } catch (err) { console.error(err); }
  }, [token]);

  const loadStations = useCallback(async () => {
    try {
      const data = await adminModel.getStations(token);
      setStations(data);
    } catch (err) { console.error(err); }
  }, [token]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminModel.getUsers(token);
      setUsers(data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadStats();
    loadStations();
    loadUsers();
  }, [token, loadStats, loadStations, loadUsers]);

  const saveStation = async (form) => {
    setLoading(true);
    try {
      if (form._id || form.id) {
        const id = form._id || form.id;
        await adminModel.updateStation(token, id, form);
      } else {
        await adminModel.createStation(token, form);
      }
      setModal(null);
      loadStations();
      loadStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStation = async (id) => {
    if (!confirm('Delete this station?')) return;
    try {
      await adminModel.deleteStation(token, id);
      loadStations();
      loadStats();
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminModel.deleteUser(token, id);
      loadUsers();
      loadStats();
    } catch (err) { console.error(err); }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return {
    token,
    loginForm,
    setLoginForm,
    loginError,
    handleLogin,
    tab,
    setTab,
    stats,
    stations,
    users,
    modal,
    setModal,
    loading,
    saveStation,
    deleteStation,
    deleteUser,
    logout
  };
}
