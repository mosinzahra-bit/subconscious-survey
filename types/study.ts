import type { Study, Session, Trial } from "@prisma/client";
import type { StudyConfig } from "./iat";

export type StudyWithConfig = Study & {
  config: StudyConfig;
};

export interface StudyResultsSummary {
  validSessionCount: number;
  meanDScore: number;
  interpretationLabel: string;
  avgErrorRate: number;
  avgCompletionTime: number;
  meanRTCongruent: number;
  meanRTIncongruent: number;
  rtGap: number;
}

export type SessionWithTrials = Session & {
  trials: Trial[];
};

