import React, { useMemo, useState } from 'react';
import { Edit3, Sparkles, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
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
  getProjectStatusStyle,
} from '../../utils/formatters';

export const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const {
    projects,
    applications,
    users,
    reviews,
    updateApplicationStatus,
    changeProjectStatus,
  } = useApp();

  const [reviewTarget, setReviewTarget] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);

  const project = projects.find((p) => p.id === id);

  const projectApps = useMemo(
    () =>
      applications
        .filter((a) => a.projectId === id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [applications, id]
  );

  if (!currentUser) return null;

  if (!project || project.clientId !== currentUser.id) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: 'Client Workspace', to: '/client/dashboard' },
          { label: 'My Projects', to: '/client/projects' },
          { label: 'Not Found' },
        ]}
      >
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <h1 className="text-lg font-semibold text-slate-900">Project not accessible</h1>
          <Link
            to="/client/projects"
            className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg"
          >
            Return to My Projects
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const st = getProjectStatusStyle(project.status);

  const handleStatusChange = (appId: string, nextStatus: ApplicationStatus) => {
    updateApplicationStatus(
      appId,
      nextStatus,
      'client',
      `Marked ${nextStatus} by ${currentUser.clientProfile?.companyName || currentUser.name}.`
    );
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Client Workspace', to: '/client/dashboard' },
        { label: 'My Projects', to: '/client/projects' },
        { label: project.title },
      ]}
      action={
        <div className="flex items-center gap-2">
          <Link
            to={`/client/recommended-students?projectId=${project.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Matched Students
          </Link>
          <Link
            to={`/client/projects/${project.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.experienceLevel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(project.budget, project.projectType)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Due {formatDate(project.deadline)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-medium border ${st.bg} ${st.text} ${st.border}`}
              >
                {project.status}
              </span>
              {(project.status === 'Published' || project.status === 'In Progress') && (
                <button
                  type="button"
                  onClick={() => changeProjectStatus(project.id, 'Completed')}
                  className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Required Skills: </span>
            {project.requiredSkills.join(' · ') || 'None specified'}
          </div>
        </div>

        {/* Applicants Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Student Applications ({projectApps.length})
          </h2>

          {projectApps.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">
                No students have applied to this project yet.
              </p>
              <Link
                to={`/client/recommended-students?projectId=${project.id}`}
                className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg"
              >
                View Recommended Students
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projectApps.map((app) => {
                const student = users.find((u) => u.id === app.studentId);
                const appSt = getApplicationStatusStyle(app.status);
                const match = calculateSkillMatch(
                  (student?.studentProfile?.skills || []).map((s) => s.name),
                  project.requiredSkills
                );
                const canReview =
                  project.status === 'Completed' && app.status === 'Accepted';
                const alreadyReviewed = reviews.some(
                  (r) =>
                    r.projectId === project.id &&
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
                          <div className="flex items-center gap-2 flex-wrap">
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
                            {match.totalRequired > 0 && (
                              <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums">
                                {match.matchPercentage}% skill match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {student?.studentProfile?.university || 'University'} ·{' '}
                            {student?.studentProfile?.department || ''}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right text-xs">
                        <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                          {formatCurrency(app.proposedPrice, project.projectType)}
                        </div>
                        <div className="text-slate-500">Est. {app.completionTime}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="leading-relaxed">{app.coverLetter}</p>
                      <p className="text-xs text-slate-500">
                        <strong className="text-slate-700">Experience:</strong>{' '}
                        {app.relevantExperience}
                      </p>
                    </div>

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
                              Mark Under Review
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
                          {canReview && !alreadyReviewed && student && (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewTarget({
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
        </section>
      </div>

      {reviewTarget && (
        <LeaveReviewModal
          open={Boolean(reviewTarget)}
          projectId={project.id}
          projectTitle={project.title}
          recipientId={reviewTarget.studentId}
          recipientName={reviewTarget.studentName}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};
