import { useEffect, useState } from 'react';
import { ShoppingBag, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { adminApi } from '../services/api';

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  PROCESSING: { label: 'Processing', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  SHIPPED: { label: 'Shipped', cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  DELIVERED: { label: 'Delivered', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await adminApi.getAllOrders();
      setOrders(r.data ?? []);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try { await adminApi.updateStatus(orderId, status); load(true); }
    catch (err) { alert(err.message); }
    finally { setUpdating(null); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      String(o.orderId).includes(search) ||
      o.shippingName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.reduce((acc, o) =>
    o.status === 'DELIVERED' ? acc + Number(o.totalPrice) : acc, 0
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-midnight-900 dark:text-white">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length} orders ·{' '}
            <span className="text-gold-400 font-semibold">
              PKR {totalRevenue.toLocaleString()} delivered revenue
            </span>
          </p>
        </div>
        <button
          onClick={() => load(true)} disabled={refreshing}
          className="btn-secondary !text-midnight-900 dark:!text-white flex-shrink-0 py-2.5 px-4 text-sm flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status Summary Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${!statusFilter
            ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
            : 'bg-midnight-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-midnight-200 dark:border-white/10 hover:border-midnight-300 dark:border-white/20'
            }`}
        >All ({orders.length})</button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${statusFilter === s ? cfg.cls : 'bg-midnight-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-midnight-200 dark:border-white/10 hover:border-midnight-300 dark:border-white/20'
                }`}
            >{cfg.label} ({count})</button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order # or customer…"
          className="input pl-9 bg-midnight-100 dark:bg-white/5 border-midnight-200 dark:border-white/10 text-midnight-900 dark:text-white placeholder-slate-600"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-midnight-100 dark:bg-white/5 animate-pulse border border-midnight-200 dark:border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-500">
          <ShoppingBag size={48} className="mb-4 opacity-30" />
          <p className="font-serif text-xl text-midnight-900 dark:text-white">No orders found</p>
          <p className="text-sm mt-1">Try adjusting your search or status filter</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-midnight-200 dark:border-white/5 overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-midnight-200 dark:border-white/5">
                  {['Order', 'Customer', 'Amount', 'Payment', 'Date', 'Status', 'Update'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, cls: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };
                  return (
                    <tr
                      key={order.orderId}
                      className="border-b border-white/3 hover:bg-midnight-50 dark:bg-white/3 transition-colors"
                      style={{ animation: `fade-in-up 0.3s ${i * 0.04}s ease-out both` }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-midnight-900 dark:text-white font-bold">#{order.orderId}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[140px] truncate">
                        <div>{order.shippingName}</div>
                        {order.shippingPhone && (
                          <div className="text-slate-500 text-[11px]">{order.shippingPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gold-400 font-bold whitespace-nowrap">
                        PKR {Number(order.totalPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {order.paymentMethod?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border tracking-widest uppercase whitespace-nowrap ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            defaultValue={order.status}
                            disabled={updating === order.orderId}
                            onChange={e => updateStatus(order.orderId, e.target.value)}
                            className="appearance-none pr-7 pl-3 py-1.5 rounded-xl bg-midnight-100 dark:bg-white/5 border border-midnight-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold
                              hover:border-gold-500/40 focus:border-gold-500 focus:outline-none transition-colors cursor-pointer
                              disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
