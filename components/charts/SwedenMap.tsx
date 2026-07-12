"use client";

import { useMemo, useState } from "react";
import type { CityPoint } from "@/lib/charts";
import { borderPath, cityPoint, MAP_W, MAP_H } from "@/lib/geo";

type Placed = {
  city: string;
  value: number;
  x: number;
  y: number;
  r: number;
  rank: number;
};

const LABEL_TOP = 8; // always label this many biggest cities

export function SwedenMap({ data }: { data: CityPoint[] }) {
  const [hover, setHover] = useState<string | null>(null);

  const { placed, elsewhere } = useMemo(() => {
    const max = data.reduce((m, d) => Math.max(m, d.value), 1);
    const placed: Placed[] = [];
    let elsewhere = 0;
    let rank = 0;
    for (const d of data) {
      const pt = cityPoint(d.city);
      if (!pt) {
        elsewhere += d.value;
        continue;
      }
      const r = 3.5 + (Math.sqrt(d.value) / Math.sqrt(max)) * 12;
      placed.push({ city: d.city, value: d.value, x: pt[0], y: pt[1], r, rank: rank++ });
    }
    placed.sort((a, b) => b.r - a.r);
    return { placed, elsewhere };
  }, [data]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="mx-auto h-[460px] w-auto max-w-full"
        role="img"
        aria-label="Map of Sweden showing companies by city"
      >
        {/* Land */}
        <path
          d={borderPath()}
          fill="#E9EDF3"
          stroke="#C2C9D4"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* City markers */}
        {placed.map((p) => {
          const active = hover === p.city;
          return (
            <g key={p.city}>
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? p.r + 1.5 : p.r}
                fill="#F5C500"
                stroke="#1A1A2E"
                strokeWidth={1.4}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHover(p.city)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${capitalize(p.city)}: ${p.value}`}</title>
              </circle>
            </g>
          );
        })}

        {/* Persistent labels for the biggest cities */}
        {placed
          .filter((p) => p.rank < LABEL_TOP)
          .map((p) => {
            const right = p.x < MAP_W * 0.62;
            const lx = right ? p.x + p.r + 4 : p.x - p.r - 4;
            return (
              <text
                key={`l-${p.city}`}
                x={lx}
                y={p.y + 3.2}
                fontSize={10.5}
                fontWeight={600}
                fill="#151A24"
                textAnchor={right ? "start" : "end"}
                pointerEvents="none"
                style={{ paintOrder: "stroke", stroke: "#F4F6F9", strokeWidth: 3 }}
              >
                {capitalize(p.city)}
              </text>
            );
          })}
      </svg>

      <p className="mt-2 text-center text-xs text-ink-muted">
        Dot size = number of companies
        {elsewhere > 0 ? ` · ${elsewhere} in other/unmapped locations` : ""}
      </p>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
