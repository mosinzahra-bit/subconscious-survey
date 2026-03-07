"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface ReactionTimeChartProps {
  congruent: number;
  incongruent: number;
  categoryA: string;
  categoryB: string;
}

export function ReactionTimeChart({
  congruent,
  incongruent,
  categoryA,
  categoryB
}: ReactionTimeChartProps) {
  const data = [
    {
      name: "Congruent",
      value: Math.round(congruent),
      fill: "var(--green-muted)",
      description: `${categoryA} + Positive / ${categoryB} + Negative`
    },
    {
      name: "Incongruent",
      value: Math.round(incongruent),
      fill: "var(--gold)",
      description: `${categoryB} + Positive / ${categoryA} + Negative`
    }
  ];

  return (
    <div className="card-elevated px-4 py-4 space-y-3">
      <h3 className="font-heading text-sm">Reaction time comparison</h3>
      <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
        People took {Math.round(incongruent - congruent)}ms longer when the
        pairing was incongruent. That gap is the raw signal we normalize into
        the D-score.
      </p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              unit=" ms"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 4
              }}
              formatter={(value: number, _name, props: { payload?: { description: string } }) => [
                `${value} ms`,
                props.payload?.description ?? ""
              ]}
            />
            <Bar dataKey="value" radius={[0, 2, 2, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
