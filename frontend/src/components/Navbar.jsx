import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, User, LayoutDashboard, LogOut, Sun, Moon, Search, Heart, Bell, ChevronDown } from 'lucide-react';
import CartIcon from './CartIcon';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
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
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkCls} end>Home</NavLink>
            
            {/* Mega Menu Trigger */}
            <div className="relative group h-20 flex items-center">
              <NavLink to="/shop" className={`flex items-center gap-1 ${linkCls({ isActive: window.location.pathname === '/shop' })}`}>
                Shop <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
              </NavLink>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                <div className="mt-2 p-6 card-glass rounded-2xl grid grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-gold-500 font-bold mb-4 uppercase tracking-widest text-xs">Categories</h4>
                    <ul className="space-y-3">
                      <li><Link to="/shop?category=Laptops" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">Laptops</Link></li>
                      <li><Link to="/shop?category=Smartphones" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">Smartphones</Link></li>
                      <li><Link to="/shop?category=Audio" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">Audio</Link></li>
                      <li><Link to="/shop?category=Accessories" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">Accessories</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gold-500 font-bold mb-4 uppercase tracking-widest text-xs">Featured</h4>
                    <ul className="space-y-3">
                      <li><Link to="/shop?sort=new" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">New Arrivals</Link></li>
                      <li><Link to="/shop?sort=popular" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">Best Sellers</Link></li>
                      <li><Link to="/shop?discount=true" className="text-sm font-medium text-midnight-700 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">On Sale</Link></li>
                    </ul>
                  </div>
                  <div className="col-span-1 rounded-xl overflow-hidden relative bg-midnight-900 group/promo">
                    <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80" alt="Promo" className="w-full h-full object-cover opacity-60 group-hover/promo:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-white font-bold text-lg mb-2">Summer Sale</span>
                      <Link to="/shop?discount=true" className="badge badge-gold">Up to 40% OFF</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <div className="relative flex items-center">
              <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? 'w-48 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
                <form onSubmit={handleSearch}>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-midnight-50 dark:bg-midnight-800 text-sm px-4 py-1.5 rounded-full border border-midnight-200 dark:border-midnight-700 focus:outline-none focus:border-gold-500"
                  />
                </form>
              </div>
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="p-2 rounded-full text-midnight-700 dark:text-slate-300 hover:bg-midnight-100 dark:hover:bg-midnight-800 transition-colors duration-300"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-midnight-700 dark:text-slate-300 hover:bg-midnight-100 dark:hover:bg-midnight-800 transition-colors duration-300"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {isLoggedIn && (
              <>
                <Link to="/profile?tab=wishlist" className="p-2 relative rounded-full text-midnight-700 dark:text-slate-300 hover:bg-midnight-100 dark:hover:bg-midnight-800 transition-colors duration-300">
                  <Heart size={18} />
                  {wishlist?.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-midnight-900">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                
                <Link to="/profile?tab=notifications" className="p-2 relative rounded-full text-midnight-700 dark:text-slate-300 hover:bg-midnight-100 dark:hover:bg-midnight-800 transition-colors duration-300">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-midnight-900">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                <CartIcon />
              </>
            )}

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
