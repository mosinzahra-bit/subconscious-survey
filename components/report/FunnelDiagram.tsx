"use client";

import { useState } from "react";

interface Layer {
  layer: string;
  tool: string;
  psychologicalRole: string;
  automation: string;
  copyDirection: string;
  emailSequence?: { day: number; trigger: string; psychologicalPurpose: string; subjectLine: string }[];
}

export function FunnelDiagram({ layers }: { layers: Layer[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {layers.map((layer, i) => (
        <div
          key={i}
          className="rounded-md border border-[var(--border)] overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--green-muted)]"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, var(--green-deep), var(--green-vivid))`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bg-primary)"
                }}
              >
                {i + 1}
              </span>
              <span className="font-heading text-sm">{layer.layer}</span>
              <span className="text-xs text-[var(--text-muted)]">— {layer.tool}</span>
            </div>
            <span className="text-[var(--text-muted)]">{expanded === i ? "▼" : "▶"}</span>
          </button>
          {expanded === i && (
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-primary)] space-y-2 text-xs text-[var(--text-secondary)]">
              <p><strong className="text-[var(--text-muted)]">Psychology:</strong> {layer.psychologicalRole}</p>
              <p><strong className="text-[var(--text-muted)]">Automation:</strong> {layer.automation}</p>
              <p><strong className="text-[var(--text-muted)]">Copy direction:</strong> {layer.copyDirection}</p>
              {layer.emailSequence && layer.emailSequence.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[var(--text-muted)] font-data uppercase tracking-[0.12em]">Email sequence</p>
                  {layer.emailSequence.map((e, j) => (
                    <p key={j}>
                      Day {e.day}: {e.trigger} — {e.psychologicalPurpose}. Subject: {e.subjectLine}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
