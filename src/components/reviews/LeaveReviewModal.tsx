import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StarRating } from '../common/StarRating';

interface LeaveReviewModalProps {
  open: boolean;
  projectId: string;
  projectTitle: string;
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  open,
  projectId,
  projectTitle,
  recipientId,
  recipientName,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { submitReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!open || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (comment.trim().length < 10) {
      setError('Please enter at least 10 characters describing your experience.');
      return;
    }

    const res = submitReview({
      projectId,
      reviewerId: currentUser.id,
      recipientId,
      rating,
      comment: comment.trim(),
    });

    if (res.error) {
      setError(res.error);
      return;
    }

    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="review-modal-title" className="text-base font-semibold text-slate-900">
              Leave a Review for {recipientName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{projectTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Star Rating *
            </label>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                {rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Written Review *
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share constructive feedback about working with ${recipientName}...`}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
