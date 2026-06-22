const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ XAU AI Terminal Backend Online');
});

// ========== PROXY TWELVE DATA (XAU/USD) ==========
app.get('/api/twelve/:symbol', async (req, res) => {
  let { symbol } = req.params;
  if (symbol === 'XAUUSD') symbol = 'XAU/USD';
  const key = process.env.TWELVE_DATA_KEY;
  if (!key) return res.status(500).json({ error: 'Chave Twelve Data não configurada' });
  try {
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${key}`);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== PROXY FINNHUB (DXY, VIX) ==========
app.get('/api/finnhub/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return res.status(500).json({ error: 'Chave Finnhub não configurada' });
  try {
    // Finnhub usa o endpoint /quote para ações e índices
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`);
    const data = await response.json();
    // A Finnhub retorna { c: preço atual, h: alta, l: baixa, o: abertura, pc: fechamento anterior }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== ALPHA VANTAGE (COM CACHE) ==========
let alphaCache = { data: null, timestamp: 0 };

app.get('/api/alphavantage', async (req, res) => {
  if (alphaCache.data && (Date.now() - alphaCache.timestamp) < 3600000) {
    return res.json(alphaCache.data);
  }
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) return res.status(500).json({ error: 'Chave Alpha Vantage não configurada' });
  const func = req.query.function || 'TREASURY_YIELD';
  const maturity = req.query.maturity || '10year';
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=${func}&interval=daily&maturity=${maturity}&apikey=${key}`);
    const data = await response.json();
    if (data.Information && data.Information.includes('rate limit')) {
      if (alphaCache.data) return res.json(alphaCache.data);
      return res.status(429).json({ error: 'Limite diário excedido' });
    }
    alphaCache = { data, timestamp: Date.now() };
    res.json(data);
  } catch (e) {
    if (alphaCache.data) return res.json(alphaCache.data);
    res.status(500).json({ error: e.message });
  }
});

// ========== PROXY FRED ==========
app.get('/api/fred', async (req, res) => {
  const key = process.env.FRED_API_KEY;
  if (!key) return res.status(500).json({ error: 'Chave FRED não configurada' });
  const series = req.query.series || 'DFF';
  try {
    const response = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${key}&file_type=json&limit=1&sort_order=desc`);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== PROXY NEWSAPI ==========
app.get('/api/gnews', async (req, res) => {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return res.status(500).json({ error: 'Chave NewsAPI não configurada' });
  const q = req.query.q || 'gold';
  const lang = req.query.lang || 'en';
  const max = req.query.max || 5;
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=${lang}&pageSize=${max}&apiKey=${key}`);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
