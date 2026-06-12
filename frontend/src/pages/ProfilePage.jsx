import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import {
  User, Phone, MapPin, Save, ChevronDown, ChevronUp,
  LockIcon, Eye, EyeOff, Shield, CheckCircle2, Heart, Bell, ShoppingBag, X
} from 'lucide-react';
import { orderApi, profileApi, resolveImageUrl } from '../services/api';
import useAuth from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../context/NotificationContext';

const STATUS_BADGE = {
  PENDING:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  SHIPPED:    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  DELIVERED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  CANCELLED:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, toggleWishlist } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [activeTab,    setActiveTab]    = useState(searchParams.get('tab') || 'orders');
  const [orders,       setOrders]       = useState([]);
  const [form,         setForm]         = useState({ name: '', phone: '', address: '' });
  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState('');
  const [expanded,     setExpanded]     = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  // Change password
  const [pwdForm, setPwdForm]         = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwdSaving, setPwdSaving]     = useState(false);
  const [pwdMsg,    setPwdMsg]        = useState('');
  const [pwdTab,    setPwdTab]        = useState(false);

  useEffect(() => {
    profileApi.get()
      .then(r => {
        const data = r.data ?? {};
        setForm({ name: data.name ?? '', phone: data.phone ?? '', address: data.address ?? '' });
      })
      .catch(() => {});
    orderApi.getMyOrders().then(r => setOrders(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'wishlist', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePwd = e => setPwdForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async e => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await profileApi.update(form);
      await refreshUser();
      setMsg('success:Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('error:' + err.message); }
    finally { setSaving(false); }
  };

  const changePwd = async e => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg('error:New passwords do not match.'); return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdMsg('error:Password must be at least 8 characters.'); return;
    }
    setPwdSaving(true); setPwdMsg('');
    try {
      await profileApi.changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
      setPwdMsg('success:Password changed successfully!');
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdMsg(''), 4000);
    } catch (err) { setPwdMsg('error:' + err.message); }
    finally { setPwdSaving(false); }
  };

  const toggleOrder = async (orderId) => {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await orderApi.getById(orderId);
        setOrderDetails(prev => ({ ...prev, [orderId]: res.data }));
      } catch {}
    }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const isSuccess = s => s.startsWith('success:');
  const msgText   = s => s.replace(/^(success:|error:)/, '');

  // Password strength
  const pwdStrength = (() => {
    const p = pwdForm.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[a-z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-midnight-900 dark:text-white">My Account</h1>
          <p className="text-midnight-700 dark:text-slate-400 text-sm mt-1">{user?.email}</p>
        </div>
        <button onClick={handleLogout}
          className="btn-danger py-2 px-4 text-sm font-bold uppercase tracking-widest rounded-xl">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide border-b border-midnight-200 dark:border-white/5">
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist?.length },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount, badgeColor: 'bg-red-500' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold tracking-widest uppercase rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-midnight-900 text-white dark:bg-white dark:text-midnight-900 border-b-2 border-gold-500' 
                : 'text-midnight-500 dark:text-slate-400 hover:bg-midnight-50 dark:hover:bg-white/5 hover:text-midnight-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
            {tab.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] text-white ${tab.badgeColor || 'bg-gold-500'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        {/* ── Tab Content: Profile ── */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-2 gap-8">

          {/* Profile Info */}
          <div className="card-glass p-6 rounded-2xl">
            <h2 className="text-base font-bold text-midnight-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={16} className="text-gold-500" /> Edit Profile
            </h2>
            <form onSubmit={save} className="space-y-3">
              {[
                { name: 'name',    label: 'Full Name', icon: User,   placeholder: 'Your name' },
                { name: 'phone',   label: 'Phone',     icon: Phone,  placeholder: '+92 300 000 0000' },
                { name: 'address', label: 'Address',   icon: MapPin, placeholder: 'Street, City' },
              ].map(({ name, label, icon: Icon, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs text-slate-500 mb-1 font-semibold uppercase tracking-widest">{label}</label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name={name} value={form[name]} onChange={handle}
                      placeholder={placeholder}
                      className="input-premium pl-9 text-sm" />
                  </div>
                </div>
              ))}

              {msg && (
                <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl ${
                  isSuccess(msg)
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                }`}>
                  {isSuccess(msg) && <CheckCircle2 size={14} />}
                  {msgText(msg)}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full text-sm py-2.5">
                <Save size={14} />{saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card-glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setPwdTab(t => !t)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 dark:hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gold-500" />
                <span className="font-bold text-midnight-900 dark:text-white text-sm">Change Password</span>
              </div>
              {pwdTab ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {pwdTab && (
              <div className="px-6 pb-6 border-t border-midnight-200 dark:border-white/5">
                <form onSubmit={changePwd} className="space-y-3 pt-4">
                  {/* Old password */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold uppercase tracking-widest">Current Password</label>
                    <div className="relative">
                      <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="profile-old-pwd" name="oldPassword" type={showOld ? 'text' : 'password'}
                        value={pwdForm.oldPassword} onChange={handlePwd}
                        placeholder="Your current password" required
                        className="input-premium pl-9 pr-10 text-sm" />
                      <button type="button" onClick={() => setShowOld(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold uppercase tracking-widest">New Password</label>
                    <div className="relative">
                      <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="profile-new-pwd" name="newPassword" type={showNew ? 'text' : 'password'}
                        value={pwdForm.newPassword} onChange={handlePwd}
                        placeholder="Min. 8 characters" required
                        className="input-premium pl-9 pr-10 text-sm" />
                      <button type="button" onClick={() => setShowNew(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {pwdForm.newPassword && (
                      <div className="flex gap-1 mt-1.5">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwdStrength ? strColors[pwdStrength] : 'bg-slate-200 dark:bg-white/10'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold uppercase tracking-widest">Confirm New Password</label>
                    <div className="relative">
                      <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="profile-confirm-pwd" name="confirmPassword" type="password"
                        value={pwdForm.confirmPassword} onChange={handlePwd}
                        placeholder="Repeat new password" required
                        className={`input-premium pl-9 text-sm ${
                          pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword
                            ? 'border-red-400 focus:border-red-400' : ''
                        }`} />
                    </div>
                  </div>

                  {pwdMsg && (
                    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl ${
                      isSuccess(pwdMsg)
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {isSuccess(pwdMsg) && <CheckCircle2 size={14} />}
                      {msgText(pwdMsg)}
                    </div>
                  )}

                  <button type="submit" disabled={pwdSaving} className="btn-primary w-full text-sm py-2.5">
                    <Shield size={14} />{pwdSaving ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
          </div>
        )}

        {/* ── Tab Content: Orders ── */}
        {activeTab === 'orders' && (
          <div className="card-glass p-6 lg:p-8 rounded-2xl border border-midnight-100 dark:border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-midnight-900 dark:text-white">My Orders</h2>
              <span className="text-xs text-slate-400 font-semibold">{orders.length} orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-slate-400">
                <div className="text-5xl mb-3 opacity-30">📦</div>
                <p className="font-serif text-lg text-midnight-900 dark:text-white">No orders yet</p>
                <p className="text-sm mt-1">Your purchases will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {orders.map(order => (
                  <div key={order.orderId}
                    className="rounded-xl bg-midnight-50 dark:bg-midnight-800/50 border border-midnight-200 dark:border-white/5 overflow-hidden">
                    <button
                      onClick={() => toggleOrder(order.orderId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-midnight-100 dark:hover:bg-white/3 transition-colors text-left"
                    >
                      <div>
                        <p className="text-midnight-900 dark:text-white font-bold text-sm">Order #{order.orderId}</p>
                        <p className="text-midnight-700 dark:text-slate-400 text-xs mt-0.5">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-gold-500 font-bold text-sm">PKR {Number(order.totalPrice).toLocaleString()}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-widest uppercase ${STATUS_BADGE[order.status] ?? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        {expanded === order.orderId
                          ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                          : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                        }
                      </div>
                    </button>

                    {expanded === order.orderId && orderDetails[order.orderId]?.items && (
                      <div className="px-4 pb-4 border-t border-midnight-200 dark:border-white/5 pt-3 space-y-2">
                        {orderDetails[order.orderId].items.map(item => (
                          <div key={item.orderItemId} className="flex justify-between text-xs text-midnight-700 dark:text-slate-400">
                            <span>{item.productName} × {item.quantity}</span>
                            <span className="font-semibold text-midnight-900 dark:text-slate-200">PKR {Number(item.subtotal).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold border-t border-midnight-200 dark:border-white/5 pt-2 mt-2">
                          <span className="text-midnight-700 dark:text-slate-400">Total</span>
                          <span className="text-gold-500">PKR {Number(order.totalPrice).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab Content: Wishlist ── */}
        {activeTab === 'wishlist' && (
          <div className="card-glass p-6 lg:p-8 rounded-2xl border border-midnight-100 dark:border-white/5 shadow-xl min-h-[400px]">
            <h2 className="text-xl font-serif font-bold text-midnight-900 dark:text-white mb-6 flex items-center gap-2">
              <Heart size={20} className="text-gold-500" /> Saved Items
            </h2>
            
            {wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-midnight-400 dark:text-slate-500">
                <Heart size={64} className="mb-4 opacity-20" />
                <p className="font-serif text-2xl text-midnight-900 dark:text-white mb-2">Your wishlist is empty</p>
                <p className="text-sm">Save items you like to buy them later.</p>
                <button onClick={() => navigate('/shop')} className="mt-6 btn-primary px-8">Explore Products</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map(product => (
                  <div key={product.productId} className="card-glass group flex flex-col overflow-hidden hover:border-gold-500/60 transition-all duration-300 relative">
                    <div className="relative h-48 bg-midnight-50 dark:bg-midnight-900 overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${product.productId}`)}>
                      {product.imageUrl ? (
                        <img src={resolveImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl select-none bg-gradient-to-br from-midnight-100 to-midnight-50">📦</div>
                      )}
                      {product.discountPercentage > 0 && (
                        <span className="absolute top-2 left-2 badge badge-gold shadow-lg text-[10px]">-{product.discountPercentage}% OFF</span>
                      )}
                    </div>
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-midnight-900/90 text-red-500 hover:bg-red-50 shadow-lg transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-midnight-900 dark:text-white font-bold text-sm line-clamp-2 hover:text-gold-500 transition-colors cursor-pointer" onClick={() => navigate(`/products/${product.productId}`)}>{product.name}</h3>
                      <div className="mt-auto pt-3 flex items-end justify-between">
                        <span className="font-serif font-bold text-midnight-900 dark:text-white">${Number(product.price).toFixed(2)}</span>
                        <button onClick={() => navigate(`/products/${product.productId}`)} className="text-xs font-bold uppercase tracking-widest text-gold-500 hover:text-gold-600 transition-colors">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab Content: Notifications ── */}
        {activeTab === 'notifications' && (
          <div className="card-glass p-6 lg:p-8 rounded-2xl border border-midnight-100 dark:border-white/5 shadow-xl min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-midnight-900 dark:text-white flex items-center gap-2">
                <Bell size={20} className="text-gold-500" /> Notifications
              </h2>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-bold uppercase tracking-widest text-midnight-500 hover:text-midnight-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Mark all as read
                </button>
              )}
            </div>
            
            {!notifications || notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-midnight-400 dark:text-slate-500">
                <Bell size={64} className="mb-4 opacity-20" />
                <p className="font-serif text-2xl text-midnight-900 dark:text-white mb-2">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div 
                    key={notif.notificationId} 
                    onClick={() => !notif.isRead && markAsRead(notif.notificationId)}
                    className={`p-4 rounded-xl border transition-all ${
                      notif.isRead 
                        ? 'bg-white/50 dark:bg-midnight-800/30 border-midnight-100 dark:border-midnight-800 opacity-70' 
                        : 'bg-white dark:bg-midnight-800 border-gold-500/30 shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-midnight-100 dark:bg-midnight-700 text-midnight-500' : 'bg-gold-500/20 text-gold-500'}`}>
                        {notif.type === 'ORDER' ? <ShoppingBag size={16} /> : 
                         notif.type === 'SYSTEM' ? <Shield size={16} /> : 
                         <Bell size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold uppercase tracking-widest ${notif.isRead ? 'text-midnight-500' : 'text-gold-500'}`}>{notif.type}</span>
                          <span className="text-xs text-midnight-400 dark:text-slate-500">
                            {new Date(notif.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm ${notif.isRead ? 'text-midnight-700 dark:text-slate-400' : 'text-midnight-900 dark:text-white font-medium'}`}>{notif.message}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
