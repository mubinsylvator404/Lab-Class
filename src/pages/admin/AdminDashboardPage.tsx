import React, { useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileCheck2,
  FolderKanban,
  GraduationCap,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { formatDate, getApplicationStatusStyle } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const { users, projects, applications } = useApp();

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalStudents = users.filter((u) => u.role === 'student').length;
    const totalClients = users.filter((u) => u.role === 'client').length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.status === 'Published' || p.status === 'In Progress'
    ).length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(
      (a) => a.status === 'Pending'
    ).length;

    return {
      totalUsers,
      totalStudents,
      totalClients,
      totalProjects,
      activeProjects,
      completedProjects,
      totalApplications,
      pendingApplications,
    };
  }, [users, projects, applications]);

  const categoryChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const recentApps = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [applications]
  );

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap },
    { label: 'Total Clients', value: stats.totalClients, icon: Briefcase },
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban },
    { label: 'Active Projects', value: stats.activeProjects, icon: FileCheck2 },
    { label: 'Completed Projects', value: stats.completedProjects, icon: CheckCircle2 },
    { label: 'Total Applications', value: stats.totalApplications, icon: FileCheck2 },
    { label: 'Pending Applications', value: stats.pendingApplications, icon: Clock },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Administration' }, { label: 'Overview' }]}
      action={
        <Link
          to="/admin/analytics"
          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
        >
          Full Analytics
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-600 mt-1">
            Live operational metrics dynamically calculated from browser LocalStorage collections.
          </p>
        </div>

        {/* 8 Required Admin KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-5">
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
          {/* Quick Category Distribution */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Projects by Category
              </h2>
              <Link
                to="/admin/analytics"
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Open Analytics →
              </Link>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" name="Projects" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Recent Applications Snapshot */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Recent Platform Applications
              </h2>
              <Link
                to="/admin/applications"
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentApps.map((app) => {
                const student = users.find((u) => u.id === app.studentId);
                const project = projects.find((p) => p.id === app.projectId);
                const st = getApplicationStatusStyle(app.status);
                return (
                  <div key={app.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {project?.title || 'Project'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${st.bg} ${st.text} ${st.border}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Applicant: {student?.name || 'Student'}</span>
                      <span className="tabular-nums">{formatDate(app.updatedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};
