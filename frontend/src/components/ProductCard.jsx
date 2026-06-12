import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { resolveImageUrl } from '../services/api';
import StarRating from './StarRating';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    try { await addToCart(product.productId, 1); }
    catch (err) { alert(err.message); }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const hasDiscount = product.discountPercentage > 0;
  const currentPrice = hasDiscount 
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : Number(product.price).toFixed(2);

  return (
    <Link
      to={`/products/${product.productId}`}
      className="card-glass group flex flex-col overflow-hidden hover:border-gold-500/60
                 hover:shadow-gold-500/20 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Product image */}
      <div className="relative h-56 bg-midnight-50 dark:bg-midnight-900 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-midnight-200 dark:text-slate-600 text-4xl select-none bg-gradient-to-br from-midnight-100 to-midnight-50 dark:from-midnight-800 dark:to-midnight-900">📦</div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stockQty === 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg uppercase tracking-wider">Out of Stock</span>
          )}
          {hasDiscount && (
            <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded shadow-lg uppercase tracking-widest">-{product.discountPercentage}% OFF</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-midnight-900/80 backdrop-blur text-midnight-400 dark:text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-midnight-800 shadow-lg transition-all duration-300"
          aria-label="Add to wishlist"
        >
          <Heart 
            size={16} 
            className={`transition-colors ${isInWishlist(product.productId) ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        {product.brand && <p className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest">{product.brand}</p>}
        <h3 className="text-midnight-900 dark:text-slate-100 font-bold text-sm leading-snug line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <StarRating rating={product.averageRating ?? 0} size={13} />
          <span className="text-[10px] text-slate-400 font-medium">({product.viewCount || 0} views)</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-midnight-100 dark:border-white/5">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-semibold mb-0.5">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
            <span className="text-xl font-serif font-bold text-midnight-900 dark:text-white leading-none">
              ${currentPrice}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stockQty === 0}
            className="btn-primary py-2 px-4 text-xs group/btn shadow-gold-500/10"
          >
            <ShoppingCart size={14} className="group-hover/btn:animate-pulse" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
