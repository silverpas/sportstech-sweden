import { SECTOR_ORDER, SECTOR_COLORS, SECTOR_LABELS } from "@/lib/sectors";

export function SectorLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      {SECTOR_ORDER.map((key) => (
        <span key={key} className="inline-flex items-center gap-2 text-sm text-ink-soft">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: SECTOR_COLORS[key] }}
          />
          {SECTOR_LABELS[key]}
        </span>
      ))}
    </div>
  );
}
