import { DecisionObject, OutcomeRecord } from '../types/market-memory.types';
import { MarketMemoryStore } from '../storage/market-memory-store';
export class OutcomeTracker {
  private store: MarketMemoryStore;
  constructor() { this.store = new MarketMemoryStore(); }
  async trackOutcome(decisionId: string, decision: DecisionObject, currentPrice: number, highSince: number, lowSince: number): Promise<OutcomeRecord> {
    const entryPrice = decision.marketSnapshot.xauPrice;
    const returnPct = ((currentPrice - entryPrice) / entryPrice) * 100;
    const directionMultiplier = decision.consensus.verdict.includes('LONG') ? 1 : -1;
    const futureOutcome = returnPct * directionMultiplier;
    const mfe = ((highSince - entryPrice) / entryPrice) * 100 * directionMultiplier;
    const mae = ((lowSince - entryPrice) / entryPrice) * 100 * directionMultiplier;
    const outcome: OutcomeRecord = { decisionTimestamp: decision.timestamp, futureOutcome, returnPercentage: returnPct, mae, mfe, regime: decision.regime, bias: decision.consensus.verdict, confidence: decision.consensus.confidence, consensusLevel: decision.consensus.agents.filter(a => a.bias === decision.consensus.verdict.split(' ')[0]).length };
    await this.store.updateOutcome(decisionId, outcome);
    return outcome;
  }
}
