import React, { useMemo } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarRating } from '../../components/common/StarRating';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ReviewSection } from '../../components/reviews/ReviewSection';
import { useApp } from '../../context/AppContext';
import { reviewService } from '../../services/reviewService';

export const PublicClientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { users, projects, reviews } = useApp();

  const client = users.find((u) => u.id === id && u.role === 'client');
  const clientProjects = useMemo(
    () => projects.filter((p) => p.clientId === id && p.status !== 'Draft'),
    [projects, id]
  );

  const ratingSummary = useMemo(
    () => (id ? reviewService.getSummaryForUser(reviews, id) : { average: 0, total: 0 }),
    [reviews, id]
  );

  if (!client) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">Client Profile Not Found</h1>
          <Link
            to="/explore"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg"
          >
            Back to Marketplace
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const profile = client.clientProfile;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Explore Projects', to: '/explore' },
            { label: profile?.companyName || client.name },
          ]}
        />

        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={profile?.logo}
                name={profile?.companyName || client.name}
                size="xl"
              />
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile?.companyName || client.name}
                </h1>
                <p className="text-sm text-slate-600">Contact: {client.name}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  {profile?.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.location}
                    </span>
                  )}
                  {profile?.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StarRating rating={ratingSummary.average} size="md" />
              <span className="text-sm font-mono text-slate-700 tabular-nums">
                {ratingSummary.total > 0
                  ? `${ratingSummary.average.toFixed(1)} (${ratingSummary.total})`
                  : 'New Client'}
              </span>
            </div>
          </div>

          {profile?.companyDescription && (
            <p className="text-sm text-slate-700 leading-relaxed pt-4 border-t border-slate-100">
              {profile.companyDescription}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Published Projects ({clientProjects.length})
          </h2>
          {clientProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              This client has no published projects at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clientProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  client={client}
                  showApplyButton={false}
                />
              ))}
            </div>
          )}
        </section>

        <ReviewSection recipientId={client.id} />
      </div>
    </PublicLayout>
  );
};
