export type MarketRegime = 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGE' | 'HIGH_VOL' | 'LOW_VOL' | 'BREAKOUT' | 'UNKNOWN';
export interface AgentScore { agentName: string; score: number; bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confidence: number; }
export interface ConsensusSnapshot { overallScore: number; verdict: string; confidence: number; conviction: number; agents: AgentScore[]; }
export interface DecisionObject { timestamp: number; regime: MarketRegime; scores: AgentScore[]; consensus: ConsensusSnapshot; executionContext: ExecutionContext; marketSnapshot: MarketSnapshot; }
export interface ExecutionContext { spread: number; volatility: number; liquidity: number; newsProximity: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'; }
export interface MarketSnapshot { xauPrice: number; dxy: number; ust10y: number; realYield: number; vix: number; }
export interface OutcomeRecord { decisionTimestamp: number; futureOutcome: number; returnPercentage: number; mae: number; mfe: number; regime: MarketRegime; bias: string; confidence: number; consensusLevel: number; }
export interface AccuracyMetrics { overall: number; byRegime: Record<MarketRegime, { accuracy: number; samples: number }>; byBias: Record<string, { accuracy: number; samples: number }>; byConfidence: { high: number; medium: number; low: number }; byConsensusLevel: Record<number, { accuracy: number; samples: number }>; }
export interface MemoryEntry { id: string; decision: DecisionObject; outcome?: OutcomeRecord; createdAt: string; }
