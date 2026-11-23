export function CompanyChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
      style={{ background: color }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" aria-hidden />
      <span className="truncate">{name}</span>
    </span>
  );
}
