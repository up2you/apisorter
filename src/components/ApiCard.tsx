import Link from 'next/link';

interface ApiCardProps {
  slug: string;
  name: string;
  category: string;
  tags: string[];
  description?: string | null;
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
  description,
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
      <article className="card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 cursor-pointer">
        {/* Top Decoration Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-highlight to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Header: Logo & Title */}
          <div className="flex items-start gap-4">
            {displayLogo && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-white/5 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayLogo} alt={name || 'API Logo'} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-secondary text-[10px] px-2 py-0.5">
                  {category}
                </span>
                {providerName && (
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{providerName}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors duration-200 line-clamp-1">
                {name}
              </h3>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed h-[2.5rem]">
              {description}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-md bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent/80 border border-accent/10"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-block rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-gray-500 border border-white/10">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Stats & Free Tier */}
        <div className="border-t border-white/5 bg-white/[0.02] px-5 py-3 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs font-medium text-gray-300">
                  {rating > 0 ? rating.toFixed(1) : 'New'}
                </span>
                {reviewCount > 0 && (
                  <span className="text-[10px] text-gray-500">({reviewCount})</span>
                )}
              </div>
            </div>

            {freeTier ? (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                <span className="text-[11px] font-medium text-green-400/90">Free Tier</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 opacity-50">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
                <span className="text-[11px] font-medium text-gray-500">Paid</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
