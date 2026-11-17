import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ApplicationStatus } from '../../types';
import {
  formatCurrency,
  formatDate,
  getApplicationStatusStyle,
} from '../../utils/formatters';

export const AdminApplicationsPage: React.FC = () => {
  const { applications, projects, users } = useApp();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 200);
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return applications
      .filter((a) => {
        if (statusFilter !== 'All' && a.status !== statusFilter) return false;
        if (q) {
          const stu = users.find((u) => u.id === a.studentId);
          const prj = projects.find((p) => p.id === a.projectId);
          const cli = users.find((u) => u.id === a.clientId);
          const hay = `${stu?.name || ''} ${prj?.title || ''} ${
            cli?.clientProfile?.companyName || cli?.name || ''
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [applications, projects, users, debounced, statusFilter]);

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Administration', to: '/admin/dashboard' },
        { label: 'Application Management' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Application Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Audit student proposals, client decisions, and proposed project pricing across the
              platform.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            {filtered.length} of {applications.length} applications
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, project title, or client..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <select
            aria-label="Filter applications by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'All' | ApplicationStatus)
            }
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4 text-right">Proposed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((app) => {
                  const stu = users.find((u) => u.id === app.studentId);
                  const prj = projects.find((p) => p.id === app.projectId);
                  const cli = users.find((u) => u.id === app.clientId);
                  const st = getApplicationStatusStyle(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-medium">
                        <Link
                          to={`/students/${app.studentId}`}
                          className="text-slate-900 hover:text-blue-700"
                        >
                          {stu?.name || 'Student'}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/projects/${app.projectId}`}
                          className="text-slate-700 hover:text-blue-700"
                        >
                          {prj?.title || 'Project'}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {cli?.clientProfile?.companyName || cli?.name || 'Client'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        {formatCurrency(app.proposedPrice, prj?.projectType)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${st.bg} ${st.text} ${st.border}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDate(app.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
