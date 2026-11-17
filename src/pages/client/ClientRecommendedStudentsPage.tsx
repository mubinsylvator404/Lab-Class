import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FolderGit2, Sparkles, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { StarRating } from '../../components/common/StarRating';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getRecommendedStudentsForProject } from '../../services/matchingService';

export const ClientRecommendedStudentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, users, reviews, portfolios } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const myProjects = useMemo(
    () =>
      projects
        .filter((p) => p.clientId === currentUser?.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [projects, currentUser]
  );

  const paramId = searchParams.get('projectId');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => paramId || myProjects[0]?.id || ''
  );

  useEffect(() => {
    if (paramId && myProjects.some((p) => p.id === paramId)) {
      setSelectedProjectId(paramId);
    } else if (!selectedProjectId && myProjects[0]) {
      setSelectedProjectId(myProjects[0].id);
    }
  }, [paramId, myProjects, selectedProjectId]);

  const selectedProject = useMemo(
    () => myProjects.find((p) => p.id === selectedProjectId) || myProjects[0] || null,
    [myProjects, selectedProjectId]
  );

  const recommendations = useMemo(
    () => getRecommendedStudentsForProject(selectedProject, users, reviews),
    [selectedProject, users, reviews]
  );

  if (!currentUser) return null;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Client Workspace', to: '/client/dashboard' },
        { label: 'Recommended Students' },
      ]}
      action={
        <Link
          to="/client/projects/new"
          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
        >
          Create Project
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Intelligent Student-Project Matching
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Compares project required skills against every student profile stored in LocalStorage
              using <code className="font-mono text-xs">(Matching / Total Required) × 100</code>.
            </p>
          </div>

          {myProjects.length > 0 && (
            <div className="min-w-[260px]">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Client Project
              </label>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSearchParams({ projectId: e.target.value });
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {myProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!selectedProject ? (
          <EmptyState
            icon={Sparkles}
            title="Publish a project to see ranked student matches"
            description="Create a project with required skills and SkillBridge will rank all registered students by skill compatibility."
            actionLabel="Create First Project"
            onAction={() => navigate('/client/projects/new')}
          />
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">
                  Selected Project · {selectedProject.category} · {selectedProject.experienceLevel}
                </div>
                <h2 className="text-base font-semibold text-slate-900 mt-0.5">
                  {selectedProject.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Required Skills:{' '}
                  <span className="font-medium text-slate-900">
                    {selectedProject.requiredSkills.join(', ') || 'None specified'}
                  </span>
                </p>
              </div>
              <div className="text-xs text-slate-500 tabular-nums shrink-0">
                Evaluating{' '}
                <strong className="text-slate-900 font-mono">{recommendations.length}</strong>{' '}
                registered students
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map(
                ({ student, match, averageRating, reviewCount }) => {
                  const sp = student.studentProfile;
                  const stuPortfolioCount = portfolios.filter(
                    (p) => p.studentId === student.id
                  ).length;

                  return (
                    <article
                      key={student.id}
                      className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar src={sp?.photo} name={student.name} size="lg" />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/students/${student.id}`}
                                className="text-base font-semibold text-slate-900 hover:text-blue-700"
                              >
                                {student.name}
                              </Link>
                              <span className="text-xs text-slate-500">
                                · {sp?.experienceLevel || 'Student'}
                              </span>
                              <span className="text-xs text-slate-500">
                                · {sp?.availability || 'Available'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600">
                              {sp?.university || 'University'} · {sp?.department || 'Department'}
                            </p>

                            <div className="flex items-center gap-3 pt-1">
                              <div className="flex items-center gap-1.5">
                                <StarRating rating={averageRating} size="sm" />
                                <span className="text-xs font-mono text-slate-600 tabular-nums">
                                  {reviewCount > 0
                                    ? `${averageRating.toFixed(1)} (${reviewCount})`
                                    : 'No reviews yet'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">·</span>
                              <Link
                                to={`/students/${student.id}`}
                                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-700"
                              >
                                <FolderGit2 className="w-3.5 h-3.5" />
                                {stuPortfolioCount} portfolio{' '}
                                {stuPortfolioCount === 1 ? 'project' : 'projects'}
                              </Link>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                          <div className="md:text-right">
                            <div
                              className={`text-xl font-bold font-mono tabular-nums ${
                                match.matchPercentage >= 75
                                  ? 'text-emerald-700'
                                  : match.matchPercentage >= 40
                                  ? 'text-blue-700'
                                  : 'text-slate-600'
                              }`}
                            >
                              {match.matchPercentage}% Match
                            </div>
                            <div className="text-[11px] text-slate-500 tabular-nums">
                              {match.matchingSkills.length} of {match.totalRequired} skills
                            </div>
                          </div>

                          <Link
                            to={`/students/${student.id}`}
                            className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="flex items-start gap-2 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                          <div>
                            <span className="font-semibold">Matching Skills: </span>
                            {match.matchingSkills.length > 0
                              ? match.matchingSkills.join(', ')
                              : 'None'}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                          <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                          <div>
                            <span className="font-semibold text-slate-800">Missing Skills: </span>
                            {match.missingSkills.length > 0
                              ? match.missingSkills.join(', ')
                              : 'None — 100% covered!'}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
