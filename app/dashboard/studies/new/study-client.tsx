"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudyConfig } from "@/types/iat";
import { Step1Goal } from "@/components/study-builder/Step1Goal";
import { Step2Concepts } from "@/components/study-builder/Step2Concepts";
import { Step3Attributes } from "@/components/study-builder/Step3Attributes";
import { Step4Preview } from "@/components/study-builder/Step4Preview";
import {
  PassiveSourceConfig,
  PassiveSourceConfig as PassiveSourceConfigType
} from "@/components/passive/PassiveSourceConfig";

const DEFAULT_CONFIG: StudyConfig = {
  measurementGoal: "brand_preference",
  categoryA: {
    label: "Brand A",
    stimuli: ["Alpha", "Apex", "Prime", "Nova"]
  },
  categoryB: {
    label: "Brand B",
    stimuli: ["Beta", "Flux", "Core", "Shift"]
  },
  attributePositive: {
    label: "Positive",
    stimuli: ["Wonderful", "Excellent", "Joyful", "Pleasant", "Brilliant", "Happy"]
  },
  attributeNegative: {
    label: "Negative",
    stimuli: ["Awful", "Terrible", "Dreadful", "Unpleasant", "Miserable", "Failure"]
  },
  trialsPerBlock: {
    practice: 20,
    test: 40
  },
  theme: {
    backgroundColor: "#040d09",
    textColor: "#f0fdf4",
    accentColor: "#22c55e"
  },
  completionMessage:
    "Thank you. Your responses have been recorded. This study measures response speed, not right or wrong answers.",
  language: "en"
};

type ParticipantMode = "LIVE_IAT" | "PASSIVE_INTELLIGENCE";

export default function NewStudyClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("New implicit study");
  const [description, setDescription] = useState("");
  const [participantMode, setParticipantMode] =
    useState<ParticipantMode>("LIVE_IAT");
  const [config, setConfig] = useState<StudyConfig>(DEFAULT_CONFIG);
  const [passiveConfig, setPassiveConfig] = useState<PassiveSourceConfigType>({
    sources: ["reddit", "reviews"],
    targetAudience: "",
    dateRange: "90d",
    language: "en",
    minSamples: 500
  });
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | undefined>(undefined);

  const studyEmbedCode = shareUrl
    ? `<iframe src="${shareUrl}" width="800" height="600" style="border:0;max-width:100%;" title="Subconscious Survey — Husbar"></iframe>`
    : undefined;

  const canGoNext =
    step === 1
      ? Boolean(title && description)
      : step === 2
      ? config.categoryA.label &&
        config.categoryB.label &&
        config.categoryA.stimuli.length >= 4 &&
        config.categoryB.stimuli.length >= 4
      : step === 3
      ? config.attributePositive.stimuli.length >= 4 &&
        config.attributeNegative.stimuli.length >= 4
      : true;

  const handleLaunch = async () => {
    if (launching || launched) return;
    setLaunching(true);

    const res = await fetch("/api/studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        config,
        participantMode,
        passiveConfig
      })
    });

    if (!res.ok) {
      setLaunching(false);
      return;
    }

    const data = (await res.json()) as { id: string; shareToken: string };
    const url = `${window.location.origin}/take/${data.shareToken}`;
    setShareUrl(url);
    setLaunched(true);
    setLaunching(false);
  };

  const onStep1Change = (value: {
    title: string;
    description: string;
    measurementGoal: any;
    participantMode: ParticipantMode;
  }) => {
    setTitle(value.title);
    setDescription(value.description);
    setParticipantMode(value.participantMode);
    setConfig((prev) => ({
      ...prev,
      measurementGoal: value.measurementGoal
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="badge mb-1">New study</p>
          <h1 className="font-heading text-2xl">
            Turn a business question into a behavioral experiment.
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/studies")}
          className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] underline decoration-[var(--green-muted)] underline-offset-4"
        >
          Back to studies
        </button>
      </div>
      <div className="flex items-center gap-3 text-[10px] font-data uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <span className={step >= 1 ? "text-[var(--green-soft)]" : ""}>1 · Goal</span>
        <span className="opacity-60">/</span>
        <span className={step >= 2 ? "text-[var(--green-soft)]" : ""}>2 · Concepts</span>
        <span className="opacity-60">/</span>
        <span className={step >= 3 ? "text-[var(--green-soft)]" : ""}>
          3 · Attributes
        </span>
        <span className="opacity-60">/</span>
        <span className={step >= 4 ? "text-[var(--green-soft)]" : ""}>
          4 · Preview &amp; launch
        </span>
      </div>
      <div className="card px-5 py-5 space-y-6">
        {step === 1 && (
          <Step1Goal
            title={title}
            description={description}
            measurementGoal={config.measurementGoal}
            participantMode={participantMode}
            onChange={onStep1Change}
          />
        )}
        {step === 2 && (
          <>
            <Step2Concepts
              categoryA={config.categoryA}
              categoryB={config.categoryB}
              onChange={({ categoryA, categoryB }) =>
                setConfig((prev) => ({ ...prev, categoryA, categoryB }))
              }
            />
            {participantMode === "PASSIVE_INTELLIGENCE" && (
              <PassiveSourceConfig
                value={passiveConfig}
                onChange={setPassiveConfig}
              />
            )}
          </>
        )}
        {step === 3 && (
          <Step3Attributes
            attributePositive={config.attributePositive}
            attributeNegative={config.attributeNegative}
            onChange={({ attributePositive, attributeNegative }) =>
              setConfig((prev) => ({ ...prev, attributePositive, attributeNegative }))
            }
          />
        )}
        {step === 4 && (
          <Step4Preview
            config={config}
            participantMode={participantMode}
            shareUrl={shareUrl}
            embedCode={studyEmbedCode}
            launching={launching}
            launched={launched}
            onLaunch={handleLaunch}
          />
        )}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="text-xs font-data uppercase tracking-[0.18em] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-3">
            {step < 4 && (
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="inline-flex items-center rounded-md border border-[var(--border-bright)] bg-[var(--green-deep)] px-3 py-2 text-xs font-data uppercase tracking-[0.18em] text-[var(--bg-primary)] hover:bg-[var(--green-vivid)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

