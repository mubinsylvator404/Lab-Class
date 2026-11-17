import React, { useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  FileEdit,
  FolderKanban,
  PlusCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getApplicationStatusStyle,
  getProjectStatusStyle,
} from '../../utils/formatters';

export const ClientDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, applications, users } = useApp();

  const myProjects = useMemo(
    () =>
      projects
        .filter((p) => p.clientId === currentUser?.id)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [projects, currentUser]
  );

  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.clientId === currentUser?.id)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [applications, currentUser]
  );

  if (!currentUser) return null;

  const activeProjects = myProjects.filter(
    (p) => p.status === 'Published' || p.status === 'In Progress'
  ).length;
  const draftProjects = myProjects.filter((p) => p.status === 'Draft').length;
  const completedProjects = myProjects.filter((p) => p.status === 'Completed').length;
  const shortlistedCount = myApplications.filter(
    (a) => a.status === 'Shortlisted'
  ).length;

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Client Workspace' }, { label: 'Dashboard' }]}
      action={
        <Link
          to="/client/projects/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Publish Project
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentUser.clientProfile?.companyName || currentUser.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your published project briefs, incoming student proposals, and skill matches.
            </p>
          </div>
          <Link
            to="/client/recommended-students"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 whitespace-nowrap self-start"
          >
            <Sparkles className="w-4 h-4" />
            Explore Matched Students
          </Link>
        </div>

        {/* 6 Required Client KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Projects', value: myProjects.length, icon: FolderKanban },
            { label: 'Active Projects', value: activeProjects, icon: Briefcase },
            { label: 'Draft Projects', value: draftProjects, icon: FileEdit },
            { label: 'Total Applications', value: myApplications.length, icon: Users },
            { label: 'Shortlisted', value: shortlistedCount, icon: Sparkles },
            { label: 'Completed', value: completedProjects, icon: CheckCircle2 },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{kpi.label}</span>
                  <Icon className="w-4 h-4 text-blue-700 shrink-0" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {kpi.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Projects Overview */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Your Projects</h2>
              <Link
                to="/client/projects"
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Manage all
              </Link>
            </div>

            {myProjects.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-slate-600">You haven’t published any projects yet.</p>
                <Link
                  to="/client/projects/new"
                  className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg"
                >
                  Create First Project
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myProjects.slice(0, 5).map((proj) => {
                  const st = getProjectStatusStyle(proj.status);
                  return (
                    <div
                      key={proj.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/client/projects/${proj.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-blue-700 truncate"
                          >
                            {proj.title}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${st.bg} ${st.text} ${st.border}`}
                          >
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                          {proj.category} · {formatCurrency(proj.budget, proj.projectType)} ·{' '}
                          {proj.applicantsCount} applicants · Due {formatDate(proj.deadline)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/client/recommended-students?projectId=${proj.id}`}
                          className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 whitespace-nowrap"
                        >
                          Matches
                        </Link>
                        <Link
                          to={`/client/projects/${proj.id}`}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Activity / Incoming Applications */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
              <Link
                to="/client/applications"
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Review applications
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Incoming student applications and status updates will appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myApplications.slice(0, 6).map((app) => {
                  const student = users.find((u) => u.id === app.studentId);
                  const project = projects.find((p) => p.id === app.projectId);
                  const st = getApplicationStatusStyle(app.status);
                  return (
                    <div key={app.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                      <Avatar
                        src={student?.studentProfile?.photo}
                        name={student?.name || 'Student'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            to={`/students/${app.studentId}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-700 truncate"
                          >
                            {student?.name || 'Student'}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${st.bg} ${st.text} ${st.border}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {project?.title || 'Project'} ·{' '}
                          <span className="font-mono tabular-nums">${app.proposedPrice}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                          {formatRelativeTime(app.updatedAt)}
                        </p>
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
