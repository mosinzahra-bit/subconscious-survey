export type MeasurementGoal =
  | "brand_preference"
  | "product_preference"
  | "pricing_sensitivity"
  | "message_resonance"
  | "custom";

export interface StudyCategoryConfig {
  label: string;
  stimuli: string[];
}

export interface StudyThemeConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface StudyConfig {
  measurementGoal: MeasurementGoal;
  categoryA: StudyCategoryConfig;
  categoryB: StudyCategoryConfig;
  attributePositive: StudyCategoryConfig;
  attributeNegative: StudyCategoryConfig;
  trialsPerBlock: {
    practice: 20;
    test: 40;
  };
  theme: StudyThemeConfig;
  completionMessage: string;
  language: string;
}

