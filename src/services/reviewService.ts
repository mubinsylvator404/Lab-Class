import { Review } from '../types';
import { generateId, getItem, setItem, STORAGE_KEYS } from './storageService';

export interface RatingSummary {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const reviewService = {
  getAll(): Review[] {
    return getItem<Review[]>(STORAGE_KEYS.REVIEWS, []);
  },

  saveAll(reviews: Review[]): void {
    setItem(STORAGE_KEYS.REVIEWS, reviews);
  },

  create(
    reviews: Review[],
    data: Omit<Review, 'id' | 'createdAt'>
  ): { review?: Review; updatedReviews: Review[]; error?: string } {
    const duplicate = reviews.some(
      (r) =>
        r.projectId === data.projectId &&
        r.reviewerId === data.reviewerId &&
        r.recipientId === data.recipientId
    );
    if (duplicate) {
      return {
        updatedReviews: reviews,
        error: 'You have already submitted a review for this project.',
      };
    }

    const review: Review = {
      ...data,
      id: generateId('rev'),
      createdAt: new Date().toISOString(),
    };
    const updatedReviews = [review, ...reviews];
    this.saveAll(updatedReviews);
    return { review, updatedReviews };
  },

  getSummaryForUser(reviews: Review[], userId: string): RatingSummary {
    const userReviews = reviews.filter((r) => r.recipientId === userId);
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    let sum = 0;
    for (const r of userReviews) {
      const clamped = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[clamped] += 1;
      sum += r.rating;
    }
    const total = userReviews.length;
    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    return { average, total, distribution };
  },
};
