import { MarketMemoryStore } from '../storage/market-memory-store';
import { MarketRegime, MemoryEntry } from '../types/market-memory.types';
export class MemoryQuery {
  private store: MarketMemoryStore;
  constructor() { this.store = new MarketMemoryStore(); }
  async getLastDecisions(limit = 10): Promise<MemoryEntry[]> { return this.store.getAllEntries(limit); }
  async getDecisionsByRegime(regime: MarketRegime): Promise<MemoryEntry[]> { return this.store.queryByRegime(regime); }
  async getOutcomeStats(): Promise<{ total: number; wins: number; avgReturn: number }> { const all = await this.store.getAllEntries(); const completed = all.filter(e => e.outcome); const wins = completed.filter(e => (e.outcome?.futureOutcome ?? 0) > 0).length; const avgReturn = completed.length > 0 ? completed.reduce((s, e) => s + (e.outcome?.returnPercentage ?? 0), 0) / completed.length : 0; return { total: completed.length, wins, avgReturn }; }
}
