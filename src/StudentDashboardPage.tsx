import React, { useMemo } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Briefcase,
  CheckSquare,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getRecommendedProjectsForStudent } from '../../services/matchingService';
import { reviewService } from '../../services/reviewService';
import {
  formatCurrency,
  formatDate,
  getApplicationStatusStyle,
} from '../../utils/formatters';

export const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, applications, portfolios, reviews, users } = useApp();

  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.studentId === currentUser?.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [applications, currentUser]
  );

  const myPortfolios = useMemo(
    () => portfolios.filter((p) => p.studentId === currentUser?.id),
    [portfolios, currentUser]
  );

  const recommendations = useMemo(
    () => getRecommendedProjectsForStudent(currentUser, projects),
    [currentUser, projects]
  );

  const ratingSummary = useMemo(
    () =>
      currentUser
        ? reviewService.getSummaryForUser(reviews, currentUser.id)
        : { average: 0, total: 0 },
    [reviews, currentUser]
  );

  if (!currentUser) return null;

  const profile = currentUser.studentProfile;
  const activeApps = myApplications.filter((a) =>
    ['Pending', 'Under Review', 'Shortlisted'].includes(a.status)
  ).length;
  const acceptedApps = myApplications.filter((a) => a.status === 'Accepted').length;
  const topMatches = recommendations.filter((r) => r.match.matchPercentage > 0).slice(0, 4);

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Student Workspace' }, { label: 'Dashboard' }]}
      action={
        <Link
          to={`/students/${currentUser.id}`}
          className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
        >
          Public Profile
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {profile?.university || 'Complete your university profile'} ·{' '}
            {profile?.skills.length || 0} skills listed · {myPortfolios.length} portfolio projects
          </p>
        </div>

        {!profile?.profileCompleted && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Complete your student skill profile to apply for projects
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Add your university, department, biography, and at least one skill to unlock
                  applications and skill compatibility scores.
                </p>
              </div>
            </div>
            <Link
              to="/student/profile"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0 text-center"
            >
              Complete Profile
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Skill Matches</span>
              <Sparkles className="w-4 h-4 text-blue-700" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {recommendations.filter((r) => r.match.matchPercentage >= 50).length}
            </div>
            <p className="mt-1 text-xs text-slate-500">Projects ≥ 50% match</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Proposals</span>
              <CheckSquare className="w-4 h-4 text-blue-700" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {activeApps}
            </div>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {acceptedApps} accepted total
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Verified Skills</span>
              <Award className="w-4 h-4 text-blue-700" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {profile?.skills.length || 0}
            </div>
            <Link
              to="/student/skills"
              className="mt-1 inline-block text-xs font-medium text-blue-700 hover:underline"
            >
              Manage skills
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Portfolio & Rating</span>
              <FolderGit2 className="w-4 h-4 text-blue-700" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {myPortfolios.length} items
            </div>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {ratingSummary.total > 0
                ? `${ratingSummary.average.toFixed(1)}★ (${ratingSummary.total} reviews)`
                : 'No reviews yet'}
            </p>
          </div>
        </div>

        {/* Two-column Workspace Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Top Recommended Projects */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Top Recommended Projects
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by compatibility with your skill profile
                </p>
              </div>
              <Link
                to="/student/recommendations"
                className="text-xs font-medium text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {topMatches.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-600">
                  Add skills to your profile to see matching projects automatically.
                </p>
                <Link
                  to="/student/skills"
                  className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg"
                >
                  Add Your Skills
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topMatches.map(({ project, match }) => (
                  <div
                    key={project.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-700 truncate block"
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project.category} ·{' '}
                        <span className="font-mono tabular-nums">
                          {formatCurrency(project.budget, project.projectType)}
                        </span>
                      </p>
                      <p className="text-xs text-emerald-700 mt-1 truncate">
                        Matches: {match.matchingSkills.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold font-mono text-blue-700 tabular-nums">
                        {match.matchPercentage}%
                      </span>
                      <Link
                        to={`/projects/${project.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Applications */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Recent Applications
              </h2>
              <Link
                to="/student/applications"
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                View all
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-slate-600">You haven’t applied to any projects yet.</p>
                <Link
                  to="/student/browse"
                  className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg"
                >
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myApplications.slice(0, 5).map((app) => {
                  const project = projects.find((p) => p.id === app.projectId);
                  const client = users.find((u) => u.id === app.clientId);
                  const st = getApplicationStatusStyle(app.status);
                  return (
                    <div key={app.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to="/student/applications"
                          className="text-sm font-medium text-slate-900 hover:text-blue-700 truncate"
                        >
                          {project?.title || 'Project'}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${st.bg} ${st.text} ${st.border}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="truncate">
                          {client?.clientProfile?.companyName || client?.name}
                        </span>
                        <span className="tabular-nums shrink-0">
                          Updated {formatDate(app.updatedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};
