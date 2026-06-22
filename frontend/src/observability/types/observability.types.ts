export interface AgentHealth { name: string; status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'; latency: number; accuracy: number; reliability: number; lastProcessed: number; }
export interface EngineHealth { name: string; status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'; latency: number; uptime: number; errorRate: number; }
export interface ConsensusHealth { agreementLevel: number; divergenceFlag: boolean; lastConsensusScore: number; }
export interface MemoryHealth { totalEntries: number; entriesWithOutcome: number; oldestEntry: number; newestEntry: number; storageSize: number; }
