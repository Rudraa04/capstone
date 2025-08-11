// Backend/utils/embeddingsAI.js
import OpenAI from "openai";
import crypto from "crypto";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MODEL = process.env.EMBEDDINGS_MODEL || "text-embedding-3-small";

// tiny in-memory cache
const CACHE_TTL_MS = Number(process.env.EMBED_CACHE_TTL_MS || 15 * 60 * 1000); // 15m
const cache = new Map(); // key -> { at:number, vec:number[], source:"ai"|"local" }
const norm = s => (s || "").toLowerCase().trim().replace(/\s+/g, " ").slice(0, 1000);

// circuit breaker / cooldown after 429s
const COOLDOWN_MS = Number(process.env.EMBED_COOLDOWN_MS || 10 * 60 * 1000); // 10m
let cooldownUntil = 0;
const inCooldown = () => Date.now() < cooldownUntil;
const startCooldown = () => { cooldownUntil = Date.now() + COOLDOWN_MS; };

function isRateOrQuotaError(err) {
  const msg = String(err?.message || "");
  return err?.status === 429 || /quota|rate/i.test(msg);
}

// --- local hashed embedding (works offline) ---
function localEmbed(text = "", dims = 256) {
  const vec = new Array(dims).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const tok of tokens) {
    const h = crypto.createHash("sha256").update(tok).digest();
    // index from first 4 bytes
    const idx =
      (((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0) % dims;
    // signed hashing bit from byte 4
    const sign = (h[4] & 1) ? 1 : -1;
    vec[idx] += sign;
  }
  // L2 normalize
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vec.map(v => v / norm);
}

// public: cosine similarity
export function cosineSim(a = [], b = []) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// public: get embedding (AI → fallback to local); NEVER throws
export async function embedText(text = "") {
  const key = norm(text);

  // cache
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.vec;

  // cooldown or no key → local
  if (!client || inCooldown()) {
    const vec = localEmbed(key);
    cache.set(key, { at: Date.now(), vec, source: "local" });
    return vec;
  }

  // try OpenAI once; if it fails, enter cooldown + local
  try {
    const resp = await client.embeddings.create({
      model: MODEL,
      input: key,
    });
    const vec = resp.data?.[0]?.embedding || localEmbed(key);
    cache.set(key, { at: Date.now(), vec, source: "ai" });
    return vec;
  } catch (err) {
    if (isRateOrQuotaError(err)) startCooldown();
    const vec = localEmbed(key);
    cache.set(key, { at: Date.now(), vec, source: "local" });
    return vec;
  }
}