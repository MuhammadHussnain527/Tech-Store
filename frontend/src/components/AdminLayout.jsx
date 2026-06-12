import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, ChevronLeft, ChevronRight,
  LogOut, Cpu, Menu, X, TrendingUp, Heart, Sun, Moon
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { to: '/admin-panel',            label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin-panel/products',   label: 'Products',    icon: Package },
  { to: '/admin-panel/orders',     label: 'Orders',      icon: ShoppingBag },
  { to: '/admin-panel/categories', label: 'Categories',  icon: Tag },
  { to: '/admin-panel/wishlists',  label: 'Wishlists',   icon: Heart },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-midnight-200 dark:border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/30 flex-shrink-0">
            <Cpu size={18} strokeWidth={2.5} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-serif font-bold text-lg text-midnight-900 dark:text-white tracking-widest group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors">
              TECHSTORE
            </span>
          )}
        </Link>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">Admin Panel</p>
          <p className="text-midnight-900 dark:text-white text-sm font-semibold truncate">{user?.name}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 pt-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-100 dark:hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-gold-600 dark:text-gold-400' : 'group-hover:text-gold-600 dark:group-hover:text-gold-400'}`} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 border-t border-midnight-200 dark:border-white/5 pt-3 space-y-1">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-100 dark:hover:bg-white/5 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Toggle Theme' : undefined}
        >
          {theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-100 dark:hover:bg-white/5 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'View Store' : undefined}
        >
          <TrendingUp size={18} className="flex-shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-midnight-50 dark:bg-obsidian-900">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out border-r border-midnight-200 dark:border-white/5 bg-white dark:bg-obsidian-800
          ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-obsidian-800 border border-midnight-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:border-gold-500 transition-all duration-200 shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full z-50 w-64 bg-white dark:bg-obsidian-800 border-r border-midnight-200 dark:border-white/5 transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-obsidian-800 border-b border-midnight-200 dark:border-white/5 sticky top-16 z-30">
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="text-slate-500 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white p-1"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="text-midnight-900 dark:text-white font-bold font-serif text-sm tracking-widest">Admin Panel</span>
          <div className="w-8" />
        </div>

        {/* Page content */}
        <main className="flex-1 bg-midnight-50 dark:bg-obsidian-900 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
