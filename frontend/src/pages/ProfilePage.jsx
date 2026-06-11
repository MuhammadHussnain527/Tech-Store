import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { orderApi, profileApi } from '../services/api';
import useAuth from '../hooks/useAuth';

const STATUS_BADGE = {
  PENDING:    'badge-yellow',
  PROCESSING: 'badge-blue',
  SHIPPED:    'badge-blue',
  DELIVERED:  'badge-green',
  CANCELLED:  'badge-red',
};

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [form, setForm]       = useState({ name: user?.name ?? '', phone: user?.phone ?? '', address: user?.address ?? '' });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [expanded, setExpanded] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    profileApi.get()
      .then(r => {
        const data = r.data ?? {};
        setForm({ name: data.name ?? '', phone: data.phone ?? '', address: data.address ?? '' });
      })
      .catch(() => {});
    orderApi.getMyOrders().then(r => setOrders(r.data ?? [])).catch(() => {});
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async e => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await profileApi.update(form);
      await refreshUser();
      setMsg('✓ Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  };

  const toggleOrder = async (orderId) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await orderApi.getById(orderId);
        setOrderDetails(prev => ({ ...prev, [orderId]: res.data }));
      } catch { /* ignore */ }
    }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <button onClick={handleLogout} className="btn-danger py-2 px-4 text-sm">Logout</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><User size={18} className="text-brand-400" /> Edit Profile</h2>
          <form onSubmit={save} className="space-y-4">
            {[
              { name: 'name',    label: 'Full name', icon: User,   placeholder: 'John Doe' },
              { name: 'phone',   label: 'Phone',     icon: Phone,  placeholder: '+1 555 000 0000' },
              { name: 'address', label: 'Address',   icon: MapPin, placeholder: '123 Main St' },
            ].map(({ name, label, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name={name} value={form[name]} onChange={handle} placeholder={placeholder} className="input pl-9" />
                </div>
              </div>
            ))}
            {msg && <p className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full">
              <Save size={15} />{saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
          <div className="mt-6 p-4 rounded-xl bg-surface-800 border border-slate-700">
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-white font-medium text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4">My Orders</h2>
          {orders.length === 0 ? (
            <p className="text-slate-400 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {orders.map(order => (
                <div key={order.orderId} className="rounded-xl bg-surface-800 border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => toggleOrder(order.orderId)}
                    className="w-full flex items-center justify-between p-3 hover:bg-surface-700/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">Order #{order.orderId}</p>
                      <p className="text-slate-400 text-xs mt-0.5">${Number(order.totalPrice).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={STATUS_BADGE[order.status] ?? 'badge-gray'}>{order.status}</span>
                      {expanded === order.orderId ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </button>
                  {expanded === order.orderId && orderDetails[order.orderId]?.items && (
                    <div className="px-3 pb-3 border-t border-slate-700 pt-2 space-y-1">
                      {orderDetails[order.orderId].items.map(item => (
                        <div key={item.orderItemId} className="flex justify-between text-xs text-slate-400">
                          <span>{item.productName} × {item.quantity}</span>
                          <span>${Number(item.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
