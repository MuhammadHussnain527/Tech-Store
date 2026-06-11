import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, User, LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';
import CartIcon from './CartIcon';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkCls = ({ isActive }) =>
    `text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-gold-500' : 'text-midnight-700 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 card-glass border-b-0 rounded-none bg-white/80 dark:bg-midnight-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-serif font-bold text-2xl tracking-widest text-midnight-900 dark:text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-midnight-900 shadow-lg shadow-gold-500/20">
              <Cpu size={20} strokeWidth={2.5} />
            </div>
            <span>TECHSTORE</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/"        className={linkCls} end>Home</NavLink>
            <NavLink to="/shop"    className={linkCls}>Shop</NavLink>
            {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-midnight-700 dark:text-slate-300 hover:bg-midnight-100 dark:hover:bg-midnight-800 transition-colors duration-300"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isLoggedIn && <CartIcon />}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-midnight-700 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white text-sm font-bold tracking-widest uppercase transition-colors">
                  <User size={18} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 card-glass p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-widest uppercase text-midnight-700 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-50 dark:hover:bg-midnight-800 rounded-xl transition-colors">
                    <User size={16} /> Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-widest uppercase text-midnight-700 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-50 dark:hover:bg-midnight-800 rounded-xl transition-colors">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  )}
                  <div className="h-px bg-midnight-100 dark:bg-midnight-700 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold tracking-widest uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"    className="btn-secondary py-2 px-5 text-xs">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-xs">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-midnight-700 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-midnight-200 dark:border-midnight-800 bg-white dark:bg-midnight-900 px-4 pb-6 animate-fade-in-up">
          <nav className="flex flex-col gap-4 pt-4">
            <NavLink to="/"        className={linkCls} end onClick={() => setMobileOpen(false)}>Home</NavLink>
            <NavLink to="/shop"    className={linkCls}     onClick={() => setMobileOpen(false)}>Shop</NavLink>
            {isAdmin && <NavLink to="/admin" className={linkCls} onClick={() => setMobileOpen(false)}>Admin</NavLink>}
            {isLoggedIn && <NavLink to="/profile" className={linkCls} onClick={() => setMobileOpen(false)}>Profile</NavLink>}
            {isLoggedIn && <NavLink to="/cart"    className={linkCls} onClick={() => setMobileOpen(false)}>Cart</NavLink>}
            {isLoggedIn
              ? <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-left text-sm font-bold tracking-widest uppercase text-red-500 py-2">Logout</button>
              : <div className="flex flex-col gap-3 mt-4">
                  <Link to="/login"    className="btn-secondary text-center" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>Sign up</Link>
                </div>
            }
          </nav>
        </div>
      )}
    </header>
  );
}
