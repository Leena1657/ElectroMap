import { Outlet, NavLink } from 'react-router-dom';
import { Map, Navigation, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative font-sans text-gray-900">
      <main className="flex-1 overflow-y-auto pb-20 relative">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <NavItem to="/map" icon={Map} label="Map" />
          <NavItem to="/route" icon={Navigation} label="Route" />
          <NavItem to="/profile" icon={User} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-300',
          isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={clsx('p-2 rounded-full transition-all duration-300', isActive ? 'bg-primary/10' : 'bg-transparent')}>
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx('transition-transform duration-300', isActive && 'scale-110')} />
          </div>
          <span className={clsx('text-[10px] font-medium tracking-wide transition-colors', isActive && 'font-bold')}>{label}</span>
        </>
      )}
    </NavLink>
  );
}
