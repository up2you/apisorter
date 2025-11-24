import Image from 'next/image';
import Link from 'next/link';

interface ApiCardProps {
  slug: string;
  name: string;
  category: string;
  tags: string[];
  providerName?: string | null;
  providerLogo?: string | null;
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
  freeTier,
  rating = 0,
  reviewCount = 0,
}: ApiCardProps) {
  return (
    <Link href={`/api/${slug}`}>
      <article className="card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-lg cursor-pointer">
        {/* 頂部裝飾條 */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-highlight to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="flex flex-1 flex-col gap-4 p-6">
          {/* 提供者信息 */}
          {providerLogo && (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white/5">
                <Image
                  src={providerLogo}
                  alt={providerName || 'Provider'}
                  fill
                  className="object-cover"
                />
              </div>
              {providerName && (
                <span className="text-xs font-medium text-gray-400">{providerName}</span>
              )}
            </div>
          )}

          {/* 標題和分類 */}
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors duration-200 line-clamp-2">
              {name}
            </h3>
            <div className="mt-2 inline-block">
              <span className="badge badge-secondary text-xs">
                {category}
              </span>
            </div>
          </div>

          {/* 標籤 */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-block rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 免費層信息 */}
          {freeTier && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
              <span className="text-xs font-semibold text-green-400">✓ Free tier</span>
              <span className="text-xs text-green-300">{freeTier}</span>
            </div>
          )}
        </div>

        {/* 底部評分和評論 */}
        <div className="border-t border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rating > 0 ? (
                <>
                  <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${
                          i < Math.round(rating)
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
                <span className="text-xs text-gray-500">No ratings yet</span>
              )}
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>
        </div>

        {/* 懸停時的箭頭指示 */}
        <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-accent/0 text-accent transition-all duration-300 group-hover:bg-accent/20">
          <span className="text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">→</span>
        </div>
      </article>
    </Link>
  );
}
