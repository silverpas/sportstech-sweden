"use client";

type TooltipProps = {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: Record<string, unknown> }[];
  label?: string | number;
  unit?: string;
  labelFormatter?: (label: string | number) => string;
};

/** Shared light tooltip for Recharts. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit,
  labelFormatter,
}: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
      {label !== undefined && (
        <div className="mb-0.5 font-medium text-ink">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="text-ink-soft">
        <span className="font-semibold text-navy">{entry.value}</span>
        {unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
}
