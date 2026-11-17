import React, { useState } from 'react';
import { AlertCircle, Briefcase, GraduationCap, Info } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/formatters';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole =
    searchParams.get('role') === 'client' ? 'client' : 'student';

  const [role, setRole] = useState<'student' | 'client'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All required fields must be completed.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    const res = register({
      name,
      email,
      password,
      role,
      university,
      department,
      companyName,
    });

    if (res.error) {
      setError(res.error);
      return;
    }

    if (role === 'student') {
      navigate('/student/profile');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create a SkillBridge Account</h1>
            <p className="mt-1 text-sm text-slate-600">
              Select your role to get started. Administrator accounts cannot be created via public
              registration.
            </p>
          </div>

          {/* Account Type Selector (Student / Client only) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                role === 'student'
                  ? 'bg-blue-50 border-blue-600 text-blue-950'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <GraduationCap
                className={`w-5 h-5 mb-1.5 ${
                  role === 'student' ? 'text-blue-700' : 'text-slate-500'
                }`}
              />
              <div className="text-sm font-semibold">Student</div>
              <div className="text-xs text-slate-500">Find projects & build portfolio</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                role === 'client'
                  ? 'bg-blue-50 border-blue-600 text-blue-950'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Briefcase
                className={`w-5 h-5 mb-1.5 ${
                  role === 'client' ? 'text-blue-700' : 'text-slate-500'
                }`}
              />
              <div className="text-sm font-semibold">Client</div>
              <div className="text-xs text-slate-500">Publish projects & hire talent</div>
            </button>
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
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Taylor"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@university.edu"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {role === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    University
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Pacific Tech University"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Ventures"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Demonstration Notice: Accounts are stored locally in your browser via LocalStorage.
                Do not reuse sensitive real-world passwords.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Create {role === 'student' ? 'Student' : 'Client'} Account
            </button>
          </form>

          <p className="text-xs text-slate-600 text-center pt-2 border-t border-slate-100">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};
