export type VolatilityRegime = 'LOW_VOL' | 'NORMAL_VOL' | 'HIGH_VOL' | 'EXTREME_VOL';
export interface VolatilitySnapshot { vix: number; gvz: number; vvix: number; realizedVolatility: number; atrExpansion: number; regime: VolatilityRegime; percentile: number; bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; }
