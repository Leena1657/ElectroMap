import { useState } from 'react';
import { Settings, CreditCard, History, Bell, ChevronRight, ChevronDown, LogOut, Shield, Moon, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [theme, setTheme] = useState('Light');
  const [unit, setUnit] = useState('Kilometers');
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 top-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <h1 className="text-2xl font-bold mb-8 mt-2 relative z-10">Profile</h1>

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-primary text-2xl font-bold uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
            <p className="text-white/80 text-sm font-medium">{user?.email}</p>
            <div className="inline-flex items-center space-x-1 bg-white/20 px-2 py-0.5 rounded-full mt-2 backdrop-blur-sm">
              <Shield size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Premium Member</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 -mt-4 relative z-20">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <span className="text-sm text-gray-500 font-medium mb-1">Total Charged</span>
            <span className="text-2xl font-extrabold text-primary">0 <span className="text-sm text-gray-400 font-medium">kWh</span></span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <span className="text-sm text-gray-500 font-medium mb-1">Total Sessions</span>
            <span className="text-2xl font-extrabold text-blue-500">0</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">Settings & Preferences</h3>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <MenuItem 
            icon={CreditCard} title="Payment Methods" subtitle="UPI / Card" 
            active={activeMenu === 'payment'} onClick={() => toggleMenu('payment')}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">UPI</div>
                  <span className="text-sm font-medium text-gray-800">user@upi</span>
                </div>
                <CheckCircle2 size={16} className="text-success" />
              </div>
              <button className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                + Add Payment Method
              </button>
            </div>
          </MenuItem>

          <MenuItem 
            icon={History} title="Charging History" subtitle="View past sessions" 
            active={activeMenu === 'history'} onClick={() => toggleMenu('history')}
          >
            <div className="text-center py-4 text-sm text-gray-500 font-medium">
              No recent charging sessions.
            </div>
          </MenuItem>

          <MenuItem 
            icon={Bell} title="Notifications" subtitle="Alerts and updates" 
            active={activeMenu === 'notifications'} onClick={() => toggleMenu('notifications')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Push Notifications</h5>
                  <p className="text-xs text-gray-500">Alerts on your device</p>
                </div>
                <Toggle active={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Email Updates</h5>
                  <p className="text-xs text-gray-500">Weekly summaries & offers</p>
                </div>
                <Toggle active={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
              </div>
            </div>
          </MenuItem>

          <MenuItem 
            icon={Settings} title="App Settings" subtitle="Theme, units, language" border={false}
            active={activeMenu === 'settings'} onClick={() => toggleMenu('settings')}
          >
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-bold text-gray-800 mb-2">Distance Unit</h5>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['Kilometers', 'Miles'].map(u => (
                    <button key={u} onClick={() => setUnit(u)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${unit === u ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-bold text-gray-800 mb-2">Theme</h5>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['Light', 'Dark', 'System'].map(t => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${theme === t ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </MenuItem>
        </div>

        <button onClick={logout}
          className="w-full bg-white text-red-500 py-4 rounded-2xl font-bold text-base shadow-sm border border-gray-100 flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, title, subtitle, border = true, active, onClick, children }) {
  return (
    <>
      <div onClick={onClick} className={`flex items-center justify-between p-4 bg-white active:bg-gray-50 cursor-pointer ${border && !active ? 'border-b border-gray-50' : ''}`}>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
            <Icon size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          </div>
        </div>
        {active ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-gray-300" />}
      </div>
      {active && children && (
        <div className={`bg-gray-50 p-4 border-t border-gray-100 ${border ? 'border-b border-gray-50' : ''}`}>
          {children}
        </div>
      )}
    </>
  );
}

function Toggle({ active, onChange }) {
  return (
    <div 
      onClick={onChange}
      className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${active ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );
}
