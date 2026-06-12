import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Star, Heart, Share2, ShieldCheck, Truck } from 'lucide-react';
import { productApi, ratingApi, resolveImageUrl } from '../services/api';
import StarRating from '../components/StarRating';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct]   = useState(null);
  const [ratings, setRatings]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    Promise.all([
      productApi.getById(id),
      ratingApi.getByProduct(id),
    ])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data);
        setRatings(rRes.data ?? []);
      })
      .catch(() => navigate('/shop', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setAdding(true); setMsg('');
    try {
      await addToCart(product.productId, qty);
      setMsg('✓ Added to cart!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message);
    } finally { setAdding(false); }
  };

  const submitReview = async e => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    setSubmitting(true); setReviewMsg('');
    try {
      await ratingApi.submit(product.productId, reviewForm);
      const [pRes, rRes] = await Promise.all([
        productApi.getById(id),
        ratingApi.getByProduct(id),
      ]);
      setProduct(pRes.data);
      setRatings(rRes.data ?? []);
      setReviewMsg('✓ Review submitted!');
      setTimeout(() => setReviewMsg(''), 3000);
    } catch (err) {
      setReviewMsg(err.message);
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return null;

  const inStock = product.stockQty > 0;
  const imgSrc = resolveImageUrl(product.imageUrl);
  const hasDiscount = product.discountPercentage > 0;
  const originalPrice = hasDiscount 
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-midnight-400 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white text-sm font-bold uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Image */}
        <div className="card-glass relative flex items-center justify-center min-h-[400px] lg:min-h-[500px] p-8 overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-midnight-50 to-midnight-100 dark:from-midnight-800 dark:to-midnight-900 -z-10" />
          
          {imgSrc
            ? <img src={imgSrc} alt={product.name} className="w-full h-full object-contain max-h-[400px] group-hover:scale-105 transition-transform duration-500" />
            : <Package size={100} className="text-midnight-200 dark:text-slate-600" />
          }
          
          {/* Actions top overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-3">
            <button 
              onClick={() => toggleWishlist(product)}
              className="p-3 rounded-full card-glass text-midnight-400 dark:text-slate-400 hover:text-red-500 transition-colors shadow-xl"
            >
              <Heart size={20} className={isInWishlist(product.productId) ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <button className="p-3 rounded-full card-glass text-midnight-400 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white transition-colors shadow-xl">
              <Share2 size={20} />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {!inStock && <span className="badge badge-red shadow-lg text-sm px-3 py-1.5">Out of Stock</span>}
            {hasDiscount && <span className="badge badge-gold shadow-lg text-sm px-3 py-1.5">-{product.discountPercentage}% OFF</span>}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          {product.brand && (
            <span className="text-gold-500 font-bold uppercase tracking-widest text-xs mb-3 block">
              {product.brand}
            </span>
          )}
          <h1 className="heading-serif text-4xl lg:text-5xl text-midnight-900 dark:text-white leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <StarRating rating={product.averageRating ?? 0} size={18} />
              <span className="text-midnight-900 dark:text-white font-bold">{Number(product.averageRating ?? 0).toFixed(1)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-midnight-200 dark:bg-midnight-700" />
            <span className="text-midnight-700 dark:text-slate-400 text-sm">{ratings.length} reviews</span>
            <div className="w-1 h-1 rounded-full bg-midnight-200 dark:bg-midnight-700" />
            <span className="text-midnight-700 dark:text-slate-400 text-sm">{product.viewCount || 0} views</span>
          </div>

          <div className="flex items-end gap-4 mb-8 pb-8 border-b border-midnight-100 dark:border-white/5">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-midnight-400 dark:text-slate-500 line-through font-semibold text-lg">
                  ${originalPrice}
                </span>
              )}
              <span className="text-5xl font-serif font-bold text-midnight-900 dark:text-white leading-none">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-midnight-900 dark:text-white uppercase tracking-wider">1 Year Warranty</p>
                <p className="text-xs text-midnight-500 dark:text-slate-400 mt-0.5">Official Guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-500">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-midnight-900 dark:text-white uppercase tracking-wider">Fast Delivery</p>
                <p className="text-xs text-midnight-500 dark:text-slate-400 mt-0.5">Ships in 24 hours</p>
              </div>
            </div>
          </div>

          {/* Add to Cart Area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-auto p-6 rounded-2xl bg-midnight-50 dark:bg-midnight-800/50 border border-midnight-100 dark:border-midnight-700">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-sm font-bold text-midnight-900 dark:text-white uppercase tracking-widest">Quantity</span>
              <div className="flex items-center bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-midnight-700 rounded-xl overflow-hidden h-12">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center text-midnight-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-50 dark:hover:bg-midnight-800 transition-colors text-lg font-medium">−</button>
                <span className="w-12 text-center text-midnight-900 dark:text-white font-bold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQty, q + 1))} className="w-12 h-full flex items-center justify-center text-midnight-500 dark:text-slate-400 hover:text-midnight-900 dark:hover:text-white hover:bg-midnight-50 dark:hover:bg-midnight-800 transition-colors text-lg font-medium">+</button>
              </div>
            </div>
            
            <button onClick={handleAdd} disabled={!inStock || adding} className="btn-primary flex-1 h-12 text-sm">
              <ShoppingCart size={18} />
              {adding ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
          
          {msg && (
            <p className={`text-sm font-bold mt-4 px-4 py-3 rounded-xl border ${msg.startsWith('✓') ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/10 text-red-600 border-red-200 dark:border-red-900/30'}`}>
              {msg}
            </p>
          )}

          {/* Description & Specs Tabs */}
          <div className="mt-12 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-midnight-900 dark:text-white uppercase tracking-widest border-b border-midnight-100 dark:border-midnight-800 pb-3 mb-4">Description</h3>
              <p className="text-midnight-700 dark:text-slate-300 text-sm leading-relaxed">{product.description || 'No description available.'}</p>
            </div>
            
            {product.specs && (
              <div>
                <h3 className="text-lg font-bold text-midnight-900 dark:text-white uppercase tracking-widest border-b border-midnight-100 dark:border-midnight-800 pb-3 mb-4">Specifications</h3>
                <div className="text-sm text-midnight-700 dark:text-slate-300 bg-midnight-50 dark:bg-midnight-800/30 rounded-xl p-5 border border-midnight-100 dark:border-midnight-800 leading-relaxed whitespace-pre-line">
                  {product.specs}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 card-glass p-8">
        <h2 className="text-xl font-bold text-midnight-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-widest border-b border-midnight-100 dark:border-midnight-800 pb-4">
          <Star size={24} className="text-gold-500 fill-gold-500" /> Customer Reviews
        </h2>

        {isLoggedIn && (
          <form onSubmit={submitReview} className="mb-10 p-6 rounded-2xl bg-midnight-50 dark:bg-midnight-800/50 border border-midnight-100 dark:border-midnight-700 space-y-4">
            <p className="text-sm text-midnight-900 dark:text-white font-bold uppercase tracking-widest">Write a review</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-midnight-500 dark:text-slate-400 uppercase tracking-widest font-bold">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                    className={`text-2xl transition-colors hover:scale-110 ${n <= reviewForm.rating ? 'text-gold-500' : 'text-midnight-200 dark:text-slate-600'}`}>★</button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewForm.reviewText}
              onChange={e => setReviewForm(f => ({ ...f, reviewText: e.target.value }))}
              placeholder="Share your experience with this product…"
              rows={4}
              className="input-premium resize-none"
            />
            {reviewMsg && <p className={`text-sm font-bold ${reviewMsg.startsWith('✓') ? 'text-emerald-500' : 'text-red-500'}`}>{reviewMsg}</p>}
            <button type="submit" disabled={submitting} className="btn-secondary py-2.5 px-6 text-sm">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        {ratings.length === 0 ? (
          <div className="text-center py-10 bg-midnight-50 dark:bg-midnight-800/30 rounded-2xl border border-dashed border-midnight-200 dark:border-midnight-700">
            <p className="text-midnight-500 dark:text-slate-400 text-sm font-medium">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {ratings.map(r => (
              <div key={r.ratingId} className="p-6 rounded-2xl bg-white dark:bg-midnight-800/80 border border-midnight-100 dark:border-midnight-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-midnight-900 dark:text-white font-bold text-sm">{r.userName ?? 'Customer'}</span>
                  <StarRating rating={r.rating} size={14} />
                </div>
                {r.reviewText && <p className="text-midnight-700 dark:text-slate-300 text-sm leading-relaxed">{r.reviewText}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
