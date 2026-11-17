import React, { useMemo, useState } from 'react';
import { CheckSquare, Clock, Eye, Star, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LeaveReviewModal } from '../../components/reviews/LeaveReviewModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Application, ApplicationStatus } from '../../types';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getApplicationStatusStyle,
} from '../../utils/formatters';

const STATUS_TABS: ('All' | ApplicationStatus)[] = [
  'All',
  'Pending',
  'Under Review',
  'Shortlisted',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

export const StudentApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { applications, projects, users, reviews, updateApplicationStatus } = useApp();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    projectId: string;
    projectTitle: string;
    clientId: string;
    clientName: string;
  } | null>(null);

  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.studentId === currentUser?.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [applications, currentUser]
  );

  const filtered = useMemo(
    () =>
      statusFilter === 'All'
        ? myApplications
        : myApplications.filter((a) => a.status === statusFilter),
    [myApplications, statusFilter]
  );

  if (!currentUser) return null;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Student Workspace', to: '/student/dashboard' },
        { label: 'My Applications' },
      ]}
      action={
        <Link
          to="/student/browse"
          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
        >
          Browse More Projects
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-sm text-slate-600 mt-1">
            Track real-time client status updates, review submission timelines, or withdraw pending
            proposals.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? myApplications.length
                : myApplications.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                  statusFilter === tab
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab} <span className="font-mono tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No applications in this view"
            description="Browse active marketplace projects and submit a tailored proposal to start tracking your progress."
            actionLabel="Browse Projects"
            onAction={() => navigate('/student/browse')}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Applied</th>
                    <th className="py-3 px-4 text-right">Proposed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((app) => {
                    const project = projects.find((p) => p.id === app.projectId);
                    const client = users.find((u) => u.id === app.clientId);
                    const st = getApplicationStatusStyle(app.status);

                    const isCompletedAccepted =
                      project?.status === 'Completed' && app.status === 'Accepted';
                    const alreadyReviewed = reviews.some(
                      (r) =>
                        r.projectId === app.projectId &&
                        r.reviewerId === currentUser.id &&
                        r.recipientId === app.clientId
                    );

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <Link
                            to={`/projects/${app.projectId}`}
                            className="hover:text-blue-700"
                          >
                            {project?.title || 'Deleted Project'}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <Link
                            to={`/clients/${app.clientId}`}
                            className="hover:text-blue-700"
                          >
                            {client?.clientProfile?.companyName || client?.name || 'Client'}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-900 tabular-nums whitespace-nowrap">
                          {formatCurrency(app.proposedPrice, project?.projectType)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${st.bg} ${st.text} ${st.border}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                          {formatDate(app.updatedAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedApp(app)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>

                            {app.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => setWithdrawTarget(app)}
                                className="px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                              >
                                Withdraw
                              </button>
                            )}

                            {isCompletedAccepted && !alreadyReviewed && project && client && (
                              <button
                                type="button"
                                onClick={() =>
                                  setReviewTarget({
                                    projectId: project.id,
                                    projectTitle: project.title,
                                    clientId: client.id,
                                    clientName:
                                      client.clientProfile?.companyName || client.name,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Rate Client
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail & Timeline Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Application Details & Timeline
              </h2>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                aria-label="Close detail modal"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="text-xs text-slate-500">Project</div>
                <div className="text-base font-semibold text-slate-900">
                  {projects.find((p) => p.id === selectedApp.projectId)?.title || 'Project'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Proposed Price</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                    ${selectedApp.proposedPrice}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Completion Time</span>
                  <div className="font-medium text-slate-900 mt-0.5">
                    {selectedApp.completionTime}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1">Cover Letter</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedApp.coverLetter}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  Relevant Experience
                </div>
                <p className="text-sm text-slate-700">{selectedApp.relevantExperience}</p>
              </div>

              {selectedApp.selectedSkills.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    Highlighted Skills
                  </div>
                  <p className="text-xs text-slate-600">
                    {selectedApp.selectedSkills.join(' · ')}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  Status Timeline
                </div>
                <ol className="space-y-3">
                  {selectedApp.timeline.map((evt, idx) => (
                    <li key={idx} className="flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{evt.status}</span>
                        {evt.note && <p className="text-slate-600 mt-0.5">{evt.note}</p>}
                      </div>
                      <span className="text-slate-400 tabular-nums shrink-0">
                        {formatRelativeTime(evt.timestamp)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        title="Withdraw Application"
        message="Withdrawing a pending application notifies the client and stops review. You can re-apply later while the project remains open."
        confirmLabel="Withdraw Application"
        onConfirm={() => {
          if (withdrawTarget) {
            updateApplicationStatus(
              withdrawTarget.id,
              'Withdrawn',
              'student',
              'Withdrawn by student.'
            );
          }
          setWithdrawTarget(null);
        }}
        onCancel={() => setWithdrawTarget(null)}
      />

      {reviewTarget && (
        <LeaveReviewModal
          open={Boolean(reviewTarget)}
          projectId={reviewTarget.projectId}
          projectTitle={reviewTarget.projectTitle}
          recipientId={reviewTarget.clientId}
          recipientName={reviewTarget.clientName}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};
