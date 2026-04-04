import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transactions', icon: '📋' },
  { to: '/merchants', label: 'Merchants', icon: '🏪' },
  { to: '/categories', label: 'Categories', icon: '📁' },
  { to: '/upload', label: 'Upload', icon: '📤' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center px-5 border-b border-gray-200">
        <span className="text-lg font-bold text-brand-700">🔎 BudgetLens</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
