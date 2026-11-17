import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Info, KeyRound, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PASSWORD } from '../../data/demoData';
import { isValidEmail } from '../../utils/formatters';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { users, showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResult, setForgotResult] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const res = login({ email, password, remember });
    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.user?.role === 'student') navigate('/student/dashboard');
    else if (res.user?.role === 'client') navigate('/client/dashboard');
    else if (res.user?.role === 'admin') navigate('/admin/dashboard');
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(forgotEmail)) {
      setForgotResult('Please enter a valid email address.');
      return;
    }
    const found = users.find(
      (u) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase()
    );
    if (!found) {
      setForgotResult('No demonstration account matches that email address.');
      return;
    }
    setForgotResult(
      `Demonstration reset verified for ${found.email}. Shared demo password is "${DEMO_PASSWORD}" (or current password: "${found.password}").`
    );
    showToast('Password recovery details displayed', 'info');
  };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Login Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sign In to SkillBridge</h1>
              <p className="mt-1 text-sm text-slate-600">
                Access your student, client, or administrator workspace.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotResult('');
                      setForgotOpen(true);
                    }}
                    className="text-xs font-medium text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                Remember session across browser refreshes
              </label>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>

            <p className="text-xs text-slate-600 text-center pt-2 border-t border-slate-100">
              Don’t have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-700 hover:underline">
                Create a Student or Client Account
              </Link>
            </p>
          </div>

          {/* Demo Accounts Sidebar */}
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Demonstration Accounts
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Click any role below to populate demo credentials. Shared demo password:{' '}
                  <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">
                    {DEMO_PASSWORD}
                  </code>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  role: 'Student Demo',
                  name: 'Maya Lin (Pacific Tech Univ.)',
                  email: 'student@skillbridge.demo',
                },
                {
                  role: 'Client Demo',
                  name: 'David Thorne (Northstar Commerce)',
                  email: 'client@skillbridge.demo',
                },
                {
                  role: 'Administrator Demo',
                  name: 'Elena Vance (Platform Admin)',
                  email: 'admin@skillbridge.demo',
                },
              ].map((acc) => (
                <div
                  key={acc.email}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{acc.role}</div>
                    <div className="text-xs text-slate-600 truncate">{acc.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      {acc.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillDemo(acc.email)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg shrink-0 transition-colors"
                  >
                    Fill
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-slate-100 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Demonstration-only authentication: credentials and sessions are stored in browser
                LocalStorage and do not provide production-grade security.
              </span>
            </div>
          </aside>
        </div>
      </div>

      {/* Forgot Password Demo Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Password Recovery (Demo)
              </h3>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                aria-label="Close modal"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Because SkillBridge runs offline in browser LocalStorage without an email server,
              enter your account email below to verify your demonstration password.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter account email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {forgotResult && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  {forgotResult}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Verify Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};
