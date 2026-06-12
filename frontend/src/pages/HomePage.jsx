import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones } from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const FEATURES = [
  { icon: Zap,        title: 'Latest Tech',    desc: 'Cutting-edge electronics from top brands.' },
  { icon: Shield,     title: 'Secure Checkout', desc: 'Your data is protected end-to-end.' },
  { icon: Truck,      title: 'Fast Shipping',   desc: 'Get it delivered the next business day.' },
  { icon: Headphones, title: '24/7 Support',    desc: 'Expert help whenever you need it.' },
];

export default function HomePage() {
  const [featured,    setFeatured]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loadingProds,setLoadingProds]= useState(true);

  useEffect(() => {
    productApi.getAll().then(r => setFeatured((r.data ?? []).slice(0, 8))).catch(() => {}).finally(() => setLoadingProds(false));
    categoryApi.getAll().then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in-up">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center px-4 bg-gradient-to-br from-midnight-50 to-white dark:from-midnight-900 dark:via-obsidian-900 dark:to-midnight-800">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gold-500/10 blur-[100px] animate-pulse-glow" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-16 py-20">
          
          {/* Left Text */}
          <div className="flex flex-col items-start text-left z-10">
            <span className="badge-gold mb-6 px-4 py-1.5 text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-gold-500 mr-2 animate-pulse"></span>
              NEW SEASON · PREMIUM GEAR
            </span>
            <h1 className="heading-serif text-6xl sm:text-7xl lg:text-8xl leading-[1.1] mb-6 text-midnight-900 dark:text-white">
              The Future <br/>
              <span className="bg-gradient-to-r from-gold-600 to-gold-400 dark:from-gold-400 dark:to-gold-200 bg-clip-text text-transparent italic">
                of Tech
              </span>
            </h1>
            <p className="text-midnight-700 dark:text-slate-400 text-lg sm:text-xl max-w-xl mb-10 font-sans leading-relaxed">
              Explore the latest premium laptops, phones, and accessories. Curated for enthusiasts, designed for professionals. Elevate your workspace today.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/shop" className="btn-primary text-base px-8 py-4">
                Explore Collection <ArrowRight size={20} />
              </Link>
              <Link to="/shop" className="btn-secondary text-base px-8 py-4">
                View Categories
              </Link>
            </div>
            
            <div className="flex gap-10 mt-16 border-t border-midnight-200 dark:border-white/10 pt-8 w-full max-w-md">
              <div><div className="text-3xl font-bold font-serif text-midnight-900 dark:text-white">10k+</div><div className="text-xs text-midnight-700 dark:text-slate-400 uppercase tracking-widest mt-1">Customers</div></div>
              <div><div className="text-3xl font-bold font-serif text-midnight-900 dark:text-white">500+</div><div className="text-xs text-midnight-700 dark:text-slate-400 uppercase tracking-widest mt-1">Products</div></div>
              <div><div className="text-3xl font-bold font-serif text-midnight-900 dark:text-white">4.9/5</div><div className="text-xs text-midnight-700 dark:text-slate-400 uppercase tracking-widest mt-1">Rating</div></div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full h-[500px] lg:h-[700px] flex justify-center items-center z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/20 to-transparent rounded-[40px] transform rotate-3 scale-105 backdrop-blur-3xl"></div>
            <img 
              src="/banner.png" 
              alt="Premium Workspace" 
              className="relative w-full h-full object-cover rounded-[40px] shadow-2xl shadow-midnight-900/50 dark:shadow-black/80"
            />
          </div>

        </div>
        
        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center flex flex-col items-center opacity-60">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-midnight-700 dark:text-slate-400 mb-2">Scroll to Explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-midnight-700 dark:from-slate-400 to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-white dark:bg-obsidian-900 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-glass p-8 flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-gold-500/10 dark:bg-gold-500/5 border border-gold-500/20">
                <Icon size={24} className="text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <p className="text-midnight-900 dark:text-white font-bold text-lg mb-1">{title}</p>
                <p className="text-midnight-700 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-20 px-4 bg-midnight-50 dark:bg-obsidian-800 border-y border-midnight-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="heading-serif text-4xl text-midnight-900 dark:text-white mb-10">Shop by Category</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.categoryId}
                  to={`/shop?category=${cat.categoryId}`}
                  className="px-6 py-3 rounded-full bg-white dark:bg-midnight-900 border border-midnight-200 dark:border-white/10
                             text-midnight-700 dark:text-slate-300 hover:text-midnight-900 dark:hover:text-white hover:border-gold-500 hover:bg-gold-500/5
                             text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      <section className="py-24 px-4 bg-white dark:bg-midnight-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-gold-500 font-bold tracking-widest text-sm uppercase mb-2 block">Curated Collection</span>
              <h2 className="heading-serif text-4xl md:text-5xl text-midnight-900 dark:text-white">Featured Products</h2>
            </div>
            <Link to="/shop" className="text-midnight-700 dark:text-slate-300 hover:text-gold-500 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loadingProds ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="card-glass h-[400px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
