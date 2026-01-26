export interface BackendPhone {
  brand: string;
  model: string;
  variant?: string;
  price: number;
  image?: string;
}

type CsvPhoneRow = {
  brand?: string;
  model?: string;
  variant?: string;
  price?: string | number;
  link?: string;
  image?: string;
};

type CacheEntry<T> = {
  ts: number;
  data: T;
};

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24h

// Bump this to invalidate localStorage cache after dataset/logic changes.
const PHONE_SEARCH_CACHE_VERSION = 2;

const API_BASE_URL = (import.meta.env.VITE_AI_API_URL as string | undefined) ??
  "https://reprice-ml3.onrender.com";

let localCsvCache: { loaded: boolean; rows: CsvPhoneRow[]; ts: number } = {
  loaded: false,
  rows: [],
  ts: 0,
};

const LOCAL_CSV_TTL_MS = import.meta.env.DEV ? 1000 * 30 : DEFAULT_TTL_MS;

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : 0;
}

async function loadLocalPhonesCsv(signal?: AbortSignal): Promise<CsvPhoneRow[]> {
  if (localCsvCache.loaded && now() - localCsvCache.ts < LOCAL_CSV_TTL_MS) return localCsvCache.rows;

  try {
    // In dev, add a small cache buster so CSV edits reflect without hard refresh.
    const csvUrl = import.meta.env.DEV
      ? `/data/phones.csv?t=${Math.floor(now() / 30000)}`
      : "/data/phones.csv";

    const res = await fetch(csvUrl, { signal });
    if (!res.ok) {
      localCsvCache = { loaded: true, rows: [], ts: now() };
      return [];
    }

    const csvText = await res.text();
    if (!csvText.trim()) {
      localCsvCache = { loaded: true, rows: [], ts: now() };
      return [];
    }

    const mod = await import("./parsePhonesCSV");
    const rows = (await mod.parsePhonesCSV(csvText)) as CsvPhoneRow[];
    localCsvCache = { loaded: true, rows: Array.isArray(rows) ? rows : [], ts: now() };
    return localCsvCache.rows;
  } catch {
    localCsvCache = { loaded: true, rows: [], ts: now() };
    return [];
  }
}

function mergeUniquePhones(primary: BackendPhone[], secondary: BackendPhone[]): BackendPhone[] {
  const map = new Map<string, BackendPhone>();

  const add = (p: BackendPhone) => {
    const key = `${normalizeText(p.brand)}|${normalizeText(p.model)}|${normalizeText(p.variant ?? "")}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, p);
      return;
    }

    // Prefer the higher price, but keep an existing image if present.
    const next = {
      ...existing,
      price: Math.max(toNumber(existing.price), toNumber(p.price)),
      image: existing.image || p.image,
    };
    map.set(key, next);
  };

  for (const p of primary) add(p);
  for (const p of secondary) add(p);
  return Array.from(map.values());
}

function localSearch(rows: CsvPhoneRow[], query: string): BackendPhone[] {
  const q = normalizeText(query);
  if (!q) return [];

  const tokens = q.split(" ").filter(Boolean);
  const scored: Array<{ score: number; phone: BackendPhone }> = [];

  for (const r of rows) {
    const brand = (r.brand ?? "").toString().trim();
    const model = (r.model ?? "").toString().trim();
    const variant = (r.variant ?? "").toString().trim();
    const full = normalizeText(`${brand} ${model} ${variant}`);
    if (!full) continue;

    // Require at least one token match to avoid garbage results.
    const tokenMatches = tokens.reduce((acc, t) => acc + (full.includes(t) ? 1 : 0), 0);
    if (tokenMatches === 0) continue;

    // Prefer exact substring and more token matches.
    const score = (full.includes(q) ? 100 : 0) + tokenMatches;
    const phone: BackendPhone = {
      brand,
      model,
      variant: variant || undefined,
      price: toNumber(r.price),
      image: (r.image || r.link || "")?.toString() || undefined,
    };
    scored.push({ score, phone });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 50).map((s) => s.phone);
}

const memoryCache = new Map<string, CacheEntry<BackendPhone[]>>();
const inFlight = new Map<string, Promise<BackendPhone[]>>();

function storageKey(queryKey: string) {
  return `phoneSearch:v${PHONE_SEARCH_CACHE_VERSION}:${queryKey}`;
}

function now() {
  return Date.now();
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function readFromStorage(queryKey: string): CacheEntry<BackendPhone[]> | null {
  try {
    const raw = localStorage.getItem(storageKey(queryKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<BackendPhone[]>;
    if (!parsed || typeof parsed.ts !== "number" || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(queryKey: string, entry: CacheEntry<BackendPhone[]>) {
  try {
    localStorage.setItem(storageKey(queryKey), JSON.stringify(entry));
  } catch {
    // ignore quota / privacy mode failures
  }
}

export async function warmupPhoneSearch(signal?: AbortSignal) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  try {
    // /health exists in the AI service used by PhoneDetail
    await fetch(`${API_BASE_URL}/health`, { method: "GET", signal: controller.signal }).catch(() => null);
  } finally {
    window.clearTimeout(timeout);
    if (signal && !signal.aborted) {
      signal.removeEventListener("abort", onAbort);
    }
  }
}

export async function fetchSearchPhonesRaw(
  query: string,
  options?: { signal?: AbortSignal; ttlMs?: number }
): Promise<BackendPhone[]> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const queryKey = normalizeQuery(query);

  const cachedMem = memoryCache.get(queryKey);
  if (cachedMem && now() - cachedMem.ts < ttlMs) return cachedMem.data;

  const cachedStorage = readFromStorage(queryKey);
  if (cachedStorage && now() - cachedStorage.ts < ttlMs) {
    memoryCache.set(queryKey, cachedStorage);
    return cachedStorage.data;
  }

  const existing = inFlight.get(queryKey);
  if (existing) return existing;

  const p = (async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/search-phones?q=${encodeURIComponent(query)}`,
        { signal: options?.signal }
      );

      if (!res.ok) {
        // 503 is common when Render spins up
        const text = await res.text().catch(() => "");
        throw new Error(`search-phones failed (${res.status}) ${text}`.trim());
      }

      const data = (await res.json()) as BackendPhone[];
      const apiData = Array.isArray(data) ? data : [];

      // If backend returns empty (common when dataset is incomplete), fall back to local CSV.
      // Also lightly enrich small result sets with local CSV matches.
      let finalData: BackendPhone[] = apiData;
      if (apiData.length === 0) {
        const rows = await loadLocalPhonesCsv(options?.signal);
        finalData = localSearch(rows, query);
      } else if (apiData.length < 20) {
        const rows = await loadLocalPhonesCsv(options?.signal);
        const local = localSearch(rows, query);
        if (local.length > 0) {
          finalData = mergeUniquePhones(apiData, local);
        }
      }

      const entry: CacheEntry<BackendPhone[]> = { ts: now(), data: finalData };
      memoryCache.set(queryKey, entry);
      writeToStorage(queryKey, entry);
      return finalData;
    } catch {
      // Fallback: local CSV search (keeps Sell Phone usable even if ML API is down).
      const rows = await loadLocalPhonesCsv(options?.signal);
      const data = localSearch(rows, query);
      const entry: CacheEntry<BackendPhone[]> = { ts: now(), data };
      memoryCache.set(queryKey, entry);
      writeToStorage(queryKey, entry);
      return data;
    }
  })();

  inFlight.set(queryKey, p);

  try {
    return await p;
  } finally {
    inFlight.delete(queryKey);
  }
}
