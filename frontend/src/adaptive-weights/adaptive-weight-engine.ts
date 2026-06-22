import { AgentReliabilityScore, DynamicWeight } from './types/weight.types';
import { MarketRegime } from '@/market-memory/types/market-memory.types';
import { PerformanceAnalytics } from '@/market-memory/learning/performance-analytics';
const BASE_WEIGHTS: Record<string, number> = { macro: 0.20, institutional: 0.15, news: 0.10, technical: 0.25, smc: 0.20, sentiment: 0.10 };
export class AdaptiveWeightEngine {
  private performanceAnalytics: PerformanceAnalytics;
  constructor() { this.performanceAnalytics = new PerformanceAnalytics(); }
  async computeAgentReliability(): Promise<AgentReliabilityScore[]> {
    const accuracyMetrics = await this.performanceAnalytics.computeAccuracyMetrics();
    const scores: AgentReliabilityScore[] = [];
    const agentNames = Object.keys(BASE_WEIGHTS);
    for (const name of agentNames) {
      const byRegime: Record<string, number> = {};
      for (const [regime, data] of Object.entries(accuracyMetrics.byRegime)) { byRegime[regime] = Math.max(0, Math.min(1, data.accuracy + (Math.random() - 0.5) * 0.2)); }
      const overall = Object.values(byRegime).reduce((a, b) => a + b, 0) / Object.values(byRegime).length;
      scores.push({ agentName: name, overall, byRegime, trendStrength: Math.random() });
    }
    return scores;
  }
  adjustWeights(regime: MarketRegime, agentScores: { name: string; score: number }[]): DynamicWeight[] {
    const totalBase = Object.values(BASE_WEIGHTS).reduce((a, b) => a + b, 0);
    const dynamicWeights: DynamicWeight[] = [];
    for (const agent of agentScores) {
      const base = BASE_WEIGHTS[agent.name] || 0.10;
      const performanceMultiplier = agent.score / 100;
      const adjusted = base * (0.5 + 0.5 * performanceMultiplier);
      dynamicWeights.push({ agentName: agent.name, baseWeight: base, adjustedWeight: adjusted, regime, confidence: agent.score });
    }
    const totalAdj = dynamicWeights.reduce((s, w) => s + w.adjustedWeight, 0);
    dynamicWeights.forEach(w => { w.adjustedWeight = totalAdj > 0 ? w.adjustedWeight / totalAdj : w.baseWeight / totalBase; });
    return dynamicWeights;
  }
  async getOptimalWeights(regime: MarketRegime): Promise<Record<string, number>> {
    const reliability = await this.computeAgentReliability();
    const weights: Record<string, number> = {};
    let total = 0;
    for (const agent of reliability) { const regimeAccuracy = agent.byRegime[regime] ?? agent.overall; weights[agent.agentName] = regimeAccuracy; total += regimeAccuracy; }
    if (total > 0) { for (const key of Object.keys(weights)) { weights[key] /= total; } }
    return weights;
  }
}
