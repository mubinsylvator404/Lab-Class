import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';

const STATUS_COLORS: Record<string, string> = {
  Published: '#1d4ed8',
  'In Progress': '#4338ca',
  Completed: '#16a34a',
  Draft: '#d97706',
  Closed: '#64748b',
};

function getMonthKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export const AdminAnalyticsPage: React.FC = () => {
  const { users, projects, applications } = useApp();

  // 1. User Growth (Cumulative by Month)
  const userGrowthData = useMemo(() => {
    const monthCounts = new Map<string, { students: number; clients: number }>();
    for (const u of users) {
      const k = getMonthKey(u.createdAt);
      const curr = monthCounts.get(k) || { students: 0, clients: 0 };
      if (u.role === 'student') curr.students += 1;
      else if (u.role === 'client') curr.clients += 1;
      monthCounts.set(k, curr);
    }
    const sortedKeys = Array.from(monthCounts.keys()).sort();
    let cumStudents = 0;
    let cumClients = 0;
    return sortedKeys.map((k) => {
      const c = monthCounts.get(k)!;
      cumStudents += c.students;
      cumClients += c.clients;
      return {
        month: formatMonthLabel(k),
        Students: cumStudents,
        Clients: cumClients,
        Total: cumStudents + cumClients,
      };
    });
  }, [users]);

  // 2. Projects Published Over Time
  const projectsOverTimeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const k = getMonthKey(p.createdAt);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.keys())
      .sort()
      .map((k) => ({
        month: formatMonthLabel(k),
        Projects: counts.get(k) || 0,
      }));
  }, [projects]);

  // 3. Application Statistics by Status
  const applicationStatsData = useMemo(() => {
    const statuses = [
      'Pending',
      'Under Review',
      'Shortlisted',
      'Accepted',
      'Rejected',
      'Withdrawn',
    ];
    return statuses.map((status) => ({
      status,
      Count: applications.filter((a) => a.status === status).length,
    }));
  }, [applications]);

  // 4. Popular Project Categories
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, Count: count }))
      .sort((a, b) => b.Count - a.Count);
  }, [projects]);

  // 5. Most Requested Skills
  const topSkillsData = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const p of projects) {
      for (const rawSkill of p.requiredSkills) {
        const key = rawSkill.trim().toLowerCase();
        if (!key) continue;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, { label: rawSkill.trim(), count: 1 });
        }
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((item) => ({ skill: item.label, Requests: item.count }));
  }, [projects]);

  // 6. Project Status Distribution
  const projectStatusData = useMemo(() => {
    const statuses = ['Published', 'In Progress', 'Completed', 'Draft', 'Closed'];
    return statuses
      .map((status) => ({
        name: status,
        value: projects.filter((p) => p.status === status).length,
      }))
      .filter((item) => item.value > 0);
  }, [projects]);

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Administration', to: '/admin/dashboard' },
        { label: 'Platform Analytics' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">
            All charts reflect live LocalStorage data across registered users, projects, and
            applications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: User Growth */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Cumulative User Growth
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userGrowthData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="Students"
                    stroke="#1d4ed8"
                    fill="#dbeafe"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Clients"
                    stroke="#0f172a"
                    fill="#e2e8f0"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 2: Projects Published Over Time */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Projects Published Over Time
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectsOverTimeData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="Projects" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 3: Application Statistics */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Application Status Breakdown
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={applicationStatsData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="Count" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 4: Popular Project Categories */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Popular Project Categories
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="Count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 5: Most Requested Skills */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Most Requested Skills
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSkillsData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 24, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={95}
                    tick={{ fontSize: 11, fill: '#334155' }}
                  />
                  <Tooltip />
                  <Bar dataKey="Requests" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 6: Project Status Distribution */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Project Status Distribution
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {projectStatusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};
