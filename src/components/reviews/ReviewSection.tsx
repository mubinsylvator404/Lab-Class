import React, { useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';
import { StarRating } from '../common/StarRating';

export const ReviewSection: React.FC<{ recipientId: string }> = ({ recipientId }) => {
  const { reviews, users, projects } = useApp();

  const recipientReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.recipientId === recipientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews, recipientId]
  );

  const summary = useMemo(
    () => reviewService.getSummaryForUser(reviews, recipientId),
    [reviews, recipientId]
  );

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ratings & Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified feedback from completed SkillBridge projects
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {summary.total > 0 ? summary.average.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              {summary.total} {summary.total === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          <StarRating rating={summary.average} size="md" />
        </div>
      </div>

      {summary.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.distribution[star];
            const pct = Math.round((count / summary.total) * 100);
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-8 font-mono text-slate-600 tabular-nums">{star}★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-slate-500 tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {recipientReviews.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center">
          <MessageSquare className="w-7 h-7 text-slate-300 mb-2" />
          No reviews have been recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recipientReviews.map((review) => {
            const reviewer = users.find((u) => u.id === review.reviewerId);
            const project = projects.find((p) => p.id === review.projectId);
            return (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={reviewer?.studentProfile?.photo || reviewer?.clientProfile?.logo}
                      name={reviewer?.name || 'Reviewer'}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {reviewer?.name || 'SkillBridge Member'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project?.title || 'Completed Project'} · {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed pl-12">
                  {review.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
