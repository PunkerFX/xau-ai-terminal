const BACKEND_URL = 'https://xau-usd-qlnq.onrender.com';

async function fetchWithRetry(url: string, retries = 3, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

export async function fetchFromBackend<T = any>(endpoint: string): Promise<T> {
  return fetchWithRetry(`${BACKEND_URL}${endpoint}`);
}
