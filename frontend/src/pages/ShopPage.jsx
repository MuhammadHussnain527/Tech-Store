import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [keyword,     setKeyword]     = useState(searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await productApi.search(keyword.trim());
      } else if (activeCategory) {
        res = await productApi.byCategory(activeCategory);
      } else {
        res = await productApi.getAll();
      }
      setProducts(res.data ?? []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [keyword, activeCategory]);

  useEffect(() => { categoryApi.getAll().then(r => setCategories(r.data ?? [])).catch(() => {}); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = e => {
    e.preventDefault();
    setActiveCategory(null);
    setSearchParams(keyword ? { q: keyword } : {});
  };

  const handleCategory = id => {
    setKeyword('');
    setActiveCategory(id);
    setSearchParams(id ? { category: id } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-gold-500 font-bold tracking-widest text-sm uppercase mb-2 block">Our Collection</span>
          <h1 className="heading-serif text-5xl text-midnight-900 dark:text-white">Shop</h1>
          <p className="text-midnight-700 dark:text-slate-400 text-sm mt-3 font-sans">{products.length} products found matching your criteria</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-400 dark:text-slate-500" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search premium products…"
              className="input-premium pl-12"
            />
          </div>
          <button type="submit" className="btn-primary px-5">
            <SlidersHorizontal size={18} />
          </button>
        </form>
      </div>

      {/* Categories filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => handleCategory(null)}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              !activeCategory ? 'bg-gold-500 text-midnight-900 border border-gold-500 shadow-lg shadow-gold-500/20' : 'bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-white/10 text-midnight-700 dark:text-slate-300 hover:border-gold-500 hover:text-gold-500'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.categoryId}
              onClick={() => handleCategory(cat.categoryId)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                activeCategory === cat.categoryId
                  ? 'bg-gold-500 text-midnight-900 border border-gold-500 shadow-lg shadow-gold-500/20'
                  : 'bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-white/10 text-midnight-700 dark:text-slate-300 hover:border-gold-500 hover:text-gold-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {(keyword || activeCategory) && (
            <button
              onClick={() => { setKeyword(''); setActiveCategory(null); setSearchParams({}); }}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="card-glass h-[400px] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-midnight-400 dark:text-slate-500">
          <Search size={56} className="mb-6 opacity-30" />
          <p className="heading-serif text-2xl text-midnight-900 dark:text-white">No products found</p>
          <p className="text-sm mt-2 font-sans">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => <ProductCard key={p.productId} product={p} />)}
        </div>
      )}
    </div>
  );
}
