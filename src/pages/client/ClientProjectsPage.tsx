import React, { useMemo, useState } from 'react';
import { Briefcase, Edit3, PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Project, ProjectStatus } from '../../types';
import { formatCurrency, formatDate, getProjectStatusStyle } from '../../utils/formatters';

const TABS: ('All' | ProjectStatus)[] = [
  'All',
  'Published',
  'Draft',
  'In Progress',
  'Completed',
  'Closed',
];

export const ClientProjectsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, changeProjectStatus, deleteProject } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'All' | ProjectStatus>('All');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

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

  const filtered = useMemo(
    () => (tab === 'All' ? myProjects : myProjects.filter((p) => p.status === tab)),
    [myProjects, tab]
  );

  if (!currentUser) return null;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Client Workspace', to: '/client/dashboard' },
        { label: 'My Projects' },
      ]}
      action={
        <Link
          to="/client/projects/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          New Project
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-sm text-slate-600 mt-1">
            Publish drafts, close or reopen listings, inspect matched students, and mark completed
            projects.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const count =
              t === 'All'
                ? myProjects.length
                : myProjects.filter((p) => p.status === t).length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-colors ${
                  tab === t
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t} <span className="font-mono tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects in this status"
            description="Create and publish a new project request to start receiving applications and student skill matches."
            actionLabel="Create Project"
            onAction={() => navigate('/client/projects/new')}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((project) => {
              const st = getProjectStatusStyle(project.status);
              return (
                <article
                  key={project.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.experienceLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Due {formatDate(project.deadline)}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${st.bg} ${st.text} ${st.border}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <Link
                        to={`/client/projects/${project.id}`}
                        className="block text-lg font-semibold text-slate-900 hover:text-blue-700"
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {project.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        Skills: {project.requiredSkills.join(', ') || 'None specified'}
                      </p>
                    </div>

                    <div className="lg:text-right shrink-0 space-y-1">
                      <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                        {formatCurrency(project.budget, project.projectType)}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        {project.applicantsCount} applicants · {project.requiredStudents} needed
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/client/projects/${project.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        Applicants ({project.applicantsCount})
                      </Link>
                      <Link
                        to={`/client/recommended-students?projectId=${project.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Recommended Students
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {project.status === 'Draft' && (
                        <button
                          type="button"
                          onClick={() => changeProjectStatus(project.id, 'Published')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                        >
                          Publish
                        </button>
                      )}
                      {project.status === 'Published' && (
                        <button
                          type="button"
                          onClick={() => changeProjectStatus(project.id, 'Closed')}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg"
                        >
                          Close
                        </button>
                      )}
                      {project.status === 'Closed' && (
                        <button
                          type="button"
                          onClick={() => changeProjectStatus(project.id, 'Published')}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg"
                        >
                          Reopen
                        </button>
                      )}
                      {(project.status === 'Published' ||
                        project.status === 'In Progress') && (
                        <button
                          type="button"
                          onClick={() => changeProjectStatus(project.id, 'Completed')}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg"
                        >
                          Mark Completed
                        </button>
                      )}
                      <Link
                        to={`/client/projects/${project.id}/edit`}
                        aria-label={`Edit ${project.title}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(project)}
                        aria-label={`Delete ${project.title}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Deleting "${deleteTarget?.title}" will permanently remove this project and its associated applications from LocalStorage.`}
        confirmLabel="Delete Project"
        onConfirm={() => {
          if (deleteTarget) deleteProject(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};
