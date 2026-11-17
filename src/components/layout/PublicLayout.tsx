import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const dashboardPath =
    currentUser?.role === 'student'
      ? '/student/dashboard'
      : currentUser?.role === 'client'
      ? '/client/dashboard'
      : currentUser?.role === 'admin'
      ? '/admin/dashboard'
      : '/login';

  const navLinks = [
    { label: 'Explore Projects', to: '/explore' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'About', to: '/about' },
    ...(!currentUser ? [{ label: 'Sign In', to: '/login' }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
          >
            SkillBridge
          </Link>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                    active ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="hidden md:flex items-center shrink-0">
            {currentUser ? (
              <Link
                to={dashboardPath}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Open Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <Link
                to={currentUser ? dashboardPath : '/register'}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                {currentUser ? 'Open Dashboard' : 'Get Started'}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="text-lg font-bold text-white tracking-tight font-display">
                SkillBridge
              </Link>
              <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
                Your Skills. Your Opportunities. A university student freelancing and project
                marketplace connecting emerging digital talent with businesses and startups.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Capstone Demonstration Platform · Browser LocalStorage Persistence · Demo Authentication Only
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Marketplace</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/explore" className="hover:text-white transition-colors">
                    Explore Projects
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About SkillBridge
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Accounts</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/register?role=student" className="hover:text-white transition-colors">
                    Join as a Student
                  </Link>
                </li>
                <li>
                  <Link to="/register?role=client" className="hover:text-white transition-colors">
                    Hire Student Talent
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Sign In / Demo Access
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 SkillBridge Capstone Project. All rights reserved.</p>
            <p>Local browser persistence enabled · Zero external servers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
