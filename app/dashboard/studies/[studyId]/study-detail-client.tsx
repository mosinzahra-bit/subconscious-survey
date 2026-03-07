"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

interface StudyDetailClientProps {
  studyId: string;
  status: string;
  shareUrl: string;
  participantCount: number;
  completedCount: number;
  validCount: number;
  invalidCount: number;
  participantMode: string;
  passiveJobStatus: string | null;
  passiveJobProgress: Record<string, unknown> | null;
}

export default function StudyDetailClient({
  studyId,
  status: initialStatus,
  shareUrl,
  participantCount: initialParticipantCount,
  completedCount: initialCompletedCount,
  validCount: initialValidCount,
  invalidCount: initialInvalidCount,
  participantMode,
  passiveJobStatus,
  passiveJobProgress
}: StudyDetailClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [participantCount, setParticipantCount] = useState(initialParticipantCount);
  const [completedCount, setCompletedCount] = useState(initialCompletedCount);
  const [validCount, setValidCount] = useState(initialValidCount);
  const [invalidCount, setInvalidCount] = useState(initialInvalidCount);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (participantMode !== "LIVE_IAT") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/studies/${studyId}`);
        if (!res.ok) return;
        const data = await res.json();
        setParticipantCount(data.participantCount ?? 0);
        setCompletedCount(data.completedCount ?? 0);
        setValidCount(data.validCount ?? 0);
        setInvalidCount(data.invalidCount ?? 0);
      } catch (_) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [studyId, participantMode]);

  const handleStatusChange = async (newStatus: "ACTIVE" | "CLOSED") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/studies/${studyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) setStatus(newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = `<iframe src="${shareUrl}" width="800" height="600" style="border:0;max-width:100%;" title="Subconscious Survey — Husbar"></iframe>`;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Status
          </p>
          <p className="font-data text-sm">
            <span
              className={
                status === "ACTIVE"
                  ? "text-[var(--green-vivid)]"
                  : status === "CLOSED"
                  ? "text-[var(--text-muted)]"
                  : "text-[var(--gold)]"
              }
            >
              {status}
            </span>
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Started
          </p>
          <p className="font-data text-sm">{participantCount}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            participants opened the link
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Completed
          </p>
          <p className="font-data text-sm">{completedCount}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            finished the full test
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Valid / Flagged
          </p>
          <p className="font-data text-sm">
            {validCount} / {invalidCount}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            We exclude &gt;10% sub-300ms responses
          </p>
        </div>
      </div>

      {participantMode === "PASSIVE_INTELLIGENCE" && passiveJobStatus && (
        <div className="card px-4 py-3 border-[var(--gold)]/40">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--gold)] mb-2">
            Passive Intelligence job
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Status: <span className="font-data">{passiveJobStatus}</span>
            {passiveJobProgress &&
              typeof passiveJobProgress.collected === "number" && (
                <span className="ml-2">
                  — {String(passiveJobProgress.collected)} /{" "}
                  {String(passiveJobProgress.total)} samples
                </span>
              )}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status === "ACTIVE" && (
          <button
            type="button"
            onClick={() => handleStatusChange("CLOSED")}
            disabled={updating}
            className="inline-flex items-center rounded-md border border-[var(--red-alert)]/60 bg-transparent px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--red-alert)] hover:bg-[var(--red-alert)]/10 disabled:opacity-60"
          >
            {updating ? "Updating…" : "Close study"}
          </button>
        )}
        {status === "CLOSED" && (
          <button
            type="button"
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={updating}
            className="inline-flex items-center rounded-md border border-[var(--green-vivid)] bg-transparent px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--green-vivid)] hover:bg-[var(--green-vivid)]/10 disabled:opacity-60"
          >
            {updating ? "Updating…" : "Reopen study"}
          </button>
        )}
      </div>

      <div className="card-elevated px-5 py-4 space-y-4">
        <h2 className="font-heading text-sm">Shareable link</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-xl">
          Waiting for behavioral data. Share your study link — responses take
          3–5 minutes and participants need no preparation.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 min-w-[200px] rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data"
          />
          <button
            type="button"
            onClick={copyLink}
            className="rounded-md border border-[var(--border-bright)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-md">
            <QRCode
              value={shareUrl}
              size={80}
              bgColor="#ffffff"
              fgColor="#000000"
              style={{ display: "block" }}
            />
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            QR code for in-person or event-based data collection.
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Embed code
          </p>
          <textarea
            readOnly
            value={embedCode}
            rows={2}
            className="w-full max-w-xl rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-[10px] font-data resize-none"
          />
        </div>
      </div>
    </div>
  );
}
