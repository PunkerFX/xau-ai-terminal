const BACKEND_URL = 'https://xau-usd-qlnq.onrender.com';

export async function fetchFromBackend<T = any>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
