export interface AgentPerformanceRecord { agentName: string; regime: string; accuracy: number; samples: number; lastUpdated: number; avgReturn: number; sharpeEstimate: number; }
export interface AgentReliabilityScore { agentName: string; overall: number; byRegime: Record<string, number>; trendStrength: number; }
export interface DynamicWeight { agentName: string; baseWeight: number; adjustedWeight: number; regime: string; confidence: number; }
