import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Cpu } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'name',  label: 'Full name',     type: 'text',  icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 rounded-2xl bg-brand-600/20 mb-4">
              <Cpu size={32} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-slate-400 text-sm mt-1">Join TechStore today</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {fields.map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name={name} type={type} value={form[name]} onChange={handle}
                    placeholder={placeholder} className="input pl-9"
                    required={name === 'name' || name === 'email'} />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="password" type={showPwd ? 'text' : 'password'} required
                  value={form.password} onChange={handle} placeholder="Min 8 chars, upper + digit" className="input pl-9 pr-10" />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">You can add your phone and address later in your profile.</p>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
