import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';

export const AboutPage: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold text-blue-700">About SkillBridge</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Bridging University Talent and Real-World Digital Projects
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SkillBridge was designed as a Software Engineering Design Capstone marketplace
              platform to address two connected challenges: university students need real-world
              production experience before graduation, while startups and local businesses need
              dependable technical and creative talent.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              By pairing structured student skill profiles and verified portfolios with
              transparent compatibility matching, both sides save time and collaborate with clear
              expectations from day one.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Explore Marketplace
              </Link>
              <Link
                to="/login"
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
              >
                Try Demo Accounts
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9]">
              {!imgError ? (
                <img
                  src="/src/assets/images/about_collaboration_1794886464240.jpg"
                  alt="University creators and a founder reviewing UI wireframes together"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
                  SkillBridge Collaboration Studio
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Architecture & Security Documentation Notice */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 sm:p-8 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-amber-950">
              Capstone Demonstration Architecture & LocalStorage Security Notice
            </h2>
            <p className="text-sm text-amber-900 leading-relaxed">
              This application runs 100% client-side in your browser using React, TypeScript, and
              the Web Storage API (<code className="font-mono text-xs">localStorage</code>). All
              authentication flows, role-based dashboards, skill matching calculations,
              notifications, reviews, and administrative analytics operate locally without a
              backend server or external database.
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Note: Authentication is simulated solely for academic demonstration purposes. Browser
              LocalStorage is not encrypted and does not provide production-grade security. Never
              enter real personal passwords or sensitive credentials.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
