import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-asc',   label: 'Name: A → Z' },
  { value: 'name-desc',  label: 'Name: Z → A' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [keyword,     setKeyword]     = useState(searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice,    setMinPrice]    = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [sortBy,      setSortBy]      = useState('default');
  const [showSort,    setShowSort]    = useState(false);

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

  // Compute price bounds from loaded products
  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 999999 };
    const prices = products.map(p => Number(p.price));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  // Apply filters + sort client-side
  const displayed = useMemo(() => {
    let list = [...products];

    // Price filter
    const lo = minPrice !== '' ? Number(minPrice) : null;
    const hi = maxPrice !== '' ? Number(maxPrice) : null;
    if (lo !== null) list = list.filter(p => Number(p.price) >= lo);
    if (hi !== null) list = list.filter(p => Number(p.price) <= hi);

    // Sort
    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price-desc': list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name));      break;
      case 'name-desc':  list.sort((a, b) => b.name.localeCompare(a.name));      break;
      case 'rating':     list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)); break;
      default: break;
    }
    return list;
  }, [products, minPrice, maxPrice, sortBy]);

  const hasFilters = minPrice !== '' || maxPrice !== '' || sortBy !== 'default';
  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setSortBy('default'); };

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

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-gold-500 font-bold tracking-widest text-sm uppercase mb-2 block">Our Collection</span>
          <h1 className="heading-serif text-5xl text-midnight-900 dark:text-white">Shop</h1>
          <p className="text-midnight-700 dark:text-slate-400 text-sm mt-2 font-sans">
            {loading ? 'Loading…' : `${displayed.length} product${displayed.length !== 1 ? 's' : ''} found`}
            {hasFilters && <span className="ml-2 text-gold-500 font-semibold">(filtered)</span>}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-400 dark:text-slate-500" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search products…"
              className="input-premium pl-11"
            />
          </div>
          <button type="submit" className="btn-primary px-5">
            <SlidersHorizontal size={16} />
          </button>
        </form>
      </div>

      {/* Toolbar: Categories + Filter toggle + Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => handleCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              !activeCategory
                ? 'bg-gold-500 text-midnight-900 border border-gold-500 shadow-lg shadow-gold-500/20'
                : 'bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-white/10 text-midnight-700 dark:text-slate-300 hover:border-gold-500 hover:text-gold-500'
            }`}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat.categoryId}
              onClick={() => handleCategory(cat.categoryId)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                activeCategory === cat.categoryId
                  ? 'bg-gold-500 text-midnight-900 border border-gold-500 shadow-lg shadow-gold-500/20'
                  : 'bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-white/10 text-midnight-700 dark:text-slate-300 hover:border-gold-500 hover:text-gold-500'
              }`}
            >{cat.name}</button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-midnight-200 dark:border-white/10 bg-white dark:bg-midnight-900 text-midnight-700 dark:text-slate-300 hover:border-gold-500 text-xs font-bold uppercase tracking-widest transition-all"
          >
            <ArrowUpDown size={13} />
            {currentSortLabel}
            <ChevronDown size={13} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-midnight-800 border border-midnight-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-midnight-50 dark:hover:bg-white/5 ${
                    sortBy === opt.value ? 'text-gold-500' : 'text-midnight-700 dark:text-slate-300'
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(s => !s)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
            showFilters || hasFilters
              ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
              : 'border-midnight-200 dark:border-white/10 bg-white dark:bg-midnight-900 text-midnight-700 dark:text-slate-300 hover:border-gold-500'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && <span className="w-4 h-4 rounded-full bg-gold-500 text-midnight-900 text-[10px] font-black flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card-glass p-5 rounded-2xl mb-6 border border-gold-500/10">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-midnight-700 dark:text-slate-400 uppercase tracking-widest mb-3">
                Price Range (PKR)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">Min</span>
                  <input
                    type="number" min={0} value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder={priceBounds.min.toLocaleString()}
                    className="input-premium pl-10 text-sm"
                  />
                </div>
                <span className="text-slate-400 font-bold">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">Max</span>
                  <input
                    type="number" min={0} value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder={priceBounds.max.toLocaleString()}
                    className="input-premium pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Quick price presets */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: 'Under 5K',   min: '',      max: '5000' },
                  { label: '5K–20K',     min: '5000',  max: '20000' },
                  { label: '20K–50K',    min: '20000', max: '50000' },
                  { label: 'Over 50K',   min: '50000', max: '' },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setMinPrice(p.min); setMaxPrice(p.max); }}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      minPrice === p.min && maxPrice === p.max
                        ? 'bg-gold-500/15 text-gold-500 border-gold-500/30'
                        : 'bg-white dark:bg-midnight-900 border-midnight-200 dark:border-white/10 text-midnight-700 dark:text-slate-400 hover:border-gold-500/40'
                    }`}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 hover:bg-red-100 transition-all">
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clear active search/category */}
      {(keyword || activeCategory) && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-slate-400">Active filter:</span>
          <button
            onClick={() => { setKeyword(''); setActiveCategory(null); setSearchParams({}); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 hover:bg-red-100 transition-all"
          >
            <X size={11} />
            {keyword ? `"${keyword}"` : `Category #${activeCategory}`}
          </button>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-glass h-[400px] animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-midnight-400 dark:text-slate-500">
          <Search size={56} className="mb-6 opacity-20" />
          <p className="heading-serif text-2xl text-midnight-900 dark:text-white">No products found</p>
          <p className="text-sm mt-2 font-sans">Try adjusting your search, category, or price filter</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 btn-primary text-sm">Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayed.map((p, i) => (
            <div key={p.productId} style={{ animation: `fade-in-up 0.4s ${i * 0.04}s ease-out both` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
