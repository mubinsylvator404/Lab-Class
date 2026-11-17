import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarRating } from '../../components/common/StarRating';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { ApplyProjectModal } from '../../components/projects/ApplyProjectModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { calculateSkillMatch } from '../../services/matchingService';
import { reviewService } from '../../services/reviewService';
import {
  formatCurrency,
  formatDate,
  getProjectStatusStyle,
} from '../../utils/formatters';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, users, applications, reviews } = useApp();
  const { currentUser } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);

  const project = projects.find((p) => p.id === id);
  const client = project ? users.find((u) => u.id === project.clientId) : undefined;

  const clientRating = useMemo(() => {
    if (!client) return { average: 0, total: 0 };
    return reviewService.getSummaryForUser(reviews, client.id);
  }, [reviews, client]);

  const studentMatch = useMemo(() => {
    if (!project || currentUser?.role !== 'student') return null;
    const skillNames = (currentUser.studentProfile?.skills || []).map((s) => s.name);
    return calculateSkillMatch(skillNames, project.requiredSkills);
  }, [project, currentUser]);

  const existingApplication = useMemo(() => {
    if (!project || !currentUser) return undefined;
    return applications.find(
      (a) =>
        a.projectId === project.id &&
        a.studentId === currentUser.id &&
        a.status !== 'Withdrawn'
    );
  }, [project, currentUser, applications]);

  if (!project) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Project Not Found</h1>
          <p className="text-sm text-slate-600">
            This project may have been removed or the URL is invalid.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const statusStyle = getProjectStatusStyle(project.status);
  const isOwner = currentUser?.id === project.clientId;
  const canApply =
    project.status === 'Published' &&
    !isOwner &&
    currentUser?.role !== 'client' &&
    currentUser?.role !== 'admin';

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Explore Projects', to: '/explore' },
            { label: project.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Brief */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{project.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.experienceLevel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Posted {formatDate(project.createdAt)}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {project.title}
              </h1>

              <div className="pt-2 border-t border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">
                  Project Description
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Required Skills
                </h2>
                {project.requiredSkills.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No specific technical or creative skills listed.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill) => {
                      const matched = studentMatch?.matchingSkills.some(
                        (m) => m.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            matched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {matched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Student Skill Match Breakdown */}
              {studentMatch && studentMatch.totalRequired > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-950">
                        Your Skill Compatibility
                      </span>
                      <span className="text-base font-bold font-mono text-blue-700 tabular-nums">
                        {studentMatch.matchPercentage}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-start gap-2 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                        <div>
                          <span className="font-semibold">Matching: </span>
                          {studentMatch.matchingSkills.length > 0
                            ? studentMatch.matchingSkills.join(', ')
                            : 'None yet'}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                        <div>
                          <span className="font-semibold">Missing: </span>
                          {studentMatch.missingSkills.length > 0
                            ? studentMatch.missingSkills.join(', ')
                            : 'None — 100% covered!'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action & Client Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <div className="text-xs text-slate-500">Project Budget</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(project.budget, project.projectType)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{project.projectType}</div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Duration
                  </span>
                  <span className="font-medium text-slate-900">{project.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Deadline
                  </span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {formatDate(project.deadline)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 inline-flex items-center gap-2">
                    <Users className="w-4 h-4" /> Needed
                  </span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {project.requiredStudents}{' '}
                    {project.requiredStudents === 1 ? 'student' : 'students'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Applicants</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {project.applicantsCount}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {isOwner ? (
                  <div className="space-y-2">
                    <Link
                      to={`/client/projects/${project.id}`}
                      className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                    >
                      Manage Project & Applicants
                    </Link>
                    <Link
                      to={`/client/recommended-students?projectId=${project.id}`}
                      className="block w-full text-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      View Recommended Students
                    </Link>
                  </div>
                ) : existingApplication ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 text-center">
                      Application Status:{' '}
                      <span className="font-semibold">{existingApplication.status}</span>
                    </div>
                    <Link
                      to="/student/applications"
                      className="block w-full text-center px-4 py-2.5 text-sm font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      Track in My Applications
                    </Link>
                  </div>
                ) : canApply ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login');
                        return;
                      }
                      setApplyOpen(true);
                    }}
                    className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                  >
                    {currentUser ? 'Apply Now' : 'Sign In to Apply'}
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-100 text-xs text-slate-600 text-center">
                    {project.status !== 'Published'
                      ? `This project is currently ${project.status} and not accepting new applications.`
                      : 'Sign in with a Student account to apply.'}
                  </div>
                )}
              </div>
            </div>

            {client && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="text-xs font-semibold text-slate-500">About the Client</div>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={client.clientProfile?.logo}
                    name={client.clientProfile?.companyName || client.name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/clients/${client.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-700 truncate block"
                    >
                      {client.clientProfile?.companyName || client.name}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {client.name} · {client.clientProfile?.location || 'Remote'}
                    </p>
                  </div>
                </div>

                {client.clientProfile?.companyDescription && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {client.clientProfile.companyDescription}
                  </p>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={clientRating.average} size="sm" />
                    <span className="font-mono text-slate-700 tabular-nums">
                      {clientRating.total > 0
                        ? `${clientRating.average} (${clientRating.total})`
                        : 'New client'}
                    </span>
                  </div>
                  <Link
                    to={`/clients/${client.id}`}
                    className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline"
                  >
                    Profile
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <ApplyProjectModal
        project={applyOpen ? project : null}
        onClose={() => setApplyOpen(false)}
      />
    </PublicLayout>
  );
};
