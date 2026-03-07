export type BlockType =
  | "target_practice"
  | "attribute_practice"
  | "combined_congruent_practice"
  | "combined_congruent_test"
  | "reversed_target_practice"
  | "combined_incongruent_practice"
  | "combined_incongruent_test";

export interface BlockDefinition {
  index: number; // 0-based
  type: BlockType;
  trials: number;
  description: string;
}

export const IAT_BLOCKS: BlockDefinition[] = [
  {
    index: 0,
    type: "target_practice",
    trials: 20,
    description: "Target discrimination practice"
  },
  {
    index: 1,
    type: "attribute_practice",
    trials: 20,
    description: "Attribute discrimination practice"
  },
  {
    index: 2,
    type: "combined_congruent_practice",
    trials: 20,
    description: "Combined congruent practice"
  },
  {
    index: 3,
    type: "combined_congruent_test",
    trials: 40,
    description: "Combined congruent test"
  },
  {
    index: 4,
    type: "reversed_target_practice",
    trials: 20,
    description: "Reversed target discrimination practice"
  },
  {
    index: 5,
    type: "combined_incongruent_practice",
    trials: 20,
    description: "Combined incongruent practice"
  },
  {
    index: 6,
    type: "combined_incongruent_test",
    trials: 40,
    description: "Combined incongruent test"
  }
];

