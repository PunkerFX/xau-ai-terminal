export interface IntermarketAsset { symbol: string; price: number; change: number; }
export interface CorrelationPair { asset1: string; asset2: string; correlation: number; strength: 'STRONG_POSITIVE' | 'MODERATE_POSITIVE' | 'WEAK' | 'MODERATE_NEGATIVE' | 'STRONG_NEGATIVE'; }
export interface CorrelationMatrix { assets: string[]; matrix: number[][]; rollingWindow: number; }
export interface IntermarketSnapshot { assets: IntermarketAsset[]; correlationMatrix: CorrelationMatrix; rollingCorrelations: CorrelationPair[]; goldBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; keyDrivers: string[]; }
