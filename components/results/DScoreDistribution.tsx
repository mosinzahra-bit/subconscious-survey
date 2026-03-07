"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

interface DScoreDistributionProps {
  data: { bin: number; count: number }[];
  categoryA: string;
  categoryB: string;
  isPassive?: boolean;
}

const ZONE_COLORS: [number, number, string][] = [
  [-2, -0.65, "#dc2626"],
  [-0.65, -0.35, "#ea580c"],
  [-0.35, -0.15, "#ca8a04"],
  [-0.15, 0.15, "#64748b"],
  [0.15, 0.35, "#ca8a04"],
  [0.35, 0.65, "#65a30d"],
  [0.65, 2, "#16a34a"]
];

function getBarColor(bin: number): string {
  for (const [low, high, color] of ZONE_COLORS) {
    if (bin >= low && bin < high) return color;
  }
  return "#64748b";
}

export function DScoreDistribution({
  data,
  categoryA,
  categoryB,
  isPassive
}: DScoreDistributionProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: d.bin.toFixed(2),
    fill: getBarColor(d.bin)
  }));

  return (
    <div className="card-elevated px-4 py-4 space-y-3">
      <h3 className="font-heading text-sm" style={isPassive ? { color: "var(--gold)" } : undefined}>
        {isPassive ? "Linguistic Association Score" : "D-Score distribution"} — where your audience lands
      </h3>
      <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
        {isPassive
          ? "Population-level association strength from language analysis, normalized to the same −2 to +2 scale as live IAT."
          : `Each bar is the count of participants whose subconscious preference score fell in that band. Left = faster association with ${categoryB}; right = faster with ${categoryA}.`}
      </p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              label={{
                value: `${categoryB} ← D-Score → ${categoryA}`,
                position: "insideBottom",
                offset: -4,
                fontSize: 10,
                fill: "var(--text-muted)"
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              label={{
                value: "Participants",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
                fill: "var(--text-muted)"
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 4
              }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(value: number) => [value, "Count"]}
              labelFormatter={(label) => `D ≈ ${label}`}
            />
            <ReferenceLine x={0} stroke="var(--text-muted)" strokeDasharray="2 2" />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
