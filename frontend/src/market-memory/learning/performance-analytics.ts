import { MemoryEntry, AccuracyMetrics, MarketRegime } from '../types/market-memory.types';
import { MarketMemoryStore } from '../storage/market-memory-store';
export class PerformanceAnalytics {
  private store: MarketMemoryStore;
  constructor() { this.store = new MarketMemoryStore(); }
  async computeAccuracyMetrics(entries?: MemoryEntry[]): Promise<AccuracyMetrics> {
    const data = entries || await this.store.getAllEntries();
    const completed = data.filter(e => e.outcome);
    const correct = (e: MemoryEntry) => (e.outcome?.futureOutcome ?? 0) > 0;
    const overall = completed.length > 0 ? completed.filter(correct).length / completed.length : 0;
    const byRegime = {} as AccuracyMetrics['byRegime'];
    const regimes: MarketRegime[] = ['TRENDING_UP','TRENDING_DOWN','RANGE','HIGH_VOL','LOW_VOL','BREAKOUT'];
    for (const regime of regimes) { const group = completed.filter(e => e.decision.regime === regime); byRegime[regime] = { accuracy: group.length > 0 ? group.filter(correct).length / group.length : 0, samples: group.length }; }
    const byBias: AccuracyMetrics['byBias'] = {};
    for (const bias of ['LONG BIAS','SHORT BIAS','NEUTRAL']) { const group = completed.filter(e => e.decision.consensus.verdict === bias); byBias[bias] = { accuracy: group.length > 0 ? group.filter(correct).length / group.length : 0, samples: group.length }; }
    const highConf = completed.filter(e => e.decision.consensus.confidence >= 70);
    const medConf = completed.filter(e => e.decision.consensus.confidence >= 40 && e.decision.consensus.confidence < 70);
    const lowConf = completed.filter(e => e.decision.consensus.confidence < 40);
    const byConfidence = { high: highConf.length > 0 ? highConf.filter(correct).length / highConf.length : 0, medium: medConf.length > 0 ? medConf.filter(correct).length / medConf.length : 0, low: lowConf.length > 0 ? lowConf.filter(correct).length / lowConf.length : 0 };
    const byConsensusLevel: AccuracyMetrics['byConsensusLevel'] = {};
    for (let i = 0; i <= 6; i++) { const group = completed.filter(e => e.outcome?.consensusLevel === i); byConsensusLevel[i] = { accuracy: group.length > 0 ? group.filter(correct).length / group.length : 0, samples: group.length }; }
    return { overall, byRegime, byBias, byConfidence, byConsensusLevel };
  }
}
