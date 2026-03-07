"use client";

import QRCode from "react-qr-code";
import type { StudyConfig } from "@/types/iat";
import { IAT_BLOCKS } from "@/lib/iat/blocks";

interface Step4PreviewProps {
  config: StudyConfig;
  participantMode: "LIVE_IAT" | "PASSIVE_INTELLIGENCE";
  shareUrl?: string;
  embedCode?: string;
  launching: boolean;
  launched: boolean;
  onLaunch: () => void;
}

export function Step4Preview({
  config,
  participantMode,
  shareUrl,
  embedCode,
  launching,
  launched,
  onLaunch
}: Step4PreviewProps) {
  const totalTrials = IAT_BLOCKS.reduce((acc, b) => acc + b.trials, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="badge mb-1">
          Step 4 · Preview &amp; launch{" "}
          {participantMode === "LIVE_IAT" ? "live IAT" : "Passive Intelligence scan"}
        </p>
        <h2 className="font-heading text-xl">Final check before we start collecting behavior.</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          We&apos;ll keep the science strict and the UX simple. You control the question;
          we handle the protocol and analysis.
        </p>
      </div>
      <div className="grid lg:grid-cols-[1.6fr,1.2fr] gap-6 items-start">
        <div className="card-elevated px-4 py-4 space-y-4">
          <h3 className="font-heading text-sm">
            Test flow snapshot — what participants experience
          </h3>
          <div className="text-xs text-[var(--text-secondary)] space-y-2">
            <p>
              • Landing screen with your title and description, 3–5 minute time estimate,
              and an anonymity explanation.
            </p>
            {participantMode === "LIVE_IAT" ? (
              <>
                <p>
                  • 7 blocks of rapid categorization: first separating {config.categoryA.label} vs{" "}
                  {config.categoryB.label}, then attributes, then combined pairings with a
                  key reversal mid-way.
                </p>
                <p>
                  • We record every keypress to the millisecond using <span className="font-data">performance.now()</span>,
                  apply error penalties, and compute Greenwald-style D-scores.
                </p>
              </>
            ) : (
              <>
                <p>
                  • No live participants. Instead, Husbar spins up a background job to mine
                  Reddit, reviews, and social text aligned with your concepts and audience.
                </p>
                <p>
                  • We run behavioral linguistics on that corpus and normalize it to the same
                  −2 to +2 scale for visual comparability.
                </p>
              </>
            )}
            <p>
              • Completion screen thanks participants without exposing individual scores —
              only aggregate patterns will ever be visible.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[var(--text-muted)] font-data uppercase tracking-[0.18em]">
                Categories
              </p>
              <p>
                <span className="font-heading">{config.categoryA.label}</span> vs{" "}
                <span className="font-heading">{config.categoryB.label}</span>
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {config.categoryA.stimuli.length} vs {config.categoryB.stimuli.length} stimuli
                configured.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--text-muted)] font-data uppercase tracking-[0.18em]">
                Attributes
              </p>
              <p>
                <span className="font-heading">{config.attributePositive.label}</span> vs{" "}
                <span className="font-heading">{config.attributeNegative.label}</span>
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Positive set: {config.attributePositive.stimuli.length} words. Negative set:{" "}
                {config.attributeNegative.stimuli.length} words.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--text-muted)] font-data uppercase tracking-[0.18em]">
                Trial design
              </p>
              <p className="font-data">
                {totalTrials} trials · {config.trialsPerBlock.practice} practice /{" "}
                {config.trialsPerBlock.test} test per critical pairing.
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Enough to be statistically meaningful without exhausting participants.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card px-4 py-4 space-y-3">
            <h3 className="font-heading text-sm">Launch &amp; collect data</h3>
            <button
              type="button"
              onClick={onLaunch}
              disabled={launching || launched}
              className="w-full inline-flex items-center justify-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {launched ? "Study launched" : launching ? "Launching..." : "Launch study"}
            </button>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Once launched, you&apos;ll get a shareable link and a QR code. For Passive
              Intelligence, we also start the background data collection job.
            </p>
          </div>
          {shareUrl && (
            <div className="card-elevated px-4 py-4 space-y-3">
              <h3 className="font-heading text-sm">Share with participants</h3>
              <div className="space-y-2 text-xs">
                <p className="text-[var(--text-secondary)]">
                  Send this link to your audience or embed it inside an existing flow. Each
                  session takes about 3–5 minutes.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-[11px] font-data"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="rounded-md border border-[var(--border-bright)] bg-[var(--bg-secondary)] px-3 py-2 text-[10px] font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-md">
                  <QRCode
                    value={shareUrl}
                    size={96}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    style={{ display: "block" }}
                  />
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] space-y-1 max-w-[12rem]">
                  <p>QR is ideal for in-person testing or events: aim people at a simple landing, not a survey maze.</p>
                </div>
              </div>
              {embedCode && (
                <div className="space-y-1 text-xs">
                  <p className="text-[var(--text-muted)] font-data uppercase tracking-[0.18em]">
                    Embed code
                  </p>
                  <textarea
                    readOnly
                    value={embedCode}
                    rows={3}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-[10px] font-data resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

