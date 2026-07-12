"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearPoint } from "@/lib/charts";
import { ChartTooltip } from "./ChartTooltip";

export function GrowthChart({ data }: { data: YearPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="navyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A1A2E" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#1A1A2E" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EDEFF3" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#8A93A3", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "#8A93A3", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={36}
        />
        <Tooltip
          cursor={{ stroke: "#C7CDD6", strokeWidth: 1 }}
          content={
            <ChartTooltip
              unit="companies (total)"
              labelFormatter={(l) => `Year ${l}`}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#1A1A2E"
          strokeWidth={2}
          fill="url(#navyFill)"
          activeDot={{ r: 4, fill: "#1A1A2E", stroke: "#ffffff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
