import React, { useMemo, useState } from 'react';
import { CheckSquare, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LeaveReviewModal } from '../../components/reviews/LeaveReviewModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { calculateSkillMatch } from '../../services/matchingService';
import { ApplicationStatus } from '../../types';
import {
  formatCurrency,
  formatDate,
  getApplicationStatusStyle,
} from '../../utils/formatters';

export const ClientApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    applications,
    projects,
    users,
    reviews,
    updateApplicationStatus,
    changeProjectStatus,
  } = useApp();

  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [reviewTarget, setReviewTarget] = useState<{
    projectId: string;
    projectTitle: string;
    studentId: string;
    studentName: string;
  } | null>(null);

  const myProjects = useMemo(
    () => projects.filter((p) => p.clientId === currentUser?.id),
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

  const filtered = useMemo(() => {
    return myApplications.filter((a) => {
      if (projectFilter !== 'All' && a.projectId !== projectFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      return true;
    });
  }, [myApplications, projectFilter, statusFilter]);

  if (!currentUser) return null;

  const handleStatusChange = (appId: string, nextStatus: ApplicationStatus) => {
    updateApplicationStatus(
      appId,
      nextStatus,
      'client',
      `Status updated to ${nextStatus} by ${currentUser.clientProfile?.companyName || currentUser.name}.`
    );
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Client Workspace', to: '/client/dashboard' },
        { label: 'Applications' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applicant Review Hub</h1>
            <p className="text-sm text-slate-600 mt-1">
              Review student proposals, inspect portfolios, and update application statuses in real
              time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
            >
              <option value="All">All Projects ({myProjects.length})</option>
              {myProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'All' | ApplicationStatus)
              }
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
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
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No applications match your filter"
            description="Adjust your project or status filters, or invite recommended students to apply."
            actionLabel="Explore Matched Students"
            onAction={() => navigate('/client/recommended-students')}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => {
              const student = users.find((u) => u.id === app.studentId);
              const project = projects.find((p) => p.id === app.projectId);
              const appSt = getApplicationStatusStyle(app.status);
              const match = project
                ? calculateSkillMatch(
                    (student?.studentProfile?.skills || []).map((s) => s.name),
                    project.requiredSkills
                  )
                : null;

              const canReview =
                project?.status === 'Completed' && app.status === 'Accepted';
              const alreadyReviewed = reviews.some(
                (r) =>
                  r.projectId === app.projectId &&
                  r.reviewerId === currentUser.id &&
                  r.recipientId === app.studentId
              );

              return (
                <article
                  key={app.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        src={student?.studentProfile?.photo}
                        name={student?.name || 'Student'}
                        size="md"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/students/${app.studentId}`}
                            className="text-base font-semibold text-slate-900 hover:text-blue-700"
                          >
                            {student?.name || 'Student'}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${appSt.bg} ${appSt.text} ${appSt.border}`}
                          >
                            {app.status}
                          </span>
                          {match && match.totalRequired > 0 && (
                            <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums">
                              {match.matchPercentage}% skill match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Applied for{' '}
                          <Link
                            to={`/client/projects/${app.projectId}`}
                            className="font-medium text-slate-700 hover:text-blue-700"
                          >
                            {project?.title || 'Project'}
                          </Link>{' '}
                          · {formatDate(app.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right text-xs shrink-0">
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {formatCurrency(app.proposedPrice, project?.projectType)}
                      </div>
                      <div className="text-slate-500">Est. {app.completionTime}</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {app.coverLetter}
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Relevant Experience:</strong>{' '}
                    {app.relevantExperience}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={`/students/${app.studentId}`}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      View Student Profile & Portfolio →
                    </Link>

                    {app.status !== 'Withdrawn' && (
                      <div className="flex flex-wrap items-center gap-2">
                        {app.status !== 'Under Review' && app.status !== 'Accepted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'Under Review')}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                          >
                            Under Review
                          </button>
                        )}
                        {app.status !== 'Shortlisted' && app.status !== 'Accepted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'Shortlisted')}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status !== 'Accepted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'Accepted')}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                          >
                            Accept
                          </button>
                        )}
                        {app.status !== 'Rejected' && app.status !== 'Accepted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'Rejected')}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg"
                          >
                            Reject
                          </button>
                        )}
                        {project &&
                          app.status === 'Accepted' &&
                          project.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => changeProjectStatus(project.id, 'Completed')}
                              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg"
                            >
                              Mark Project Completed
                            </button>
                          )}
                        {canReview && !alreadyReviewed && project && student && (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewTarget({
                                projectId: project.id,
                                projectTitle: project.title,
                                studentId: student.id,
                                studentName: student.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Rate Student
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {reviewTarget && (
        <LeaveReviewModal
          open={Boolean(reviewTarget)}
          projectId={reviewTarget.projectId}
          projectTitle={reviewTarget.projectTitle}
          recipientId={reviewTarget.studentId}
          recipientName={reviewTarget.studentName}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};
