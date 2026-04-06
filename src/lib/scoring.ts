import { SCORING_DIMENSIONS, SCORE_THRESHOLDS, type DimensionKey } from "./constants";

export type DimensionScores = Record<DimensionKey, number>;

export function calculateGlobalScore(scores: Partial<DimensionScores>): number {
  let total = 0;
  for (const dim of SCORING_DIMENSIONS) {
    const score = scores[dim.key] ?? 0;
    total += score * dim.weight;
  }
  return Math.round(total * 10) / 10;
}

export function getScoreColor(score: number): string {
  if (score >= 4.2) return "text-green-400";
  if (score >= 3.8) return "text-yellow-400";
  if (score >= 3.0) return "text-[#cdd6f4]";
  return "text-red-400";
}

export function getScoreRecommendation(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= SCORE_THRESHOLDS.DRAFT_ANSWERS) {
    return { label: "Strong Match", color: "text-green-400", description: "Draft application answers recommended" };
  }
  if (score >= SCORE_THRESHOLDS.RECOMMEND_APPLY) {
    return { label: "Good Fit", color: "text-green-400", description: "Recommended to apply" };
  }
  if (score >= SCORE_THRESHOLDS.GENERATE_PDF) {
    return { label: "Marginal", color: "text-yellow-400", description: "Consider carefully before applying" };
  }
  return { label: "Poor Fit", color: "text-red-400", description: "Not recommended — save your time" };
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}/5`;
}
