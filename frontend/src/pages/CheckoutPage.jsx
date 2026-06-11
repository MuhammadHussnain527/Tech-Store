import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, Phone, CheckCircle } from 'lucide-react';
import { orderApi } from '../services/api';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD',      label: '💳 Credit Card' },
  { value: 'PAYPAL',           label: '🅿️ PayPal' },
  { value: 'BANK_TRANSFER',    label: '🏦 Bank Transfer / JazzCash / EasyPaisa' },
  { value: 'CASH_ON_DELIVERY', label: '💵 Cash on Delivery' },
];

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shippingName:    user?.name    ?? '',
    shippingAddress: user?.address ?? '',
    shippingPhone:   user?.phone   ?? '',
    paymentMethod:   'CREDIT_CARD',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(null);

  const total = items.reduce((acc, i) => acc + (i.price ?? 0) * i.quantity, 0);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await orderApi.place(form);
      setSuccess(res.data);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-slide-up">
      <div className="card p-10 max-w-md w-full text-center">
        <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
        <p className="text-slate-400 text-sm mb-1">Order #{success} confirmed.</p>
        <p className="text-slate-400 text-sm mb-8">We'll start processing it right away.</p>
        <button onClick={() => navigate('/orders')} className="btn-primary w-full">View My Orders</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-800 text-red-400 text-sm">{error}</div>
          )}

          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><MapPin size={18} className="text-brand-400" /> Shipping Details</h2>
            {[
              { name: 'shippingName',    label: 'Full name',    icon: User,  placeholder: 'John Doe' },
              { name: 'shippingAddress', label: 'Address',      icon: MapPin,placeholder: '123 Main St, City' },
              { name: 'shippingPhone',   label: 'Phone',        icon: Phone, placeholder: '+1 555 000 0000' },
            ].map(({ name, label, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name={name} required value={form[name]} onChange={handle}
                    placeholder={placeholder} className="input pl-9" />
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard size={18} className="text-brand-400" /> Payment Method</h2>
            {PAYMENT_METHODS.map(({ value, label }) => (
              <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                form.paymentMethod === value ? 'border-brand-500 bg-brand-600/10' : 'border-slate-700 hover:border-slate-600'
              }`}>
                <input type="radio" name="paymentMethod" value={value} checked={form.paymentMethod === value} onChange={handle} className="accent-brand-500" />
                <span className="text-slate-200 text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full py-3 text-base">
            {loading ? 'Placing order…' : `Place Order · $${total.toFixed(2)}`}
          </button>
        </form>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-slate-300 truncate mr-3">{item.productName} × {item.quantity}</span>
                <span className="text-white font-medium flex-shrink-0">${(Number(item.price ?? 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-4 mt-4">
            <span>Total</span>
            <span className="text-xl">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
