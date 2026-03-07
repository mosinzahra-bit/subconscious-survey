"use client";

import { useState, useEffect } from "react";
import type { StrategyReportData } from "@/lib/report/generate-strategy";
import { FunnelDiagram } from "@/components/report/FunnelDiagram";
import { DIYDFYSelector } from "@/components/report/DIYDFYSelector";

interface ReportRecord {
  id: string;
  version: number;
  generatedAt: string;
  reportData: StrategyReportData;
}

interface ReportClientProps {
  studyId: string;
  studyTitle: string;
  initialReports: ReportRecord[];
  calendlyUrl?: string | null;
}

export default function ReportClient({
  studyId,
  studyTitle,
  initialReports,
  calendlyUrl
}: ReportClientProps) {
  const [reports, setReports] = useState<ReportRecord[]>(initialReports);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports[0]?.id ?? null
  );
  const [generating, setGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const selected = reports.find((r) => r.id === selectedId);
  const data = selected?.reportData;

  useEffect(() => {
    if (initialReports.length) setReports(initialReports);
    if (initialReports[0] && !selectedId) setSelectedId(initialReports[0].id);
  }, [initialReports, selectedId]);

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/report/generate`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Generate failed");
      const json = await res.json();
      const listRes = await fetch(`/api/studies/${studyId}/report`);
      const listData = await listRes.json();
      setReports(listData.reports ?? []);
      if (json.report?.id) setSelectedId(json.report.id);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/report/export?reportId=${selectedId}&format=pdf`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Husbar_Strategy_Report_${studyTitle.replace(/\s/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="card px-6 py-12 space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          No strategy report yet. Generate one from your study results.
        </p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={generating}
          className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60"
        >
          {generating ? "Generating…" : "Generate strategy report"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Version
          </label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value || null)}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                v{r.version} — {new Date(r.generatedAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={generating}
            className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:border-[var(--border-bright)] disabled:opacity-60"
          >
            {generating ? "Generating…" : "Regenerate report"}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={pdfLoading}
            className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60"
          >
            {pdfLoading ? "Preparing…" : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="card-elevated px-5 py-4 border-l-4 border-[var(--green-vivid)]">
        <h2 className="font-callout text-lg mb-2">Executive summary</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {data.executiveSummary}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PillarCard title="Pillar 1 — Signal" headline={data.pillar1_signal.headline}>
          <p className="text-xs text-[var(--text-secondary)] mb-2">{data.pillar1_signal.psychologicalState}</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            <strong>Awareness stage:</strong> {data.pillar1_signal.awarenessStage}. {data.pillar1_signal.awarenessRationale}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">{data.pillar1_signal.implication}</p>
        </PillarCard>
        <PillarCard title="Pillar 2 — Trigger" headline={data.pillar2_trigger.headline}>
          <p className="text-xs text-[var(--text-secondary)] mb-2">{data.pillar2_trigger.triggerRationale}</p>
          <p className="text-[11px] text-[var(--gold)] font-data">Dominant trigger: {data.pillar2_trigger.dominantTrigger}</p>
          <ul className="mt-2 list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
            {data.pillar2_trigger.activationExamples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </PillarCard>
        <PillarCard title="Pillar 3 — Friction" headline={data.pillar3_friction.headline}>
          <p className="text-xs text-[var(--text-secondary)] mb-2">{data.pillar3_friction.frictionRationale}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Friction type: {data.pillar3_friction.frictionType}</p>
          <ul className="mt-2 list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
            {data.pillar3_friction.frictionRemovalPrinciples.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </PillarCard>
        <PillarCard title="Pillar 4 — Bridge" headline={data.pillar4_bridge.headline}>
          <p className="text-xs text-[var(--text-secondary)] mb-2">{data.pillar4_bridge.messagingArchitecture}</p>
          <div className="text-[11px] text-[var(--text-muted)] space-y-1">
            <p><strong>Website:</strong> {data.pillar4_bridge.channelRecommendations.website.heroMessage}</p>
            <p><strong>Email:</strong> {data.pillar4_bridge.channelRecommendations.email.exampleSubjectLine}</p>
            <p><strong>Paid ads:</strong> {data.pillar4_bridge.channelRecommendations.paidAds.exampleHeadline}</p>
          </div>
        </PillarCard>
        <PillarCard title="Pillar 5 — Anchor" headline={data.pillar5_anchor.headline}>
          <p className="text-[11px] text-[var(--gold)] font-data">Archetype: {data.pillar5_anchor.brandArchetype}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">{data.pillar5_anchor.archetypeRationale}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2"><strong>12-month goal:</strong> {data.pillar5_anchor["12MonthAssociationGoal"]}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">{data.pillar5_anchor.loyaltyPsychology}</p>
        </PillarCard>
      </div>

      <div className="card-elevated px-5 py-4">
        <h3 className="font-heading text-sm mb-3">Pillar 6 — Automation stack</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">{data.pillar6_automation.headline}</p>
        <FunnelDiagram layers={data.pillar6_automation.funnelLayers} />
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
          <span>Tools: {data.pillar6_automation.totalToolsRequired.join(", ")}</span>
          <span>— Setup: {data.pillar6_automation.estimatedSetupTime}</span>
          <span>— Est. cost: {data.pillar6_automation.estimatedMonthlyAutomationCost}</span>
        </div>
      </div>

      <DIYDFYSelector studyId={studyId} reportId={selectedId ?? ""} calendlyUrl={calendlyUrl} />
    </div>
  );
}

function PillarCard({
  title,
  headline,
  children
}: {
  title: string;
  headline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card px-4 py-4 space-y-2">
      <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {title}
      </p>
      <h3 className="font-heading text-sm">{headline}</h3>
      {children}
    </div>
  );
}
