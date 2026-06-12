import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, LockIcon, Eye, EyeOff, Cpu } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(user?.role === 'ADMIN' ? '/admin-panel' : '/');
    }
  }, [isLoggedIn, navigate, user]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const loggedUser = await login(form.email, form.password);
      navigate(loggedUser?.role === 'ADMIN' ? '/admin-panel' : '/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 rounded-2xl bg-brand-600/20 mb-4">
              <Cpu size={32} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your TechStore account</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="email" type="email" required value={form.email} onChange={handle}
                  placeholder="you@example.com" className="input pl-9" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-slate-400 font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-gold-400 hover:text-gold-300 font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <LockIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="password" type={showPwd ? 'text' : 'password'} required
                  value={form.password} onChange={handle} placeholder="••••••••" className="input pl-9 pr-10" />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            No account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
