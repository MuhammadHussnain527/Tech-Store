import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=success
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email.trim()) return 'Email is required.';
    if (!form.newPassword)   return 'New password is required.';
    if (form.newPassword.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.newPassword)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(form.newPassword)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(form.newPassword)) return 'Password must contain at least one digit.';
    if (form.newPassword !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const submit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(form.email.trim().toLowerCase(), form.newPassword);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[a-z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  })();

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'][strength];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-surface-950 via-midnight-900 to-obsidian-900 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-600/5 blur-[100px]" />

      <div className="w-full max-w-md z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="card-glass p-8 shadow-2xl border border-white/10 rounded-2xl" style={{background: 'rgba(11,15,25,0.85)', backdropFilter: 'blur(20px)'}}>

          {step === 1 ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-5">
                  <KeyRound size={32} className="text-gold-400" />
                </div>
                <h1 className="text-2xl font-bold text-white font-serif">Reset Password</h1>
                <p className="text-slate-400 text-sm mt-2 text-center leading-relaxed">
                  Enter your registered email and choose a new password.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-400 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="fp-email"
                      name="email" type="email" required
                      value={form.email} onChange={handle}
                      placeholder="you@example.com"
                      className="input pl-9 bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="fp-new-password"
                      name="newPassword" type={showPwd ? 'text' : 'password'} required
                      value={form.newPassword} onChange={handle}
                      placeholder="Min. 8 chars, A-Z, a-z, 0-9"
                      className="input pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-gold-500"
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {form.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="fp-confirm-password"
                      name="confirmPassword" type={showConfirm ? 'text' : 'password'} required
                      value={form.confirmPassword} onChange={handle}
                      placeholder="Repeat new password"
                      className={`input pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-gold-500 ${
                        form.confirmPassword && form.confirmPassword !== form.newPassword ? 'border-red-500/50' : ''
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  id="fp-submit"
                  type="submit" disabled={loading}
                  className="btn-primary w-full mt-2 py-3"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Resetting…
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-gold-400 hover:text-gold-300 font-semibold">Sign in</Link>
              </p>
            </>
          ) : (
            /* Success screen */
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 size={44} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-serif mb-3">Password Reset!</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
