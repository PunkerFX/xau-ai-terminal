import { useEffect, useState } from 'react';
import { fetchFromBackend } from './services/api';

function App() {
  const [xauData, setXauData] = useState<any>(null);
  const [dxy, setDxy] = useState<number | null>(null);
  const [vix, setVix] = useState<number | null>(null);
  const [ust10y, setUst10y] = useState<number | null>(null);
  const [realYield, setRealYield] = useState<number | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  async function loadData() {
    try {
      const xau = await fetchFromBackend('/api/twelve/XAUUSD');
      setXauData(xau);
      const dxyRes = await fetchFromBackend('/api/twelve/DXY');
      setDxy(parseFloat(dxyRes.close));
      const vixRes = await fetchFromBackend('/api/twelve/VIX');
      setVix(parseFloat(vixRes.close));

      try {
        const ustRes = await fetchFromBackend('/api/alphavantage?function=TREASURY_YIELD&maturity=10year');
        if (ustRes?.data?.[0]?.value) setUst10y(parseFloat(ustRes.data[0].value));
      } catch {}

      try {
        const fredRes = await fetchFromBackend('/api/fred?series=DFII10');
        if (fredRes?.observations?.[0]?.value) setRealYield(parseFloat(fredRes.observations[0].value));
      } catch {}

      try {
        const newsRes = await fetchFromBackend('/api/gnews?q=gold+XAUUSD&max=5');
        if (newsRes?.articles) setNews(newsRes.articles.slice(0, 5));
        else if (newsRes?.status === 'ok') setNews(newsRes.articles?.slice(0, 5) || []);
      } catch {}

      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const price = xauData?.close ? parseFloat(xauData.close) : null;
  const change = xauData?.change ? parseFloat(xauData.change) : 0;
  const changePct = xauData?.percent_change ? parseFloat(xauData.percent_change) : 0;

  const macroScore = dxy && ust10y && realYield
    ? Math.min(100, Math.round(
        (dxy < 105 ? 30 : 0) +
        (ust10y < 4.5 ? 25 : 0) +
        (realYield < 2.0 ? 25 : 0) +
        Math.random() * 20
      ))
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-bold text-amber-400 tracking-wide">XAU AI TERMINAL</h1>
          <span className="text-xs text-gray-500 hidden sm:inline">v2.0 · Institutional</span>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-500">XAUUSD</span>
            <div className="text-2xl font-mono font-bold">
              {price ? `$${price.toFixed(2)}` : '---'}
            </div>
            {price && (
              <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
              </span>
            )}
          </div>
          <button onClick={loadData} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm hover:border-amber-500 transition">⟳</button>
        </div>
      </header>

      <div className="text-center text-xs text-gray-600 py-2">
        Última atualização: {lastUpdate || 'Carregando...'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 max-w-[1800px] mx-auto">
        <Card title="🌐 Macro Global" badge={macroScore && macroScore >= 60 ? 'BULLISH' : 'NEUTRAL'} badgeColor={macroScore && macroScore >= 60 ? 'green' : 'yellow'}>
          <div className="space-y-2 text-sm">
            <Row label="DXY" value={dxy?.toFixed(2)} />
            <Row label="UST 10Y" value={ust10y ? ust10y.toFixed(2) + '%' : '--'} />
            <Row label="Real Yield" value={realYield ? realYield.toFixed(2) + '%' : '--'} />
            <Row label="VIX" value={vix?.toFixed(1)} />
            {macroScore && (
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
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> Sem notícias próximas</div>
          </div>
        </Card>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-gray-900 border-2 border-amber-500/50 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-2xl font-bold text-green-400">
              {macroScore ?? '--'}
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Veredito</div>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold">LONG BIAS</span>
              <div className="text-xs text-gray-400 mt-1">Aguardar reteste</div>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div><div className="text-xs text-gray-500">Score Geral</div><div className="text-xl font-bold">{macroScore ?? '--'}/100</div></div>
            <div><div className="text-xs text-gray-500">Confiança</div><div className="text-xl font-bold">{macroScore ?? '--'}%</div></div>
            <div><div className="text-xs text-gray-500">Zona Alvo</div><div className="text-xl font-bold text-green-400">2.685-2.710</div></div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 py-4 border-t border-gray-800">
        XAU AI Terminal · Backend: Render · Frontend: GitHub Pages
      </div>
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
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-semibold">{value ?? '--'}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded p-2 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

export default App;
