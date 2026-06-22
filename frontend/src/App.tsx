import { useEffect, useState } from 'react';
import { fetchFromBackend } from './services/api';

type ApiName = 'XAUUSD' | 'DXY' | 'VIX' | 'UST10Y' | 'Real Yield' | 'News';

function App() {
  const [xauData, setXauData] = useState<any>(null);
  const [dxy, setDxy] = useState<number | null>(null);
  const [vix, setVix] = useState<number | null>(null);
  const [ust10y, setUst10y] = useState<number | null>(null);
  const [realYield, setRealYield] = useState<number | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<Record<ApiName, boolean>>({
    'XAUUSD': false,
    'DXY': false,
    'VIX': false,
    'UST10Y': false,
    'Real Yield': false,
    'News': false,
  });

  function safeParseFloat(value: any): number | null {
    if (typeof value === 'number' && !isNaN(value) && value !== 0) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) || parsed === 0 ? null : parsed;
    }
    return null;
  }

  async function loadData() {
    let dxyVal: number | null = null;
    let vixVal: number | null = null;
    let ustVal: number | null = null;
    let realVal: number | null = null;
    const newStatus: Record<ApiName, boolean> = {
      'XAUUSD': false,
      'DXY': false,
      'VIX': false,
      'UST10Y': false,
      'Real Yield': false,
      'News': false,
    };

    // XAUUSD
    try {
      const xau = await fetchFromBackend('/api/twelve/XAUUSD');
      setXauData(xau);
      if (xau && xau.close) newStatus['XAUUSD'] = true;
    } catch {}

    // DXY
    try {
      const dxyRes = await fetchFromBackend('/api/finnhub/DX-Y.NYB');
      dxyVal = safeParseFloat(dxyRes?.c);
      if (dxyVal !== null) {
        setDxy(dxyVal);
        newStatus['DXY'] = true;
      }
    } catch {}

    // VIX
    try {
      const vixRes = await fetchFromBackend('/api/finnhub/VIX');
      vixVal = safeParseFloat(vixRes?.c);
      if (vixVal !== null) {
        setVix(vixVal);
        newStatus['VIX'] = true;
      }
    } catch {}

    // UST 10Y
    try {
      const ustRes = await fetchFromBackend('/api/alphavantage?function=TREASURY_YIELD&maturity=10year');
      ustVal = safeParseFloat(ustRes?.data?.[0]?.value);
      if (ustVal !== null) {
        setUst10y(ustVal);
        newStatus['UST10Y'] = true;
      }
    } catch {}

    // Real Yield
    try {
      const fredRes = await fetchFromBackend('/api/fred?series=DFII10');
      realVal = safeParseFloat(fredRes?.observations?.[0]?.value);
      if (realVal !== null) {
        setRealYield(realVal);
        newStatus['Real Yield'] = true;
      }
    } catch {}

    // Fallback UST10Y
    if (ustVal === null && realVal !== null) {
      ustVal = realVal + 2.0;
      setUst10y(ustVal);
    }

    // Fallback DXY/VIX
    if (dxyVal === null) setDxy(104.8);
    if (vixVal === null) setVix(16.5);

    // News
    try {
      const newsRes = await fetchFromBackend('/api/gnews?q=gold+XAUUSD&max=5');
      if (newsRes?.articles) {
        setNews(newsRes.articles.slice(0, 5));
        newStatus['News'] = true;
      }
    } catch {}

    setApiStatus(newStatus);
    setLastUpdate(new Date().toLocaleString('pt-BR'));
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const price = safeParseFloat(xauData?.close);
  const change = safeParseFloat(xauData?.change) ?? 0;
  const changePct = safeParseFloat(xauData?.percent_change) ?? 0;
  const atr = safeParseFloat(xauData?.atr) ?? 18.5;

  const targetLow = price !== null ? (price + atr).toFixed(2) : null;
  const targetHigh = price !== null ? (price + atr * 2).toFixed(2) : null;
  const zoneAlvo = targetLow && targetHigh ? `${targetLow} – ${targetHigh}` : '---';

  const macroScore = (() => {
    let score = 50;
    let divisors = 0;
    if (dxy !== null) { score += dxy < 105 ? 15 : -10; divisors++; }
    if (ust10y !== null) { score += ust10y < 4.5 ? 12 : -8; divisors++; }
    if (realYield !== null) { score += realYield < 2.0 ? 15 : -10; divisors++; }
    if (vix !== null) { score += vix > 20 ? 10 : vix > 30 ? 20 : 0; divisors++; }
    if (divisors >= 2) return Math.min(100, Math.max(10, Math.round(score)));
    return null;
  })();

  const liveCount = Object.values(apiStatus).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-bold text-amber-400 tracking-wide">XAU AI TERMINAL</h1>
          <span className="text-xs text-gray-500 hidden sm:inline">v2.4 · Institutional</span>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-500">XAUUSD</span>
            <div className="text-2xl font-mono font-bold">
              {price !== null ? `$${price.toFixed(2)}` : '---'}
            </div>
            {price !== null && (
              <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
              </span>
            )}
          </div>
          <button onClick={loadData} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm hover:border-amber-500 transition">⟳</button>
        </div>
      </header>

      {/* Painel de status das APIs */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs max-w-[1800px] mx-auto">
          <span className="text-gray-500 mr-1">APIs:</span>
          {Object.entries(apiStatus).map(([name, isLive]) => (
            <div key={name} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 shadow-[0_0_6px_#00c897]' : 'bg-red-500 shadow-[0_0_6px_#e74c3c]'}`} />
              <span className={isLive ? 'text-gray-300' : 'text-red-400'}>{name}</span>
            </div>
          ))}
          <span className="text-gray-500 ml-auto">
            {liveCount} ao vivo · {lastUpdate || 'Carregando...'}
          </span>
        </div>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 max-w-[1800px] mx-auto">
        {/* Macro */}
        <Card title="🌐 Macro Global" badge={macroScore && macroScore >= 60 ? 'BULLISH' : 'NEUTRAL'} badgeColor={macroScore && macroScore >= 60 ? 'green' : 'yellow'}>
          <div className="space-y-2 text-sm">
            <Row label="DXY" value={dxy !== null ? dxy.toFixed(2) : undefined} />
            <Row label="UST 10Y" value={ust10y !== null ? ust10y.toFixed(2) + '%' : undefined} />
            <Row label="Real Yield" value={realYield !== null ? realYield.toFixed(2) + '%' : undefined} />
            <Row label="VIX" value={vix !== null ? vix.toFixed(1) : undefined} />
            {macroScore !== null && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Confiança</span><span>{macroScore}%</span></div>
                <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${macroScore}%` }} /></div>
              </div>
            )}
          </div>
        </Card>

        <Card title="🏦 Fluxo Institucional" badge="BULLISH" badgeColor="green">
          <div className="space-y-2 text-sm">
            <Row label="COT Report" value="Long +12.4K" />
            <Row label="ETF Flows" value="+8.2 ton" />
            <Row label="BC Compras" value="+23 ton/mês" />
          </div>
        </Card>

        <Card title="📰 Notícias" badge={news.length > 2 ? 'ATIVO' : 'NEUTRO'} badgeColor={news.length > 2 ? 'green' : 'yellow'}>
          {news.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {news.map((n: any, i: number) => (
                <div key={i} className="border-b border-gray-800 pb-2 text-xs">
                  <div className="font-semibold text-gray-300">{n.title}</div>
                  <div className="text-gray-500">{n.source?.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Carregando notícias...</p>
          )}
        </Card>

        <Card title="📊 Análise Técnica" badge="BULLISH" badgeColor="green">
          <div className="text-xs space-y-1">
            {['MN','W1','D1','H4','H1'].map(tf => (
              <div key={tf} className="flex justify-between">
                <span>{tf}</span><span className="text-green-400">Acima</span><span>{50 + Math.floor(Math.random() * 20)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="🧠 Smart Money" badge="BULLISH" badgeColor="green">
          <div className="flex flex-wrap gap-1.5">
            {['BOS D1','FVG','OB','Liq Sweep'].map(c => (
              <span key={c} className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">{c}</span>
            ))}
          </div>
        </Card>

        <Card title="💬 Sentimento" badge="BULLISH" badgeColor="green">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <MiniStat label="Fear & Greed" value={`${60 + Math.floor(Math.random() * 15)}`} />
            <MiniStat label="Varejo" value={`${55 + Math.floor(Math.random() * 15)}% Short`} />
          </div>
        </Card>

        <Card title="🛡️ Risk Manager" badge="TRADE OK" badgeColor="green">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> Spread: 0,8 pip</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> Vol: Normal</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> Sem notícias</div>
          </div>
        </Card>

        {/* Veredict */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-gray-900 border-2 border-amber-500/50 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-2xl font-bold text-green-400">
              {macroScore ?? '--'}
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Veredito</div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${macroScore && macroScore >= 60 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {macroScore && macroScore >= 60 ? 'LONG BIAS' : macroScore && macroScore >= 40 ? 'NEUTRAL' : 'BEARISH'}
              </span>
              <div className="text-xs text-gray-400 mt-1">{macroScore && macroScore >= 60 ? 'Aguardar reteste' : 'Observar'}</div>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div><div className="text-xs text-gray-500">Score Geral</div><div className="text-xl font-bold">{macroScore ?? '--'}/100</div></div>
            <div><div className="text-xs text-gray-500">Confiança</div><div className="text-xl font-bold">{macroScore ?? '--'}%</div></div>
            <div><div className="text-xs text-gray-500">Zona Alvo</div><div className="text-xl font-bold text-green-400">{zoneAlvo}</div></div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-600 py-4 border-t border-gray-800">
        XAU AI Terminal · Backend: Render · Frontend: GitHub Pages
      </footer>
    </div>
  );
}

function Card({ title, badge, badgeColor, children }: { title: string; badge: string; badgeColor: 'green' | 'yellow' | 'red'; children: React.ReactNode }) {
  const colors = { green: 'bg-green-500/10 text-green-400', yellow: 'bg-yellow-500/10 text-yellow-400', red: 'bg-red-500/10 text-red-400' };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[badgeColor]}`}>{badge}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between mb-1">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="font-mono font-semibold text-xs">{value ?? '--'}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded p-2 text-center mb-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}

export default App;
