import { InstitutionalBrief } from './types/brief.types';
import { MarketMemoryStore } from '@/market-memory';
export class BriefGenerator {
  private memoryStore: MarketMemoryStore;
  constructor() { this.memoryStore = new MarketMemoryStore(); }
  async generateBrief(engines: { macro: { score: number; bias: string }; institutional: { score: number; bias: string }; derivatives?: { score: number; bias: string }; volatility?: { regime: string; bias: string }; intermarket?: { goldBias: string }; technical: { score: number; bias: string } }, consensusScore: number, confidence: number): Promise<InstitutionalBrief> {
    const risks: string[] = []; const opportunities: string[] = [];
    if (engines.volatility?.regime === 'EXTREME_VOL') risks.push('Volatilidade extrema — risco de whipsaw.');
    if (engines.macro.score < 40) risks.push('Ambiente macro desfavorável ao ouro.');
    if (engines.derivatives && engines.derivatives.bias !== engines.technical.bias) risks.push('Divergência entre derivativos e técnico.');
    if (engines.macro.bias === 'BULLISH' && engines.institutional.bias === 'BULLISH') opportunities.push('Alinhamento macro + institucional — alta convicção.');
    if (engines.volatility?.regime === 'LOW_VOL' && engines.technical.score > 70) opportunities.push('Baixa volatilidade com tendência técnica forte.');
    const allBiases = [engines.macro.bias, engines.institutional.bias, engines.technical.bias, engines.derivatives?.bias].filter(Boolean);
    const bullishCount = allBiases.filter(b => b === 'BULLISH').length;
    const marketBias = bullishCount >= 3 ? 'BULLISH' : bullishCount <= 1 ? 'BEARISH' : 'NEUTRAL';
    const conviction = Math.round(confidence * (bullishCount / allBiases.length));
    const regimeAnalysis = engines.volatility ? `Regime de volatilidade: ${engines.volatility.regime}. Viés: ${engines.volatility.bias}.` : 'Análise de regime não disponível.';
    const summary = `O XAUUSD apresenta viés ${marketBias} com convicção de ${conviction}%. Consenso entre ${bullishCount} de ${allBiases.length} motores.`;
    return { timestamp: Date.now(), marketBias, confidence, conviction, topRisks: risks, topOpportunities: opportunities, regimeAnalysis, institutionalSummary: summary, engines: { macro: engines.macro.score, institutional: engines.institutional.score, derivatives: engines.derivatives?.score ?? 0, volatility: engines.volatility ? (engines.volatility.bias === 'BULLISH' ? 70 : 50) : 50, intermarket: engines.intermarket ? (engines.intermarket.goldBias === 'BULLISH' ? 75 : 50) : 50, technical: engines.technical.score }, consensusScore };
  }
}
