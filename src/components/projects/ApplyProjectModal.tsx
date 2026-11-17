import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ApplyProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyProjectModal: React.FC<ApplyProjectModalProps> = ({
  project,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { submitApplication, applications } = useApp();

  const [coverLetter, setCoverLetter] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [proposedPrice, setProposedPrice] = useState('');
  const [completionTime, setCompletionTime] = useState('2 weeks');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setProposedPrice(String(project.budget));
      setCompletionTime(project.duration || '2 weeks');
      const studentSkillNames = (currentUser?.studentProfile?.skills || []).map((s) =>
        s.name.toLowerCase()
      );
      const prematched = project.requiredSkills.filter((req) =>
        studentSkillNames.includes(req.toLowerCase())
      );
      setSelectedSkills(prematched);
      setCoverLetter('');
      setRelevantExperience('');
      setError('');
    }
  }, [project, currentUser]);

  if (!project) return null;

  const isStudent = currentUser?.role === 'student';
  const profileCompleted = Boolean(currentUser?.studentProfile?.profileCompleted);
  const alreadyApplied = currentUser
    ? applications.some(
        (a) =>
          a.projectId === project.id &&
          a.studentId === currentUser.id &&
          a.status !== 'Withdrawn'
      )
    : false;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser || !isStudent) {
      setError('Please sign in with a Student account to submit an application.');
      return;
    }
    if (!profileCompleted) {
      setError(
        'Please complete your student profile (university, department, bio, and skills) before applying.'
      );
      return;
    }
    if (coverLetter.trim().length < 20) {
      setError('Please write a cover letter of at least 20 characters.');
      return;
    }
    if (!relevantExperience.trim()) {
      setError('Please summarize your relevant experience.');
      return;
    }
    const priceNum = Number(proposedPrice);
    if (!priceNum || priceNum <= 0) {
      setError('Please enter a valid proposed price greater than $0.');
      return;
    }
    if (!completionTime.trim()) {
      setError('Please provide an estimated completion time.');
      return;
    }

    const res = submitApplication({
      projectId: project.id,
      studentId: currentUser.id,
      clientId: project.clientId,
      coverLetter: coverLetter.trim(),
      relevantExperience: relevantExperience.trim(),
      selectedSkills,
      proposedPrice: priceNum,
      completionTime: completionTime.trim(),
    });

    if (res.error) {
      setError(res.error);
      return;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 id="apply-modal-title" className="text-base font-semibold text-slate-900 truncate">
              Apply for {project.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Client Budget: {formatCurrency(project.budget, project.projectType)} ·{' '}
              {project.projectType}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application form"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {!currentUser ? (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900 space-y-3">
              <p className="font-medium">Sign in required</p>
              <p className="text-xs text-blue-800">
                You need a Student account to apply for marketplace projects.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register?role=student"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-blue-800 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  Create Student Account
                </Link>
              </div>
            </div>
          ) : !isStudent ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
              Only Student accounts can submit project proposals. You are currently signed in as a{' '}
              <span className="font-semibold capitalize">{currentUser.role}</span>.
            </div>
          ) : !profileCompleted ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-3">
              <p className="font-semibold">Complete your student profile first</p>
              <p className="text-xs leading-relaxed">
                Before applying to projects, please fill out your university, department, biography,
                and add at least one skill so clients can evaluate your compatibility.
              </p>
              <Link
                to="/student/profile"
                onClick={onClose}
                className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                Complete My Profile
              </Link>
            </div>
          ) : alreadyApplied ? (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
              You already have an active application for this project. Track its progress under{' '}
              <Link to="/student/applications" onClick={onClose} className="underline font-medium">
                My Applications
              </Link>
              .
            </div>
          ) : (
            <form id="apply-project-form" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cover Letter *
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain how your skills match this project and outline your approach..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Relevant Experience *
                </label>
                <input
                  type="text"
                  required
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="e.g., Built 3 React & Node.js applications for campus startups"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {project.requiredSkills.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Your Relevant Skills for This Project
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill) => {
                      const active = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Proposed {project.projectType === 'Hourly' ? 'Hourly Rate ($)' : 'Price ($)'} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Estimated Completion Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    placeholder="e.g., 3 weeks"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {currentUser && isStudent && profileCompleted && !alreadyApplied && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="apply-project-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Submit Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
