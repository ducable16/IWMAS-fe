/**
 * Calculates the Gini coefficient for an array of workload scores.
 * Returns 0 (perfect equality) to 1 (perfect inequality).
 */
export function calcGini(scores) {
  if (!scores?.length) return 0
  const sorted = [...scores].sort((a, b) => a - b)
  const n = sorted.length
  const sumNumerator = sorted.reduce((acc, val, i) => acc + (2 * (i + 1) - n - 1) * val, 0)
  const sumAll = sorted.reduce((a, b) => a + b, 0)
  return sumAll === 0 ? 0 : Math.abs(sumNumerator / (n * sumAll))
}

/**
 * Normalizes a raw workload value (hours, tasks) to 0–100 score.
 */
export function normalizeScore(value, min = 0, max = 60) {
  return Math.min(100, Math.max(0, Math.round(((value - min) / (max - min)) * 100)))
}

/**
 * Returns risk level string from workload score.
 */
export function scoreToRisk(score) {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}
