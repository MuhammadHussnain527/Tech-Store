import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingBag, TrendingUp, Activity } from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Users',    value: stats.totalUsers,    icon: Users,       color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    link: null },
    { label: 'Total Products', value: stats.totalProducts, icon: Package,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', link: '/admin/products' },
    { label: 'Total Orders',   value: stats.totalOrders,   icon: ShoppingBag, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   link: '/admin/orders' },
    { label: 'Revenue',        value: '—',                 icon: TrendingUp,  color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',   link: null },
  ] : [];

  return (
    <div className="theme-telemetry -mt-8 pt-8 pb-20 px-4 sm:px-6 lg:px-8 min-h-[90vh] animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
              <Activity size={14} className="animate-pulse" /> Live Telemetry
            </span>
            <h1 className="heading-serif text-4xl text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-2 font-sans">Command center overview of Tech-Store</p>
          </div>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({length: 4}).map((_, i) => <div key={i} className="admin-card rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map(({ label, value, icon: Icon, color, bg, link }) => {
              const inner = (
                <div className={`admin-card rounded-2xl p-6 flex flex-col justify-between h-full border ${bg} transition-all duration-300 ${link ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/50 cursor-pointer' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{label}</p>
                    <div className={`p-2 rounded-xl bg-obsidian-900 border border-white/5`}><Icon size={18} className={color} /></div>
                  </div>
                  <div>
                    <p className="font-serif text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{value ?? '—'}</p>
                  </div>
                </div>
              );
              return link ? <Link key={label} to={link} className="block h-full">{inner}</Link> : <div key={label} className="h-full">{inner}</div>;
            })}
          </div>
        )}

        {/* Quick links */}
        <h2 className="heading-serif text-2xl text-white mt-16 mb-6">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: 'Manage Products',   desc: 'Add, edit, or deactivate products', to: '/admin/products',   icon: Package },
            { label: 'Manage Orders',     desc: 'Update order statuses',             to: '/admin/orders',     icon: ShoppingBag },
            { label: 'Manage Categories', desc: 'Add and edit product categories',   to: '/admin/categories', icon: TrendingUp },
          ].map(({ label, desc, to, icon: Icon }) => (
            <Link key={to} to={to} className="admin-card rounded-2xl p-6 border border-white/5 hover:border-emerald-500/50 transition-all duration-300 group flex items-start gap-4">
              <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                <Icon size={20} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <p className="text-white font-bold mb-1 group-hover:text-emerald-400 transition-colors">{label}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
