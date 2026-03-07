"use client";

import { useEffect, useState } from "react";
import { DScoreDistribution } from "@/components/results/DScoreDistribution";
import { ReactionTimeChart } from "@/components/results/ReactionTimeChart";
import { PassiveDataDisclaimer } from "@/components/passive/PassiveDataDisclaimer";
import { AccuracyHeatmap } from "@/components/results/AccuracyHeatmap";
import { AssociationMap } from "@/components/results/AssociationMap";
import { SessionTable } from "@/components/results/SessionTable";
import { InsightPanel } from "@/components/results/InsightPanel";

interface ResultsData {
  studyId: string;
  title: string;
  participantMode: string;
  categoryA: string;
  categoryB: string;
  validSessionCount: number;
  totalSessions: number;
  meanDScore: number;
  dScoreStd?: number;
  confidenceInterval?: [number, number];
  interpretationLabel: string;
  interpretationStrength: string;
  interpretationColor: string;
  avgErrorRate: number;
  avgCompletionTime: number;
  meanRTCongruent: number;
  meanRTIncongruent: number;
  rtGap: number;
  dScoreDistribution: { bin: number; count: number }[];
  rtComparison: { congruent: number; incongruent: number };
  blockAccuracy: { blockIndex: number; correct: number; total: number }[];
  associationMap: Record<string, { positive: number; negative: number }>;
  sessions: {
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
  }[];
  isPassive?: boolean;
  pasConfidence?: number;
  pasSampleCount?: number;
}

export default function ResultsClient({ studyId }: { studyId: string }) {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/studies/${studyId}/results`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studyId]);

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/export`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study_${studyId}_sessions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="card px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
        Calculating D-scores and loading results…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Valid participants
          </p>
          <p className="font-data text-2xl">{data.validSessionCount}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            of {data.totalSessions} completed and passed validity
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Mean D-Score
          </p>
          <p className="font-data text-2xl">{data.meanDScore.toFixed(2)}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            −2 to +2 scale
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Avg completion time
          </p>
          <p className="font-data text-2xl">{data.avgCompletionTime}s</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            per participant
          </p>
        </div>
        <div className="card-elevated px-4 py-3 space-y-1">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Interpretation
          </p>
          <p
            className="font-heading text-sm"
            style={{ color: data.interpretationColor }}
          >
            {data.interpretationLabel}
          </p>
        </div>
      </div>

      {data.isPassive && <PassiveDataDisclaimer />}

      {data.isPassive && data.pasConfidence != null && (
        <div className="card-elevated px-4 py-3 flex items-center gap-4">
          <p className="text-[10px] font-data uppercase tracking-[0.18em] text-[var(--gold)]">
            Linguistic Association Score
          </p>
          <p className="font-data text-xl" style={{ color: "var(--gold)" }}>
            {data.meanDScore.toFixed(2)} ± {(1 - (data.pasConfidence ?? 0)).toFixed(2)} — {Math.round((data.pasConfidence ?? 0) * 100)}% confidence
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Based on {data.pasSampleCount ?? 0} text samples from public sources.
          </p>
        </div>
      )}

      <InsightPanel
        validSessionCount={data.validSessionCount}
        meanDScore={data.meanDScore}
        interpretationLabel={data.interpretationLabel}
        categoryA={data.categoryA}
        categoryB={data.categoryB}
        confidenceInterval={data.confidenceInterval}
      />

      <DScoreDistribution
        data={data.dScoreDistribution}
        categoryA={data.categoryA}
        categoryB={data.categoryB}
        isPassive={data.isPassive}
      />

      {!data.isPassive && (
        <ReactionTimeChart
          congruent={data.meanRTCongruent}
          incongruent={data.meanRTIncongruent}
          categoryA={data.categoryA}
          categoryB={data.categoryB}
        />
      )}

      {!data.isPassive && <AccuracyHeatmap blockAccuracy={data.blockAccuracy} />}

      <AssociationMap
        categoryA={data.categoryA}
        categoryB={data.categoryB}
        associationMap={data.associationMap}
      />

      {!data.isPassive && (
        <SessionTable
          sessions={data.sessions}
          onExportCSV={handleExportCSV}
          exportLoading={exportLoading}
        />
      )}
    </div>
  );
}
