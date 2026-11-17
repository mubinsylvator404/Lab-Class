import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';

export const HowItWorksPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-blue-700">Marketplace Workflow</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How SkillBridge Connects Talent & Businesses
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Whether you are a university student building practical experience or a business
            publishing a technical brief, SkillBridge keeps every step transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-xl p-7 space-y-5">
            <h2 className="text-xl font-bold text-slate-900">For University Students</h2>
            <ol className="space-y-4 text-sm">
              {[
                {
                  step: '01. Create Your Skill Profile',
                  desc: 'Register as a student, add your university, department, biography, and verify your technical and creative skills with proficiency tiers.',
                },
                {
                  step: '02. Publish Portfolio Case Studies',
                  desc: 'Upload project previews, technologies used, GitHub links, and live demos to strengthen client confidence.',
                },
                {
                  step: '03. Review Skill-Matched Projects',
                  desc: 'Inspect your deterministic compatibility percentage on every published project and apply with your proposed rate and timeline.',
                },
                {
                  step: '04. Track Status & Build Reviews',
                  desc: 'Receive instant in-app notifications as clients shortlist or accept your proposal, and exchange verified ratings on completion.',
                },
              ].map((item) => (
                <li key={item.step} className="space-y-1">
                  <div className="font-semibold text-slate-900">{item.step}</div>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </li>
              ))}
            </ol>
            <div className="pt-2">
              <Link
                to="/register?role=student"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Join as a Student
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-7 space-y-5">
            <h2 className="text-xl font-bold text-slate-900">For Startups & Clients</h2>
            <ol className="space-y-4 text-sm">
              {[
                {
                  step: '01. Publish a Structured Brief',
                  desc: 'Specify your required skills, budget model (Fixed Price or Hourly), deadline, and target experience level. Save drafts or publish live.',
                },
                {
                  step: '02. Discover Ranked Student Matches',
                  desc: 'Immediately after publishing, open Recommended Students to see every registered student ranked by skill compatibility and rating.',
                },
                {
                  step: '03. Evaluate Proposals & Portfolios',
                  desc: 'Review cover letters, proposed budgets, and student portfolio projects in one unified applicant view.',
                },
                {
                  step: '04. Manage Milestones & Rate Work',
                  desc: 'Update statuses from Under Review to Shortlisted and Accepted, mark projects completed, and leave a two-way review.',
                },
              ].map((item) => (
                <li key={item.step} className="space-y-1">
                  <div className="font-semibold text-slate-900">{item.step}</div>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </li>
              ))}
            </ol>
            <div className="pt-2">
              <Link
                to="/register?role=client"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
              >
                Register as a Client
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Deterministic Matching Explanation */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <CheckCircle2 className="w-4 h-4" />
            Transparent Matching Formula
          </div>
          <h2 className="text-2xl font-bold">How Compatibility Percentages Are Calculated</h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            SkillBridge computes every match deterministically in your browser without opaque AI
            scoring. Required project skills are compared case-insensitively and deduplicated
            against each student’s verified skill list:
          </p>
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 font-mono text-xs sm:text-sm text-blue-200 tabular-nums">
            Match Percentage = (Number of Matching Required Skills / Total Required Skills) × 100
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
