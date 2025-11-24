"use client";

import { formatDistanceToNow } from 'date-fns';

import RatingStars from './RatingStars.client';

type Review = {
  id: string;
  nickname: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type ReviewListProps = {
  reviews: Review[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-400">Be the first to leave a review.</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-3xl border border-white/5 bg-white/5 p-5 transition-shadow hover:shadow-[0_25px_60px_-30px_rgba(17,138,178,0.35)]"
        >
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{review.nickname}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </p>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </header>
          {review.comment && (
            <p className="mt-3 text-sm leading-relaxed text-gray-300">{review.comment}</p>
          )}
        </article>
      ))}
    </div>
  );
}
