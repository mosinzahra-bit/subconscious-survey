/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import type { StimulusItem } from "@/lib/iat/randomize";

interface StimulusDisplayProps {
  blockIndex: number;
  trialIndex: number;
  totalTrials: number;
  stimulus: StimulusItem;
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  onTrialComplete: (payload: {
    hadError: boolean;
    reactionTimeMs: number;
    pressedKey: string;
    correctKey: string;
  }) => void;
}

// CRITICAL: timing via performance.now(), not Date.now()

export function StimulusDisplay({
  blockIndex,
  trialIndex,
  totalTrials,
  stimulus,
  theme,
  onTrialComplete
}: StimulusDisplayProps) {
  const [hadError, setHadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBlank, setIsBlank] = useState(false);

  const onsetRef = useRef<number | null>(null);
  const listeningRef = useRef(false);
  const hadErrorRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  // Register key listener only after stimulus render
  useEffect(() => {
    setHadError(false);
    hadErrorRef.current = false;
    setErrorMessage(null);
    setIsBlank(false);

    // Inter-stimulus interval: 250ms blank before showing new stimulus
    listeningRef.current = false;
    onsetRef.current = null;

    const isi = window.setTimeout(() => {
      // Stimulus is now on screen — mark onset precisely
      window.requestAnimationFrame(() => {
        onsetRef.current = performance.now();
        listeningRef.current = true;
      });
    }, 250);

    timeoutRef.current = isi;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!listeningRef.current || onsetRef.current == null) return;

      const key = event.key.toLowerCase();
      if (key !== "e" && key !== "i") {
        return;
      }

      // Remove listener immediately on first keypress
      listeningRef.current = false;

      const rt = Math.round(performance.now() - onsetRef.current);

      const correctKey =
        stimulus.type === "target_a" || stimulus.type === "attribute_pos"
          ? "e"
          : "i";

      const isCorrect = key === correctKey;

      if (!isCorrect) {
        // Error: show feedback and require correction
        setHadError(true);
        hadErrorRef.current = true;
        setErrorMessage("Incorrect key. Use the key that matches the category at the top.");

        // Allow correction: re-enable listening but keep same stimulus and onset
        window.requestAnimationFrame(() => {
          onsetRef.current = performance.now();
          listeningRef.current = true;
        });
        return;
      }

      // Correct response: finalize trial
      setErrorMessage(null);
      setIsBlank(true);

      onTrialComplete({
        hadError: hadErrorRef.current,
        reactionTimeMs: rt,
        pressedKey: key,
        correctKey
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
      listeningRef.current = false;
    };
  }, [blockIndex, trialIndex, totalTrials, stimulus.value, stimulus.type]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="flex-1 flex items-center justify-center w-full">
        {!isBlank && (
          <span
            className="font-heading text-[clamp(2.8rem,6vw,4.5rem)] tracking-tight"
            style={{ color: theme.textColor }}
          >
            {stimulus.value}
          </span>
        )}
      </div>
      <div className="h-20 flex flex-col items-center justify-center gap-2 mb-6">
        {hadError && (
          <div className="flex items-center gap-2 text-sm font-data text-[var(--red-alert)]">
            <span className="text-lg">✗</span>
            <span>{errorMessage}</span>
          </div>
        )}
        <p className="text-[11px] text-[var(--text-muted)] font-data">
          Desktop: use E for left category, I for right. On mobile, tap left or right
          side.
        </p>
      </div>
    </div>
  );
}

