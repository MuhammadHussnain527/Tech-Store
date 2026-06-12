import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, DollarSign, Activity,
  AlertTriangle, ArrowRight, TrendingUp, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi, resolveImageUrl } from '../services/api';

const STATUS_BADGE = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  PROCESSING: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  SHIPPED: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  DELIVERED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    const target = typeof value === 'number' ? value : 0;
    let start = 0;
    const duration = 800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard()
      .then(r => setStats(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bg: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      link: null,
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      link: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-amber-400',
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      link: '/admin/orders',
    },
    {
      label: 'Revenue (Delivered)',
      value: stats.totalRevenue,
      icon: DollarSign,
      color: 'text-gold-400',
      bg: 'from-gold-500/10 to-gold-600/5',
      border: 'border-gold-500/20',
      link: null,
      isRevenue: true,
    },
  ] : [];

  // Mock chart data for visual premium feel
  const chartData = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 13 },
    { name: 'Wed', revenue: 2000, orders: 98 },
    { name: 'Thu', revenue: 2780, orders: 39 },
    { name: 'Fri', revenue: 1890, orders: 48 },
    { name: 'Sat', revenue: 2390, orders: 38 },
    { name: 'Sun', revenue: 3490, orders: 43 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase">Live Dashboard</span>
        </div>
        <h1 className="font-serif text-4xl font-bold text-midnight-900 dark:text-white mb-1">Command Center</h1>
        <p className="text-slate-500 text-sm">Real-time overview of TechStore operations</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-midnight-100 dark:bg-white/5 animate-pulse border border-midnight-200 dark:border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cards.map(({ label, value, icon: Icon, color, bg, border, link, isRevenue }, idx) => {
            const inner = (
              <div
                className={`rounded-2xl p-6 border ${border} bg-gradient-to-br ${bg} hover:-translate-y-1 transition-all duration-300 h-full`}
                style={{ animation: `fade-in-up 0.5s ${idx * 0.1}s ease-out both` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-[0.15em] uppercase">{label}</p>
                  <div className={`p-2 rounded-xl bg-midnight-100 dark:bg-white/5 border border-midnight-200 dark:border-white/5`}>
                    <Icon size={16} className={color} />
                  </div>
                </div>
                <p className={`font-serif text-4xl font-extrabold ${color} mb-1`}>
                  {isRevenue ? (
                    <span>PKR {(value ?? 0).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  ) : (
                    <AnimatedNumber value={value} />
                  )}
                </p>
                {link && (
                  <p className="text-slate-500 text-xs flex items-center gap-1 mt-2 group-hover:text-gold-400 transition-colors">
                    View all <ArrowRight size={10} />
                  </p>
                )}
              </div>
            );
            return link ? (
              <Link key={label} to={link} className="block group">{inner}</Link>
            ) : (
              <div key={label}>{inner}</div>
            );
          })}
        </div>
      )}

      {/* Analytics Chart */}
      <div className="mb-10 rounded-2xl border border-midnight-200 dark:border-white/5 bg-midnight-50 dark:bg-white/3 p-6 bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-400" />
            <h2 className="text-midnight-900 dark:text-white font-bold text-lg">Revenue Overview</h2>
          </div>
        </div>
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-midnight-100 dark:bg-white/5 rounded-xl"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Orders — spans 3 cols */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gold-400" />
              <h2 className="text-midnight-900 dark:text-white font-bold text-lg">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="text-xs text-slate-500 dark:text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1 font-semibold">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-2xl border border-midnight-200 dark:border-white/5 bg-midnight-50 dark:bg-white/3 overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-midnight-100 dark:bg-white/5 animate-pulse" />)}
              </div>
            ) : !stats?.recentOrders?.length ? (
              <div className="p-10 text-center text-slate-500 text-sm">No orders yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-midnight-200 dark:border-white/5">
                    {['Order', 'Customer', 'Amount', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, i) => (
                    <tr
                      key={order.orderId}
                      className="border-b border-white/3 hover:bg-midnight-50 dark:bg-white/3 transition-colors"
                      style={{ animation: `fade-in-up 0.4s ${0.4 + i * 0.08}s ease-out both` }}
                    >
                      <td className="px-4 py-3 text-midnight-900 dark:text-white font-bold">#{order.orderId}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[120px] truncate">{order.shippingName}</td>
                      <td className="px-4 py-3 text-midnight-900 dark:text-white font-semibold">
                        PKR {Number(order.totalPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold border tracking-widest uppercase ${STATUS_BADGE[order.status] ?? 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/20'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alert — spans 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-midnight-900 dark:text-white font-bold text-lg">Low Stock</h2>
            {stats?.lowStockProducts?.length > 0 && (
              <span className="ml-auto bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {stats.lowStockProducts.length}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-midnight-200 dark:border-white/5 overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-midnight-100 dark:bg-white/5 animate-pulse" />)}
              </div>
            ) : !stats?.lowStockProducts?.length ? (
              <div className="p-8 text-center">
                <p className="text-emerald-400 font-semibold text-sm">All products in stock ✓</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.lowStockProducts.slice(0, 8).map((product, i) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-midnight-50 dark:bg-white/3 transition-colors"
                    style={{ animation: `fade-in-up 0.4s ${0.5 + i * 0.06}s ease-out both` }}
                  >
                    {product.imageUrl
                      ? <img src={resolveImageUrl(product.imageUrl)} alt={product.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-midnight-200 dark:border-white/10" />
                      : <div className="w-9 h-9 rounded-lg bg-midnight-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-base">📦</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-midnight-900 dark:text-white text-sm font-semibold truncate">{product.name}</p>
                      <p className="text-slate-500 text-xs">{product.brand || 'No brand'}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${product.stockQty === 0
                        ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                      {product.stockQty === 0 ? 'OUT' : `${product.stockQty} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-midnight-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-gold-400" /> Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Products', desc: 'Add, edit, or deactivate products', to: '/admin/products', icon: Package, color: 'text-emerald-400', border: 'hover:border-emerald-500/50' },
            { label: 'Manage Orders', desc: 'Update order statuses', to: '/admin/orders', icon: ShoppingBag, color: 'text-amber-400', border: 'hover:border-amber-500/50' },
            { label: 'Manage Categories', desc: 'Add and edit product categories', to: '/admin/categories', icon: Activity, color: 'text-blue-400', border: 'hover:border-blue-500/50' },
          ].map(({ label, desc, to, icon: Icon, color, border }) => (
            <Link
              key={to} to={to}
              className={`flex items-start gap-4 p-5 rounded-2xl border border-midnight-200 dark:border-white/5 ${border} transition-all duration-300 group hover:-translate-y-1`}
            >
              <div className="p-2.5 rounded-xl bg-midnight-100 dark:bg-white/5 border border-midnight-200 dark:border-white/5 group-hover:border-midnight-200 dark:border-white/10 transition-colors flex-shrink-0">
                <Icon size={18} className={`${color} transition-colors`} />
              </div>
              <div>
                <p className="text-midnight-900 dark:text-white font-bold text-sm mb-1 group-hover:text-gold-400 transition-colors">{label}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
