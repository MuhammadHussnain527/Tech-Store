import { Link } from 'react-router-dom';
import { Cpu, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-midnight-900 border-t border-midnight-200 dark:border-midnight-800 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 font-serif font-bold text-2xl tracking-widest text-midnight-900 dark:text-white mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-midnight-900 shadow-lg shadow-gold-500/20">
                <Cpu size={20} strokeWidth={2.5} />
              </div>
              TECHSTORE
            </Link>
            <p className="text-midnight-700 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              Premium electronics & tech gear curated for enthusiasts and professionals. Elevate your workspace.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-midnight-900 dark:text-white font-bold text-xs tracking-widest uppercase mb-5">Shop</h3>
            <ul className="space-y-3">
              {[['Shop All', '/shop'], ['Cart', '/cart'], ['My Orders', '/orders']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-midnight-700 dark:text-slate-400 hover:text-gold-500 text-sm font-medium transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="text-midnight-900 dark:text-white font-bold text-xs tracking-widest uppercase mb-5">Account</h3>
            <ul className="space-y-3">
              {[['Login', '/login'], ['Register', '/register'], ['Profile', '/profile']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-midnight-700 dark:text-slate-400 hover:text-gold-500 text-sm font-medium transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-14 pt-8 border-t border-midnight-200 dark:border-midnight-800">
          <p className="text-midnight-400 dark:text-slate-500 text-xs tracking-widest uppercase">© {new Date().getFullYear()} TechStore. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-midnight-400 dark:text-slate-500 hover:text-gold-500 transition-colors duration-300"><ExternalLink size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
