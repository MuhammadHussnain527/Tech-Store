import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Star } from 'lucide-react';
import { productApi, ratingApi, resolveImageUrl } from '../services/api';
import StarRating from '../components/StarRating';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();

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
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return null;

  const inStock = product.stockQty > 0;
  const imgSrc = resolveImageUrl(product.imageUrl);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="card p-4 flex items-center justify-center min-h-80 bg-surface-900">
          {imgSrc
            ? <img src={imgSrc} alt={product.name} className="max-h-96 object-contain rounded-xl" />
            : <Package size={80} className="text-slate-600" />
          }
        </div>

        <div className="flex flex-col gap-5">
          {product.brand && <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">{product.brand}</span>}
          <h1 className="text-3xl font-bold text-white leading-snug">{product.name}</h1>

          <div className="flex items-center gap-3">
            <StarRating rating={product.averageRating ?? 0} size={18} />
            <span className="text-slate-400 text-sm">({Number(product.averageRating ?? 0).toFixed(1)}) · {ratings.length} review{ratings.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="text-4xl font-extrabold text-white">${Number(product.price).toFixed(2)}</div>

          {inStock
            ? <span className="badge-green text-sm px-3 py-1 w-fit">In stock · {product.stockQty} left</span>
            : <span className="badge-red   text-sm px-3 py-1 w-fit">Out of stock</span>
          }

          {product.description && (
            <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-4">{product.description}</p>
          )}

          {product.specs && (
            <div className="text-sm text-slate-400 bg-surface-800 rounded-xl p-4 border border-slate-700 leading-relaxed whitespace-pre-line">
              {product.specs}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 bg-surface-800 border border-slate-700 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-surface-700 transition-colors text-lg">−</button>
              <span className="w-10 text-center text-white font-semibold text-sm">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stockQty, q + 1))}
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-surface-700 transition-colors text-lg">+</button>
            </div>
            <button onClick={handleAdd} disabled={!inStock || adding} className="btn-primary flex-1">
              <ShoppingCart size={18} />
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>

          {msg && <p className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-12 card p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Star size={20} className="text-brand-400" /> Customer Reviews
        </h2>

        {isLoggedIn && (
          <form onSubmit={submitReview} className="mb-8 p-4 rounded-xl bg-surface-800 border border-slate-700 space-y-3">
            <p className="text-sm text-slate-300 font-medium">Write a review</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rating:</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                  className={`text-lg ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-600'}`}>★</button>
              ))}
            </div>
            <textarea
              value={reviewForm.reviewText}
              onChange={e => setReviewForm(f => ({ ...f, reviewText: e.target.value }))}
              placeholder="Share your experience with this product…"
              rows={3}
              className="input resize-none"
            />
            {reviewMsg && <p className={`text-sm ${reviewMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{reviewMsg}</p>}
            <button type="submit" disabled={submitting} className="btn-primary py-2 px-4 text-sm">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        {ratings.length === 0 ? (
          <p className="text-slate-400 text-sm">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {ratings.map(r => (
              <div key={r.ratingId} className="p-4 rounded-xl bg-surface-800 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{r.userName ?? 'Customer'}</span>
                  <StarRating rating={r.rating} size={14} />
                </div>
                {r.reviewText && <p className="text-slate-300 text-sm">{r.reviewText}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
