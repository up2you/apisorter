type CategoryBadgeProps = {
  label: string;
  count?: number;
  active?: boolean;
};

export default function CategoryBadge({ label, count, active }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-accent bg-accent/20 text-white'
          : 'border-white/10 bg-white/5 text-gray-300 hover:border-accent/60 hover:text-white'
      }`}
    >
      {label}
      {typeof count === 'number' && <span className="text-xs text-gray-400">{count}</span>}
    </span>
  );
}





