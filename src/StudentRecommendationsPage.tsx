import React, { useMemo, useState } from 'react';
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ApplyProjectModal } from '../../components/projects/ApplyProjectModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getRecommendedProjectsForStudent } from '../../services/matchingService';
import { Project } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const StudentRecommendationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, users, applications } = useApp();
  const navigate = useNavigate();
  const [applyTarget, setApplyTarget] = useState<Project | null>(null);
  const [onlyMatched, setOnlyMatched] = useState(false);

  const recommendations = useMemo(
    () => getRecommendedProjectsForStudent(currentUser, projects),
    [currentUser, projects]
  );

  const appliedIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set(
      applications
        .filter((a) => a.studentId === currentUser.id && a.status !== 'Withdrawn')
        .map((a) => a.projectId)
    );
  }, [applications, currentUser]);

  if (!currentUser) return null;

  const skillsCount = currentUser.studentProfile?.skills.length || 0;
  const visibleList = onlyMatched
    ? recommendations.filter((r) => r.match.matchPercentage > 0)
    : recommendations;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Student Workspace', to: '/student/dashboard' },
        { label: 'Recommended Projects' },
      ]}
      action={
        <Link
          to="/student/skills"
          className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
        >
          Edit My Skills ({skillsCount})
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Recommended Projects for You
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Calculated directly from your verified skills against active project requirements.
            </p>
          </div>
          {skillsCount > 0 && (
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setOnlyMatched(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  !onlyMatched
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Active ({recommendations.length})
              </button>
              <button
                type="button"
                onClick={() => setOnlyMatched(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  onlyMatched
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matched Only (
                {recommendations.filter((r) => r.match.matchPercentage > 0).length})
              </button>
            </div>
          )}
        </div>

        {skillsCount === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Add skills to unlock personalized recommendations"
            description="Your profile currently has no listed skills. Add technical or creative skills so SkillBridge can calculate your project match percentages."
            actionLabel="Go to My Skills"
            onAction={() => navigate('/student/skills')}
          />
        ) : visibleList.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No skill matches yet"
            description="None of the currently published projects overlap with your listed skills. Add more skills or browse all projects."
            actionLabel="Show All Published Projects"
            onAction={() => setOnlyMatched(false)}
          />
        ) : (
          <div className="space-y-4">
            {visibleList.map(({ project, match }) => {
              const client = users.find((u) => u.id === project.clientId);
              const hasApplied = appliedIds.has(project.id);

              return (
                <article
                  key={project.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.experienceLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {client?.clientProfile?.companyName || client?.name || 'Client'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Due {formatDate(project.deadline)}</span>
                      </div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="block text-lg font-semibold text-slate-900 hover:text-blue-700 transition-colors"
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                      <div className="lg:text-right">
                        <div className="text-xl font-bold font-mono text-blue-700 tabular-nums">
                          {match.matchPercentage}% Match
                        </div>
                        <div className="text-xs font-mono text-slate-700 tabular-nums mt-0.5">
                          {formatCurrency(project.budget, project.projectType)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${project.id}`}
                          className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          disabled={hasApplied}
                          onClick={() => setApplyTarget(project)}
                          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500 rounded-lg"
                        >
                          {hasApplied ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Skill Match Breakdown Bar */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-start gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <div>
                        <span className="font-semibold">
                          Matching Skills ({match.matchingSkills.length}/{match.totalRequired}):{' '}
                        </span>
                        <span>
                          {match.matchingSkills.length > 0
                            ? match.matchingSkills.join(', ')
                            : 'None'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      <div>
                        <span className="font-semibold text-slate-800">
                          Missing Skills ({match.missingSkills.length}):{' '}
                        </span>
                        <span>
                          {match.missingSkills.length > 0
                            ? match.missingSkills.join(', ')
                            : 'None — full coverage'}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ApplyProjectModal project={applyTarget} onClose={() => setApplyTarget(null)} />
    </DashboardLayout>
  );
};
