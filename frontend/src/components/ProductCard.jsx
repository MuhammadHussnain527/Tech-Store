import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { resolveImageUrl } from '../services/api';
import StarRating from './StarRating';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    try { await addToCart(product.productId, 1); }
    catch (err) { alert(err.message); }
  };

  return (
    <Link
      to={`/products/${product.productId}`}
      className="card-glass group flex flex-col overflow-hidden hover:border-gold-500/60
                 hover:shadow-gold-500/20 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Product image */}
      <div className="relative h-52 bg-midnight-50 dark:bg-midnight-900 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-midnight-200 dark:text-slate-600 text-4xl select-none bg-gradient-to-br from-midnight-100 to-midnight-50 dark:from-midnight-800 dark:to-midnight-900">📦</div>
        )}
        {product.stockQty === 0 && (
          <div className="absolute inset-0 bg-midnight-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="badge-red">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        {product.brand && <p className="text-xs text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest">{product.brand}</p>}
        <h3 className="text-midnight-900 dark:text-slate-100 font-bold text-sm leading-snug line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
          {product.name}
        </h3>
        <StarRating rating={product.averageRating ?? 0} size={13} />
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-midnight-100 dark:border-white/5">
          <span className="text-xl font-serif font-bold text-midnight-900 dark:text-white">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stockQty === 0}
            className="btn-primary py-2 px-4 text-xs group/btn"
          >
            <ShoppingCart size={14} className="group-hover/btn:animate-pulse" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
