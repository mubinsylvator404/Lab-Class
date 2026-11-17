import React, { useMemo, useState } from 'react';
import { ExternalLink, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Project, ProjectStatus } from '../../types';
import { formatCurrency, formatDate, getProjectStatusStyle } from '../../utils/formatters';

export const AdminProjectsPage: React.FC = () => {
  const { projects, users, categories, deleteProject } = useApp();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 200);
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (q) {
        const owner = users.find((u) => u.id === p.clientId);
        const hay = `${p.title} ${p.category} ${owner?.name || ''} ${
          owner?.clientProfile?.companyName || ''
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [projects, users, debounced, statusFilter, categoryFilter]);

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Administration', to: '/admin/dashboard' },
        { label: 'Project Management' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitor all project listings across statuses, inspect project owners, and remove
              inappropriate posts.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            {filtered.length} of {projects.length} projects
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title or owner..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | ProjectStatus)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Budget</th>
                  <th className="py-3 px-4 text-right">Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((proj) => {
                  const owner = users.find((u) => u.id === proj.clientId);
                  const st = getProjectStatusStyle(proj.status);
                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {proj.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <Link
                          to={`/clients/${proj.clientId}`}
                          className="hover:text-blue-700"
                        >
                          {owner?.clientProfile?.companyName || owner?.name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{proj.category}</td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        {formatCurrency(proj.budget, proj.projectType)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {proj.applicantsCount}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${st.bg} ${st.text} ${st.border}`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDate(proj.deadline)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/projects/${proj.id}`}
                            aria-label={`View ${proj.title}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(proj)}
                            aria-label={`Remove ${proj.title}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Project"
        message={`Permanently remove "${deleteTarget?.title}" and its associated applications?`}
        confirmLabel="Remove Project"
        onConfirm={() => {
          if (deleteTarget) deleteProject(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};
