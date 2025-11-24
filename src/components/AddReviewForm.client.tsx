"use client";

import { useState } from 'react';

import RatingStars from './RatingStars.client';

type AddReviewFormProps = {
  apiId: string;
  onSubmitted?: () => Promise<void> | void;
};

export default function AddReviewForm({ apiId, onSubmitted }: AddReviewFormProps) {
  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim()) {
      setError('Please provide a nickname.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/reviews/${apiId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), rating, comment }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to submit review');
      }

      setNickname('');
      setComment('');
      setRating(5);
      await onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-card"
    >
      <div>
        <label htmlFor="nickname" className="text-xs uppercase tracking-wide text-gray-400">
          Anonymous nickname
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="e.g. ModelBuilder42"
          maxLength={60}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-midnight/60 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <span className="text-xs uppercase tracking-wide text-gray-400">Your rating</span>
        <div className="mt-2 flex items-center gap-3">
          <RatingStars rating={rating} onRate={setRating} size="lg" />
          <span className="text-sm text-gray-400">{rating} / 5</span>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-xs uppercase tracking-wide text-gray-400">
          Share your experience (optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What makes this API useful? Any caveats?"
          maxLength={750}
          rows={4}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-midnight/60 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <p className="mt-1 text-right text-xs text-gray-500">{comment.length}/750</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-midnight transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Publish Review'}
      </button>
    </form>
  );
}
