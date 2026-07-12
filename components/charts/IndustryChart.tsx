"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Datum } from "@/lib/charts";
import { ChartTooltip } from "./ChartTooltip";

export function IndustryChart({ data }: { data: Datum[] }) {
  const height = Math.max(220, data.length * 34 + 20);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
        barCategoryGap="22%"
      >
        <CartesianGrid horizontal={false} stroke="#EDEFF3" />
        <XAxis
          type="number"
          tick={{ fill: "#8A93A3", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fill: "#556072", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(21,26,36,0.04)" }}
          content={<ChartTooltip unit="companies" />}
        />
        <Bar dataKey="value" fill="#1A1A2E" radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList dataKey="value" position="right" fill="#556072" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
