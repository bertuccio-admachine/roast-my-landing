import type { Finding } from "./rules";

export interface Score {
  total: number; // 0-100
  breakdown: Record<string, number>;
  grade: string;
  emoji: string;
}

const weights: Record<string, number> = {
  Copy: 25,
  Conversion: 25,
  Trust: 15,
  SEO: 15,
  Performance: 10,
  Mobile: 5,
  Accessibility: 3,
  Polish: 2,
};

const penalties: Record<string, number> = {
  critical: 100,
  warning: 40,
  info: 10,
  pass: 0,
};

export function calculateScore(findings: Finding[]): Score {
  const breakdown: Record<string, number> = {};

  for (const [cat, weight] of Object.entries(weights)) {
    const catFindings = findings.filter((f) => f.category === cat);
    if (catFindings.length === 0) {
      breakdown[cat] = weight; // no findings = full marks
      continue;
    }

    let penaltySum = 0;
    for (const f of catFindings) {
      penaltySum += penalties[f.severity];
    }

    const score = Math.max(0, weight - (penaltySum / 100) * weight);
    breakdown[cat] = Math.round(score * 10) / 10;
  }

  const total = Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0));

  let grade: string;
  let emoji: string;
  if (total >= 90) { grade = "A+"; emoji = "🔥"; }
  else if (total >= 80) { grade = "A"; emoji = "💪"; }
  else if (total >= 70) { grade = "B"; emoji = "👍"; }
  else if (total >= 60) { grade = "C"; emoji = "😐"; }
  else if (total >= 50) { grade = "D"; emoji = "😬"; }
  else if (total >= 35) { grade = "F"; emoji = "💀"; }
  else { grade = "F-"; emoji = "🪦"; }

  return { total, breakdown, grade, emoji };
}
