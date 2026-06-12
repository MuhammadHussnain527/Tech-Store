import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck, LockIcon } from 'lucide-react';
import { resolveImageUrl } from '../services/api';
import useCart from '../hooks/useCart';

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart } = useCart();

  const total = items.reduce((acc, item) => acc + (item.price ?? 0) * item.quantity, 0);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in-up">
      <div className="w-24 h-24 bg-midnight-50 dark:bg-midnight-800/50 rounded-full flex items-center justify-center mb-6 border border-midnight-100 dark:border-midnight-700">
        <ShoppingBag size={40} className="text-midnight-300 dark:text-slate-500" />
      </div>
      <h2 className="text-3xl font-serif font-bold text-midnight-900 dark:text-white mb-3">Your cart is empty</h2>
      <p className="text-midnight-500 dark:text-slate-400 text-sm mb-8 max-w-md text-center">Looks like you haven't added anything to your cart yet. Explore our top categories to find what you need.</p>
      <Link to="/shop" className="btn-primary px-8 py-3">Explore Collection</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-gold-500 font-bold tracking-widest text-sm uppercase mb-2 block">Review Items</span>
          <h1 className="heading-serif text-4xl text-midnight-900 dark:text-white">Shopping Cart</h1>
        </div>
        <span className="text-midnight-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">{items.length} items</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div key={item.productId} className="card-glass p-5 flex flex-col sm:flex-row gap-6 items-center shadow-md border border-midnight-100 dark:border-white/5" style={{ animation: `fade-in-up 0.4s ${idx * 0.1}s ease-out both` }}>
              <Link to={`/products/${item.productId}`} className="w-24 h-24 flex-shrink-0 bg-midnight-50 dark:bg-midnight-900 rounded-xl overflow-hidden block">
                {item.imageUrl
                  ? <img src={resolveImageUrl(item.imageUrl)} alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  : <div className="flex items-center justify-center h-full text-2xl bg-gradient-to-br from-midnight-100 to-midnight-50">📦</div>
                }
              </Link>
              <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                <Link to={`/products/${item.productId}`} className="text-midnight-900 dark:text-white font-bold text-base hover:text-gold-500 transition-colors line-clamp-2 mb-2">
                  {item.productName}
                </Link>
                <p className="text-gold-600 dark:text-gold-400 font-serif font-bold text-lg">${Number(item.price ?? 0).toFixed(2)}</p>
              </div>
              <div className="flex flex-col sm:items-end w-full sm:w-auto gap-4">
                <div className="flex items-center justify-center bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-midnight-700 rounded-xl overflow-hidden h-10 w-32 mx-auto sm:mx-0">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-10 h-full flex items-center justify-center text-midnight-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-50 dark:hover:bg-midnight-800 disabled:opacity-40 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center text-midnight-900 dark:text-white font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-midnight-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-50 dark:hover:bg-midnight-800 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full gap-4 pt-4 sm:pt-0 border-t border-midnight-100 sm:border-0 dark:border-midnight-800">
                  <p className="text-midnight-900 dark:text-white font-bold text-sm sm:hidden">Subtotal: ${(Number(item.price ?? 0) * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Trash2 size={14} /> <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-6">
          <div className="card-glass p-8 h-fit shadow-xl border border-gold-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-bl-full pointer-events-none" />
            <h2 className="text-xl font-bold text-midnight-900 dark:text-white mb-6 uppercase tracking-widest border-b border-midnight-100 dark:border-midnight-800 pb-4">Order Summary</h2>
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-midnight-700 dark:text-slate-400 font-medium">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-midnight-900 dark:text-white font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-midnight-700 dark:text-slate-400 font-medium">
                <span>Shipping</span><span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Free</span>
              </div>
              <div className="flex justify-between text-midnight-700 dark:text-slate-400 font-medium">
                <span>Taxes</span><span className="text-midnight-900 dark:text-white font-bold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-end font-bold text-midnight-900 dark:text-white border-t border-midnight-100 dark:border-midnight-800 pt-4 mt-4">
                <span className="uppercase tracking-widest">Total</span>
                <span className="font-serif text-3xl text-gold-500">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full text-center py-3 flex items-center justify-center gap-2 mb-3">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn-secondary w-full text-center py-3 block">
              Continue Shopping
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="card-glass p-6 grid grid-cols-1 gap-4 border border-midnight-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg"><ShieldCheck size={18} /></div>
              <div>
                <p className="text-xs font-bold text-midnight-900 dark:text-white uppercase tracking-widest">Secure Checkout</p>
                <p className="text-[10px] text-midnight-500 dark:text-slate-400">256-bit SSL encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg"><Truck size={18} /></div>
              <div>
                <p className="text-xs font-bold text-midnight-900 dark:text-white uppercase tracking-widest">Free Shipping</p>
                <p className="text-[10px] text-midnight-500 dark:text-slate-400">On all orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
