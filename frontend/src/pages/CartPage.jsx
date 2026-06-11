import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { resolveImageUrl } from '../services/api';
import useCart from '../hooks/useCart';

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart } = useCart();

  const total = items.reduce((acc, item) => acc + (item.price ?? 0) * item.quantity, 0);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      <ShoppingBag size={64} className="text-slate-700 mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
      <p className="text-slate-400 text-sm mb-8">Add some products to get started.</p>
      <Link to="/shop" className="btn-primary px-8">Browse Shop</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="card p-4 flex gap-4 items-center">
              <div className="w-20 h-20 flex-shrink-0 bg-surface-800 rounded-xl overflow-hidden">
                {item.imageUrl
                  ? <img src={resolveImageUrl(item.imageUrl)} alt={item.productName} className="w-full h-full object-cover" />
                  : <div className="flex items-center justify-center h-full text-2xl">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="text-white font-semibold text-sm hover:text-brand-400 transition-colors line-clamp-2">
                  {item.productName}
                </Link>
                <p className="text-brand-400 font-bold mt-1">${Number(item.price ?? 0).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1.5 rounded-lg bg-surface-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-white font-semibold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1.5 rounded-lg bg-surface-800 border border-slate-700 text-slate-300 hover:text-white transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">${(Number(item.price ?? 0) * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.productId)}
                  className="mt-1 text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({items.length} items)</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span><span className="text-emerald-400">Free</span>
            </div>
            <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-3 mt-3">
              <span>Total</span>
              <span className="text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
          <Link to="/shop" className="btn-secondary w-full text-center block mt-3">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
