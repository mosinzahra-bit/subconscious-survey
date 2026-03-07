export interface Interpretation {
  label: string;
  strength: "strong" | "moderate" | "slight" | "neutral";
  color: string;
}

export function interpretDScore(
  d: number,
  categoryA: string,
  categoryB: string
): Interpretation {
  if (d > 0.65)
    return {
      label: `Strong preference for ${categoryA}`,
      strength: "strong",
      color: "#16a34a"
    };
  if (d > 0.35)
    return {
      label: `Moderate preference for ${categoryA}`,
      strength: "moderate",
      color: "#65a30d"
    };
  if (d > 0.15)
    return {
      label: `Slight preference for ${categoryA}`,
      strength: "slight",
      color: "#ca8a04"
    };
  if (d >= -0.15)
    return {
      label: "No significant implicit preference",
      strength: "neutral",
      color: "#64748b"
    };
  if (d >= -0.35)
    return {
      label: `Slight preference for ${categoryB}`,
      strength: "slight",
      color: "#ca8a04"
    };
  if (d >= -0.65)
    return {
      label: `Moderate preference for ${categoryB}`,
      strength: "moderate",
      color: "#ea580c"
    };
  return {
    label: `Strong preference for ${categoryB}`,
    strength: "strong",
    color: "#dc2626"
  };
}

