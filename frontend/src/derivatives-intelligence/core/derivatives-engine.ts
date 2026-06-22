import { MockDerivativesAdapter } from '../adapters/mock-data-adapter';
import { GammaExposure, DeltaExposure, PutCallRatio, DealerPositioning, MaxPain, ExpectedMove, VolatilityRegimeDeriv } from '../types/derivatives.types';
export interface DerivativesSnapshot { gamma: GammaExposure; delta: DeltaExposure; putCall: PutCallRatio; dealer: DealerPositioning; maxPain: MaxPain; expectedMove: ExpectedMove; volRegime: VolatilityRegimeDeriv; bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; score: number; }
export class DerivativesEngine {
  private adapter: MockDerivativesAdapter;
  constructor() { this.adapter = new MockDerivativesAdapter(); }
  async analyze(currentPrice: number): Promise<DerivativesSnapshot> {
    const [gamma, delta, putCall, dealer, maxPain, expectedMove, volRegime] = await Promise.all([this.adapter.fetchGammaExposure(currentPrice), this.adapter.fetchDeltaExposure(), this.adapter.fetchPutCallRatio(), this.adapter.fetchDealerPositioning(), this.adapter.fetchMaxPain(currentPrice), this.adapter.fetchExpectedMove(currentPrice), this.adapter.fetchVolatilityRegime()]);
    let score = 50;
    if (gamma.regime === 'POSITIVE_GAMMA') score += 10; else if (gamma.regime === 'NEGATIVE_GAMMA') score -= 10;
    if (delta.netDirection === 'LONG') score += 8; else if (delta.netDirection === 'SHORT') score -= 8;
    if (putCall.signal === 'BULLISH') score += 7; else if (putCall.signal === 'BEARISH') score -= 7;
    if (maxPain.magnet) score += 5;
    score = Math.max(10, Math.min(90, score));
    const bias = score >= 60 ? 'BULLISH' : score <= 40 ? 'BEARISH' : 'NEUTRAL';
    return { gamma, delta, putCall, dealer, maxPain, expectedMove, volRegime, bias, score };
  }
}
