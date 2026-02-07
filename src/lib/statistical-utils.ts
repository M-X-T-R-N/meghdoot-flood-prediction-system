// Statistical Utilities for Meghdoot
// Confidence intervals, variance analysis, and uncertainty quantification

export interface ConfidenceInterval {
  mean: number;
  lower: number;
  upper: number;
  standardError: number;
  variance: number;
  confidenceLevel: number;
  sampleSize: number;
}

export interface UncertaintyBand {
  date: string;
  value: number;
  lower95: number;
  upper95: number;
  lower80: number;
  upper80: number;
}

// Z-scores for common confidence levels
const Z_SCORES: Record<number, number> = {
  0.80: 1.282,
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576,
};

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
}

export function calculateStdDev(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}

export function calculateConfidenceInterval(
  values: number[],
  confidenceLevel: number = 0.95
): ConfidenceInterval {
  const n = values.length;
  if (n === 0) return { mean: 0, lower: 0, upper: 0, standardError: 0, variance: 0, confidenceLevel, sampleSize: 0 };

  const mean = calculateMean(values);
  const variance = calculateVariance(values);
  const stdDev = Math.sqrt(variance);
  const standardError = stdDev / Math.sqrt(n);
  const z = Z_SCORES[confidenceLevel] ?? 1.96;

  return {
    mean: Math.round(mean * 100) / 100,
    lower: Math.round((mean - z * standardError) * 100) / 100,
    upper: Math.round((mean + z * standardError) * 100) / 100,
    standardError: Math.round(standardError * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    confidenceLevel,
    sampleSize: n,
  };
}

// Generate uncertainty bands for a time series
export function generateUncertaintyBands(
  data: { date: string; value: number }[],
  windowSize: number = 7
): UncertaintyBand[] {
  return data.map((point, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1).map(d => d.value);
    const mean = calculateMean(window);
    const stdDev = calculateStdDev(window);

    return {
      date: point.date,
      value: point.value,
      lower95: Math.max(0, Math.round((mean - 1.96 * stdDev) * 100) / 100),
      upper95: Math.round((mean + 1.96 * stdDev) * 100) / 100,
      lower80: Math.max(0, Math.round((mean - 1.282 * stdDev) * 100) / 100),
      upper80: Math.round((mean + 1.282 * stdDev) * 100) / 100,
    };
  });
}

// Calculate RMSE between predicted and actual values
export function calculateRMSE(predicted: number[], actual: number[]): number {
  const n = Math.min(predicted.length, actual.length);
  if (n === 0) return 0;
  const sumSquaredError = predicted.slice(0, n).reduce((s, p, i) => s + (p - actual[i]) ** 2, 0);
  return Math.round(Math.sqrt(sumSquaredError / n) * 100) / 100;
}

// Calculate R-squared coefficient
export function calculateR2(predicted: number[], actual: number[]): number {
  const n = Math.min(predicted.length, actual.length);
  if (n === 0) return 0;
  const actualMean = calculateMean(actual.slice(0, n));
  const ssTot = actual.slice(0, n).reduce((s, a) => s + (a - actualMean) ** 2, 0);
  const ssRes = predicted.slice(0, n).reduce((s, p, i) => s + (p - actual[i]) ** 2, 0);
  if (ssTot === 0) return 0;
  return Math.round((1 - ssRes / ssTot) * 100) / 100;
}
