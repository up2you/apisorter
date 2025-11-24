import Link from 'next/link';

interface ApiCardProps {
  slug: string;
  name: string;
  category: string;
  tags: string[];
  providerName?: string | null;
  providerLogo?: string | null;
  apiLogo?: string | null;
  freeTier?: string | null;
  rating?: number;
  reviewCount?: number;
}

export default function ApiCard({
  slug,
  name,
  category,
  tags,
  providerName,
  providerLogo,
  apiLogo,
  freeTier,
  rating = 0,
  reviewCount = 0,
}: ApiCardProps) {
  const displayLogo = apiLogo || providerLogo;

  return (
    <Link href={`/api/${slug}`}>
      <article className="card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-lg cursor-pointer">
        {/* Top Decoration Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-highlight to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* Provider Info */}
          {displayLogo && (
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayLogo} alt={name || 'API Logo'} className="h-full w-full object-cover" />
              </div>
              {providerName && (
                <span className="text-xs font-medium text-gray-400 truncate">{providerName}</span>
              )}
            </div>
          )}

          {/* Title and Category */}
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors duration-200 line-clamp-1">
              {name}
            </h3>
            <div className="mt-1.5 inline-block">
              <span className="badge badge-secondary text-[10px] px-2 py-0.5">
                {category}
              </span>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Free Tier Info */}
          {freeTier && (
            <div className="mt-auto flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-green-400">✓ Free tier</span>
              <span className="text-[10px] text-green-300 truncate">{freeTier}</span>
            </div>
          )}
        </div>

        {/* Bottom Rating and Reviews */}
        <div className="border-t border-white/5 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {rating > 0 ? (
                <>
                  <span className="text-xs font-semibold text-white">{rating.toFixed(1)}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-[10px] ${i < Math.round(rating)
                          ? 'text-highlight'
                          : 'text-gray-600'
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-[10px] text-gray-500">No ratings yet</span>
              )}
            </div>
            {reviewCount > 0 && (
              <span className="text-[10px] text-gray-400">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>
        </div>

        {/* Hover Arrow Indicator */}
        <div className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent/0 text-accent transition-all duration-300 group-hover:bg-accent/20">
          <span className="text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">→</span>
        </div>
      </article>
    </Link>
  );
}
