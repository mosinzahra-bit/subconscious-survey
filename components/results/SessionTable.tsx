"use client";

import { useState } from "react";

interface SessionRow {
  sessionId: string;
  participantCode: string;
  completedAt: string;
  dScore: number;
  isValid: boolean;
  invalidReason: string | null;
  completionTimeSec: number;
  meanCongruent: number;
  meanIncongruent: number;
  errorRate: number;
}

interface SessionTableProps {
  sessions: SessionRow[];
  onExportCSV: () => void;
  exportLoading?: boolean;
}

export function SessionTable({
  sessions,
  onExportCSV,
  exportLoading = false
}: SessionTableProps) {
  const [sortKey, setSortKey] = useState<keyof SessionRow>("completedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...sessions].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (typeof va === "number" && typeof vb === "number")
      return sortDir === "asc" ? va - vb : vb - va;
    if (typeof va === "string" && typeof vb === "string")
      return sortDir === "asc"
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    if (typeof va === "boolean" && typeof vb === "boolean")
      return sortDir === "asc" ? (va === vb ? 0 : va ? 1 : -1) : vb === va ? 0 : vb ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: keyof SessionRow) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="card-elevated px-4 py-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-heading text-sm">Session-level data</h3>
        <button
          type="button"
          onClick={onExportCSV}
          disabled={exportLoading}
          className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] disabled:opacity-60"
        >
          {exportLoading ? "Preparing…" : "Export CSV"}
        </button>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
        Anonymized participant codes only. Valid/Invalid is set by our
        D-score validity rules (e.g. &gt;10% sub-300ms responses excluded).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--text-muted)] font-data uppercase tracking-[0.12em]">
              <th
                className="text-left py-2 pr-2 cursor-pointer hover:text-[var(--green-soft)]"
                onClick={() => toggleSort("participantCode")}
              >
                Code {sortKey === "participantCode" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-2 px-2 cursor-pointer hover:text-[var(--green-soft)]"
                onClick={() => toggleSort("completionTimeSec")}
              >
                Time (s) {sortKey === "completionTimeSec" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-2 px-2 cursor-pointer hover:text-[var(--green-soft)]"
                onClick={() => toggleSort("dScore")}
              >
                D-Score {sortKey === "dScore" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-2 px-2 cursor-pointer hover:text-[var(--green-soft)]"
                onClick={() => toggleSort("isValid")}
              >
                Valid {sortKey === "isValid" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-left py-2 pl-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr
                key={s.sessionId}
                className="border-t border-[var(--border)] hover:bg-[var(--bg-secondary)]/50"
              >
                <td className="py-2 pr-2 font-data text-[var(--text-secondary)]">
                  {s.participantCode}
                </td>
                <td className="text-right py-2 px-2 font-data">
                  {s.completionTimeSec}
                </td>
                <td className="text-right py-2 px-2 font-data">
                  {s.isValid ? s.dScore.toFixed(4) : "—"}
                </td>
                <td className="text-right py-2 px-2">
                  {s.isValid ? (
                    <span className="text-[var(--green-muted)]">Yes</span>
                  ) : (
                    <span className="text-[var(--red-alert)]">No</span>
                  )}
                </td>
                <td className="py-2 pl-2 text-[11px] text-[var(--text-muted)]">
                  {s.invalidReason ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
