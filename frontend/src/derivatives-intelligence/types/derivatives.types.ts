export interface GammaExposure { totalGamma: number; gammaPerStrike: Record<number, number>; flipPoint: number; regime: 'POSITIVE_GAMMA' | 'NEGATIVE_GAMMA' | 'NEUTRAL'; }
export interface DeltaExposure { totalDelta: number; deltaByExpiry: Record<string, number>; netDirection: 'LONG' | 'SHORT' | 'FLAT'; }
export interface PutCallRatio { ratio: number; signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; volumePut: number; volumeCall: number; }
export interface DealerPositioning { netPosition: number; gammaProfile: string; keyLevels: { support: number; resistance: number }; }
export interface MaxPain { maxPainStrike: number; currentPrice: number; distancePct: number; magnet: boolean; }
export interface ExpectedMove { expectedMoveUp: number; expectedMoveDown: number; impliedRange: [number, number]; }
export interface VolatilityRegimeDeriv { current: 'LOW_VOL' | 'NORMAL_VOL' | 'HIGH_VOL' | 'EXTREME_VOL'; percentile: number; termStructure: 'CONTANGO' | 'BACKWARDATION' | 'FLAT'; }
