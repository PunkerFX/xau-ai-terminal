import { MemoryEntry, DecisionObject, OutcomeRecord, MarketRegime } from '../types/market-memory.types';
const STORAGE_KEY = 'xau_market_memory';
export class MarketMemoryStore {
  private getData(): MemoryEntry[] { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  private saveData(entries: MemoryEntry[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
  async storeDecision(decision: DecisionObject): Promise<string> { const entries = this.getData(); const id = crypto.randomUUID(); const entry: MemoryEntry = { id, decision, createdAt: new Date().toISOString() }; entries.push(entry); this.saveData(entries); return id; }
  async updateOutcome(id: string, outcome: OutcomeRecord): Promise<void> { const entries = this.getData(); const entry = entries.find(e => e.id === id); if (entry) { entry.outcome = outcome; this.saveData(entries); } }
  async queryByRegime(regime: MarketRegime, limit = 100): Promise<MemoryEntry[]> { const entries = this.getData(); return entries.filter(e => e.decision.regime === regime).slice(-limit); }
  async getAllEntries(limit = 500): Promise<MemoryEntry[]> { const entries = this.getData(); return entries.slice(-limit); }
}
