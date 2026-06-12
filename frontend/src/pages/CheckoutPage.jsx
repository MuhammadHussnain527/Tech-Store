import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, Phone, CheckCircle, ArrowRight, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
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
  const [step,    setStep]    = useState(1); // 1 = Shipping, 2 = Payment

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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in-up">
      <div className="card-glass p-12 max-w-md w-full text-center border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-3xl -z-10" />
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <CheckCircle size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-midnight-900 dark:text-white mb-2">Order Confirmed!</h2>
        <p className="text-midnight-900 dark:text-white font-bold text-lg mb-2">Order #{success}</p>
        <p className="text-midnight-500 dark:text-slate-400 text-sm mb-8">We've received your order and will start processing it right away.</p>
        <button onClick={() => navigate('/profile?tab=orders')} className="btn-primary w-full py-3">View Order Status</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-gold-500 font-bold tracking-widest text-sm uppercase mb-2 block">Secure Checkout</span>
          <h1 className="heading-serif text-4xl text-midnight-900 dark:text-white">Complete Order</h1>
        </div>
        {/* Step Indicator */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-gold-500' : 'text-midnight-400 dark:text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 1 ? 'border-gold-500 bg-gold-500/10' : 'border-current'}`}>1</span>
            Shipping
          </div>
          <div className="w-8 h-px bg-midnight-200 dark:bg-midnight-700" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-gold-500' : 'text-midnight-400 dark:text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 2 ? 'border-gold-500 bg-gold-500/10' : 'border-current'}`}>2</span>
            Payment
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form Wizard */}
        <form onSubmit={submit} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold">{error}</div>
          )}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="card-glass p-8 space-y-6 border border-midnight-100 dark:border-white/5 shadow-xl animate-fade-in">
              <h2 className="text-lg font-bold text-midnight-900 dark:text-white flex items-center gap-3 uppercase tracking-widest border-b border-midnight-100 dark:border-midnight-800 pb-4">
                <MapPin size={20} className="text-gold-500" /> Shipping Details
              </h2>
              <div className="grid gap-5">
                {[
                  { name: 'shippingName',    label: 'Full Name',    icon: User,  placeholder: 'John Doe' },
                  { name: 'shippingAddress', label: 'Delivery Address', icon: MapPin,placeholder: '123 Main St, Apt 4B, City' },
                  { name: 'shippingPhone',   label: 'Phone Number', icon: Phone, placeholder: '+92 300 000 0000' },
                ].map(({ name, label, icon: Icon, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-bold text-midnight-700 dark:text-slate-400 mb-1.5 uppercase tracking-widest">{label}</label>
                    <div className="relative">
                      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-400 dark:text-slate-500" />
                      <input name={name} required value={form[name]} onChange={handle}
                        placeholder={placeholder} className="input-premium pl-11 py-3 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2">
                Continue to Payment <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card-glass p-8 space-y-6 border border-midnight-100 dark:border-white/5 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-midnight-100 dark:border-midnight-800 pb-4">
                <h2 className="text-lg font-bold text-midnight-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                  <CreditCard size={20} className="text-gold-500" /> Payment Method
                </h2>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-midnight-500 dark:text-slate-400 hover:text-gold-500 uppercase tracking-widest transition-colors">
                  Edit Shipping
                </button>
              </div>
              
              <div className="space-y-3 pt-2">
                {PAYMENT_METHODS.map(({ value, label }) => (
                  <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === value 
                      ? 'border-gold-500 bg-gold-500/5' 
                      : 'border-midnight-100 dark:border-midnight-700 hover:border-gold-500/40 bg-white dark:bg-midnight-800/50'
                  }`}>
                    <input type="radio" name="paymentMethod" value={value} checked={form.paymentMethod === value} onChange={handle} className="w-4 h-4 accent-gold-500" />
                    <span className={`text-sm font-bold ${form.paymentMethod === value ? 'text-midnight-900 dark:text-white' : 'text-midnight-700 dark:text-slate-300'}`}>{label}</span>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-midnight-100 dark:border-midnight-800">
                <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                  <ShieldCheck size={18} />
                  {loading ? 'Processing Securely…' : `Pay $${total.toFixed(2)} & Place Order`}
                </button>
                <p className="text-center text-xs text-midnight-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1">
                  <Lock size={12} /> Guaranteed safe & secure checkout
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Summary */}
        <div className="flex flex-col gap-6">
          <div className="card-glass p-8 h-fit shadow-xl border border-gold-500/10">
            <h2 className="text-lg font-bold text-midnight-900 dark:text-white mb-6 uppercase tracking-widest border-b border-midnight-100 dark:border-midnight-800 pb-4">Order Summary</h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 scrollbar-hide">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-midnight-900 dark:text-white font-bold text-sm truncate">{item.productName}</p>
                    <p className="text-midnight-500 dark:text-slate-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-gold-500 font-bold text-sm flex-shrink-0">${(Number(item.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-midnight-700 dark:text-slate-400 font-medium">
                <span>Subtotal</span>
                <span className="text-midnight-900 dark:text-white font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-midnight-700 dark:text-slate-400 font-medium">
                <span>Shipping</span>
                <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Free Delivery</span>
              </div>
              <div className="flex justify-between items-end font-bold text-midnight-900 dark:text-white border-t border-midnight-100 dark:border-midnight-800 pt-4 mt-4">
                <span className="uppercase tracking-widest">Total Pay</span>
                <span className="font-serif text-3xl text-gold-500">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="card-glass p-6 flex flex-col gap-4 border border-midnight-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center"><Truck size={18} /></div>
              <div>
                <p className="text-xs font-bold text-midnight-900 dark:text-white uppercase tracking-widest">Fast Delivery</p>
                <p className="text-[10px] text-midnight-500 dark:text-slate-400">Arrives in 1-2 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
