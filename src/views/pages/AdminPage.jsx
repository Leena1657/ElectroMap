import { useState } from 'react';
import { useAdminController } from '../../controllers/useAdminController.js';

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: '20px 24px', minWidth: 140, flex: 1 }}>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function Badge({ status }) {
  const map = { available: '#22c55e', 'in-use': '#f59e0b', offline: '#ef4444' };
  return (
    <span style={{ background: map[status] + '22', color: map[status], borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

// ── Station Form Modal ────────────────────────────────────────────────────────
function StationModal({ initial, onSave, onClose }) {
  const blank = { name: '', distance: '', availableConnectors: 0, totalConnectors: 1, price: '', isFast: false, status: 'available', image: '', lat: 0, lng: 0 };
  const [form, setForm] = useState(initial || blank);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto', color: '#f1f5f9' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>{initial ? 'Edit Station' : 'Add Station'}</h3>
        {[['name','Name','text'],['distance','Distance','text'],['price','Price','text'],['image','Image URL','text']].map(([k, lbl, type]) => (
          <label key={k} style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{lbl}</span>
            <input value={form[k]} onChange={e => set(k, e.target.value)} type={type}
              style={{ display: 'block', width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', marginTop: 4, boxSizing: 'border-box' }} />
          </label>
        ))}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {[['availableConnectors','Available','number'],['totalConnectors','Total','number'],['lat','Lat','number'],['lng','Lng','number']].map(([k, lbl]) => (
            <label key={k} style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{lbl}</span>
              <input value={form[k]} onChange={e => set(k, Number(e.target.value))} type="number"
                style={{ display: 'block', width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', marginTop: 4, boxSizing: 'border-box' }} />
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isFast} onChange={e => set('isFast', e.target.checked)} />
            <span style={{ fontSize: 13 }}>Fast Charger</span>
          </label>
          <label style={{ flex: 1 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Status</span>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              style={{ display: 'block', width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', marginTop: 4 }}>
              {['available','in-use','offline'].map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onSave(form)} style={{ flex: 1, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, cursor: 'pointer' }}>Save</button>
          <button onClick={onClose} style={{ flex: 1, background: '#334155', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const {
    token, loginForm, setLoginForm, loginError, handleLogin, tab, setTab,
    stats, stations, users, modal, setModal, loading, saveStation,
    deleteStation, deleteUser, logout
  } = useAdminController();

  // ── login screen ──────────────────────────────────────────────────────────
  if (!token) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ background: '#1e293b', borderRadius: 20, padding: 40, width: 380, boxShadow: '0 25px 60px #0008' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: 22, fontWeight: 700 }}>ElectroMap Admin</h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>Sign in to manage the platform</p>
        </div>
        <form onSubmit={handleLogin}>
          {[['email','Email','email'],['password','Password','password']].map(([k,lbl,type]) => (
            <label key={k} style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{lbl}</span>
              <input type={type} value={loginForm[k]} onChange={e => setLoginForm(f => ({ ...f, [k]: e.target.value }))} required
                style={{ display: 'block', width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '11px 14px', color: '#f1f5f9', marginTop: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </label>
          ))}
          {loginError && <p style={{ color: '#f87171', fontSize: 13, margin: '-8px 0 12px' }}>{loginError}</p>}
          <button type="submit" style={{ width: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
            Sign In
          </button>
        </form>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20 }}>
          Default: admin@electromap.com / admin123
        </p>
      </div>
    </div>
  );

  // ── dashboard ─────────────────────────────────────────────────────────────
  const s = stats || {};
  const navItems = [['dashboard','📊 Dashboard'],['stations','🔌 Stations'],['users','👥 Users']];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter,sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>⚡ ElectroMap</div>
          <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginTop: 2 }}>ADMIN PORTAL</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: tab === key ? '#6366f122' : 'transparent', color: tab === key ? '#818cf8' : '#94a3b8', border: 'none', borderRadius: 8, padding: '10px 14px', marginBottom: 4, cursor: 'pointer', fontWeight: tab === key ? 600 : 400, fontSize: 14 }}>
              {label}
            </button>
          ))}
        </nav>
        <button onClick={logout} style={{ margin: '0 12px', background: '#ef444422', color: '#f87171', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontSize: 14 }}>
          🚪 Logout
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', color: '#f1f5f9' }}>

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && (
          <div>
            <h2 style={{ margin: '0 0 24px', fontSize: 22 }}>Dashboard Overview</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard label="Total Users" value={s.totalUsers ?? '—'} color="#818cf8" />
              <StatCard label="Total Stations" value={s.totalStations ?? '—'} color="#38bdf8" />
              <StatCard label="Available" value={s.available ?? '—'} color="#22c55e" />
              <StatCard label="In Use" value={s.inUse ?? '—'} color="#f59e0b" />
              <StatCard label="Offline" value={s.offline ?? '—'} color="#ef4444" />
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#94a3b8' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setTab('stations'); setModal('add'); }} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>+ Add Station</button>
                <button onClick={() => setTab('users')} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>View Users</button>
              </div>
            </div>
          </div>
        )}

        {/* STATIONS TAB */}
        {tab === 'stations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>Stations ({stations.length})</h2>
              <button onClick={() => setModal('add')} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}>+ Add Station</button>
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Name','Price','Connectors','Fast','Status','Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stations.map((st, i) => (
                    <tr key={st.id || st._id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                      <td style={{ padding: '12px 16px' }}>{st.name}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{st.price}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{st.availableConnectors}/{st.totalConnectors}</td>
                      <td style={{ padding: '12px 16px' }}>{st.isFast ? '⚡ Fast' : '🔌 Normal'}</td>
                      <td style={{ padding: '12px 16px' }}><Badge status={st.status} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => setModal(st)} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', marginRight: 8 }}>Edit</button>
                        <button onClick={() => deleteStation(st.id || st._id)} style={{ background: '#ef444422', color: '#f87171', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 22 }}>Users ({users.length})</h2>
            <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Name','Email','Role','Joined','Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id || u._id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                      <td style={{ padding: '12px 16px' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: u.isAdmin ? '#6366f122' : '#334155', color: u.isAdmin ? '#818cf8' : '#94a3b8', borderRadius: 6, padding: '2px 10px', fontSize: 12 }}>
                          {u.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {!u.isAdmin && (
                          <button onClick={() => deleteUser(u.id || u._id)} style={{ background: '#ef444422', color: '#f87171', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {modal && (
        <StationModal
          initial={modal === 'add' ? null : modal}
          onSave={saveStation}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
