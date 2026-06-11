import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';

const STATUSES = ['PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
const STATUS_BADGE = { PENDING:'badge-yellow', PROCESSING:'badge-blue', SHIPPED:'badge-blue', DELIVERED:'badge-green', CANCELLED:'badge-red' };

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating,setUpdating]= useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getAllOrders().then(r => setOrders(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try { await adminApi.updateStatus(orderId, status); load(); }
    catch (err) { alert(err.message); }
    finally { setUpdating(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="card h-14 animate-pulse bg-surface-800"/>)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No orders yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                {['Order ID','User','Total','Payment','Date','Status','Update'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map(order => (
                <tr key={order.orderId} className="hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3 text-white font-bold">#{order.orderId}</td>
                  <td className="px-4 py-3 text-slate-300">{order.shippingName}</td>
                  <td className="px-4 py-3 text-white font-semibold">${Number(order.totalPrice).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{order.paymentMethod?.replace('_',' ')}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className={STATUS_BADGE[order.status] ?? 'badge-gray'}>{order.status}</span></td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={order.status}
                      disabled={updating === order.orderId}
                      onChange={e => updateStatus(order.orderId, e.target.value)}
                      className="input py-1 text-xs w-36"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
