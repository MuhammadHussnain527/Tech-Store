import { useEffect, useState } from 'react';
import { Heart, Tag } from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminWishlists() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = () => {
    setLoading(true);
    adminApi.getAllWishlists()
      .then(res => setWishlists(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleApplyDiscount = async (productId, currentProductName) => {
    const pct = prompt(`Enter new discount percentage for ${currentProductName} (0-100):`);
    if (!pct) return;
    const num = parseInt(pct, 10);
    if (isNaN(num) || num < 0 || num > 100) return alert('Invalid percentage');
    
    try {
      await adminApi.updateDiscount(productId, num);
      alert('Discount applied successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-midnight-900 dark:text-white">Customer Wishlists</h1>
        <p className="text-slate-500 text-sm mt-1">Track products that customers are interested in</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-midnight-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : wishlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Heart size={48} className="mb-4 opacity-30" />
          <p className="font-serif text-xl text-midnight-900 dark:text-white">No wishlists found</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-midnight-200 dark:border-white/5 overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-midnight-200 dark:border-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Added On</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlists.map((w, idx) => (
                  <tr key={idx} className="border-b border-white/3 hover:bg-midnight-50 dark:hover:bg-white/5 dark:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-midnight-900 dark:text-white font-semibold">{w.userName}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{w.userEmail}</td>
                    <td className="px-6 py-4 text-midnight-900 dark:text-white font-semibold max-w-[200px] truncate" title={w.productName}>
                      {w.productName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(w.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleApplyDiscount(w.productId, w.productName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 hover:bg-gold-500/20 transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Tag size={12} /> Discount
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
