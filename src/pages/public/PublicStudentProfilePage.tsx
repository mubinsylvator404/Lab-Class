import React, { useMemo, useState } from 'react';
import {
  ExternalLink,
  FolderGit2,
  Globe,
  GraduationCap,
  Linkedin,
  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarRating } from '../../components/common/StarRating';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { ReviewSection } from '../../components/reviews/ReviewSection';
import { useApp } from '../../context/AppContext';
import { reviewService } from '../../services/reviewService';
import { PortfolioItem } from '../../types';
import { formatDate } from '../../utils/formatters';

export const PublicStudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { users, portfolios, reviews } = useApp();
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);

  const student = users.find((u) => u.id === id && u.role === 'student');
  const studentPortfolios = useMemo(
    () => portfolios.filter((p) => p.studentId === id),
    [portfolios, id]
  );

  const ratingSummary = useMemo(
    () => (id ? reviewService.getSummaryForUser(reviews, id) : { average: 0, total: 0 }),
    [reviews, id]
  );

  if (!student || !student.studentProfile) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">Student Profile Not Found</h1>
          <Link
            to="/explore"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg"
          >
            Explore Projects
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const profile = student.studentProfile;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Explore Projects', to: '/explore' },
            { label: student.name },
          ]}
        />

        {/* Profile Header Card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <Avatar src={profile.photo} name={student.name} size="xl" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">{profile.availability}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profile.experienceLevel}</span>
                  {profile.studentId && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{profile.studentId}</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {student.name}
                </h1>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {profile.university || 'University'} · {profile.department || 'Student'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <StarRating rating={ratingSummary.average} size="sm" />
                  <span className="text-xs font-mono text-slate-600 tabular-nums">
                    {ratingSummary.total > 0
                      ? `${ratingSummary.average.toFixed(1)} (${ratingSummary.total} reviews)`
                      : 'No reviews yet'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-2">
              <h2 className="text-sm font-semibold text-slate-900">Biography</h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {profile.bio || 'No biography added yet.'}
              </p>
              {profile.education && (
                <p className="text-xs text-slate-500 pt-1">
                  Education: <span className="text-slate-700 font-medium">{profile.education}</span>
                </p>
              )}
            </div>

            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Skills & Proficiency ({profile.skills.length})
              </h2>
              {profile.skills.length === 0 ? (
                <p className="text-sm text-slate-500">No skills added yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-3.5 py-2 flex items-center justify-between text-xs bg-white"
                    >
                      <span className="font-medium text-slate-900">{skill.name}</span>
                      <span className="text-slate-500">
                        {skill.category === 'technical' ? 'Technical' : 'Creative'} ·{' '}
                        <span className="text-blue-700 font-medium">{skill.proficiency}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Portfolio Showcase */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Portfolio Projects ({studentPortfolios.length})
            </h2>
          </div>

          {studentPortfolios.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              No portfolio case studies published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {studentPortfolios.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          No Preview Image
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="text-xs text-slate-500">
                        {item.category} · {formatDate(item.completionDate)}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                      <p className="text-xs text-slate-500 pt-1">
                        Tech: {item.technologies.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Preview Case Study
                    </button>
                    <div className="flex items-center gap-3 text-xs">
                      {item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 hover:text-slate-900"
                        >
                          Code
                        </a>
                      )}
                      {item.liveUrl && (
                        <a
                          href={item.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                        >
                          Live <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <ReviewSection recipientId={student.id} />
      </div>

      {/* Portfolio Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{previewItem.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Close preview"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {previewItem.image && (
                <img
                  src={previewItem.image}
                  alt={previewItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full rounded-lg border border-slate-200 max-h-80 object-cover"
                />
              )}
              <div className="text-xs text-slate-500">
                {previewItem.category} · Completed {formatDate(previewItem.completionDate)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {previewItem.description}
              </p>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Technologies: </span>
                {previewItem.technologies.join(' · ')}
              </div>
              <div className="pt-3 flex items-center gap-3">
                {previewItem.githubUrl && (
                  <a
                    href={previewItem.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    View GitHub Repository
                  </a>
                )}
                {previewItem.liveUrl && (
                  <a
                    href={previewItem.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  >
                    Open Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};
