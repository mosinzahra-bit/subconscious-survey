"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { StudyConfig } from "@/types/iat";
import { IAT_BLOCKS } from "@/lib/iat/blocks";
import { shuffleStimuli, type StimulusItem } from "@/lib/iat/randomize";
import { StimulusDisplay } from "@/components/iat/StimulusDisplay";
import { CategoryLabels } from "@/components/iat/CategoryLabels";
import { BlockInstructions } from "@/components/iat/BlockInstructions";
import { ProgressBar } from "@/components/iat/ProgressBar";

interface TakePageProps {
  params: { shareToken: string };
}

// NOTE: In a full implementation this page would be a server component
// that fetches the study by shareToken and passes StudyConfig + sessionId
// into a client IAT engine. For now we scaffold the engine UI and wiring.

const DEFAULT_THEME = {
  backgroundColor: "#040d09",
  textColor: "#f0fdf4",
  accentColor: "#22c55e"
};

export default function TakePage({ params }: TakePageProps) {
  const search = useSearchParams();
  const [config] = useState<StudyConfig>({
    measurementGoal: "brand_preference",
    categoryA: { label: "Brand A", stimuli: ["Alpha", "Apex", "Prime", "Nova"] },
    categoryB: { label: "Brand B", stimuli: ["Beta", "Flux", "Core", "Shift"] },
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
    theme: DEFAULT_THEME,
    completionMessage:
      "Thank you. Your responses have been recorded. This test measures response speed, not right or wrong answers.",
    language: "en"
  });

  const [sessionId] = useState<string | null>(null);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const stimuliSequence = useMemo(() => {
    const blocks: StimulusItem[][] = [];

    IAT_BLOCKS.forEach((block) => {
      let items: StimulusItem[] = [];
      switch (block.type) {
        case "target_practice":
        case "reversed_target_practice":
          items = [
            ...config.categoryA.stimuli.map((s) => ({ value: s, type: "target_a" as const })),
            ...config.categoryB.stimuli.map((s) => ({ value: s, type: "target_b" as const }))
          ];
          break;
        case "attribute_practice":
          items = [
            ...config.attributePositive.stimuli.map((s) => ({
              value: s,
              type: "attribute_pos" as const
            })),
            ...config.attributeNegative.stimuli.map((s) => ({
              value: s,
              type: "attribute_neg" as const
            }))
          ];
          break;
        default:
          items = [
            ...config.categoryA.stimuli.map((s) => ({ value: s, type: "target_a" as const })),
            ...config.categoryB.stimuli.map((s) => ({ value: s, type: "target_b" as const })),
            ...config.attributePositive.stimuli.map((s) => ({
              value: s,
              type: "attribute_pos" as const
            })),
            ...config.attributeNegative.stimuli.map((s) => ({
              value: s,
              type: "attribute_neg" as const
            }))
          ];
          break;
      }
      blocks.push(shuffleStimuli(items, block.trials));
    });

    return blocks;
  }, [config]);

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        // In full implementation: pause test and show overlay
      }
    });
  }, []);

  const totalTrials =
    IAT_BLOCKS.reduce((acc, block) => acc + block.trials, 0);
  const completedTrials = IAT_BLOCKS.slice(0, currentBlockIndex).reduce(
    (acc, block) => acc + block.trials,
    0
  ) + trialIndex;

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: config.theme.backgroundColor }}
    >
      <div className="w-full max-w-5xl h-screen sm:h-[90vh] px-4 py-6 sm:py-8 text-[var(--text-primary)] select-none">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-data">
              Subconscious Survey · Husbar
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Takes approximately 3–5 minutes. Responses are completely anonymous.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-data text-[var(--green-soft)]">
              Part {currentBlockIndex + 1} of {IAT_BLOCKS.length}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              We measure response speed, not your stated opinions.
            </p>
          </div>
        </div>

        <ProgressBar
          value={(completedTrials / totalTrials) * 100}
        />

        <div className="relative mt-8 h-[70vh] card-elevated overflow-hidden">
          <CategoryLabels
            config={config}
            block={IAT_BLOCKS[currentBlockIndex]}
          />

          {showInstructions ? (
            <BlockInstructions
              block={IAT_BLOCKS[currentBlockIndex]}
              config={config}
              onContinue={() => setShowInstructions(false)}
            />
          ) : isComplete ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center space-y-4">
              <h2 className="font-heading text-2xl">Thank you.</h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-md">
                Your responses have been recorded. This study looks at how quickly
                people connect concepts under time pressure. Individual scores are
                not shown, because the science here relies on aggregate patterns.
              </p>
            </div>
          ) : (
            <StimulusDisplay
              blockIndex={currentBlockIndex}
              trialIndex={trialIndex}
              totalTrials={IAT_BLOCKS[currentBlockIndex].trials}
              stimulus={stimuliSequence[currentBlockIndex][trialIndex]}
              theme={config.theme}
              onTrialComplete={(payload) => {
                const blockDef = IAT_BLOCKS[currentBlockIndex];

                // TODO: send payload to /api/take/[shareToken]/trial with sessionId
                // including blockIndex, trialIndex, stimulus, payload.hadError, payload.reactionTimeMs

                const isLastTrialInBlock = trialIndex + 1 >= blockDef.trials;
                const isLastBlock =
                  currentBlockIndex === IAT_BLOCKS.length - 1;

                if (isLastTrialInBlock && isLastBlock) {
                  setIsComplete(true);
                  return;
                }

                if (isLastTrialInBlock) {
                  setCurrentBlockIndex((prev) => prev + 1);
                  setTrialIndex(0);
                  setShowInstructions(true);
                  return;
                }

                setTrialIndex((prev) => prev + 1);
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

