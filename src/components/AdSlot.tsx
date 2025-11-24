type AdSlotProps = {
  title: string;
  description?: string;
  size: string;
};

export default function AdSlot({ title, description, size }: AdSlotProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 via-white/2 to-white/5 p-6 shadow-card">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(17,138,178,0.35),_transparent_60%)]" />
      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Sponsored</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-300">{description}</p>}
      <div className="mt-6 inline-flex items-center rounded-full bg-midnight/80 px-3 py-1 text-xs text-gray-400">
        {size}
      </div>
    </div>
  );
}





