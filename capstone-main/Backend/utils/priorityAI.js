// Backend/utils/priorityAI.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Fallback keyword rules (work offline) ---
function fallbackRules(text = "") {
  const t = text.toLowerCase();
  const HIGH = [
    "broken","cracked","damaged","leak","refund","payment failed",
    "stolen","not delivered","urgent","can't login","cant login","cannot login","security"
  ];
  const MED  = [
    "wrong product","incorrect","delayed","late","warranty","replacement","exchange","invoice"
  ];
  if (HIGH.some(k => t.includes(k))) return "High";
  if (MED.some(k => t.includes(k)))  return "Medium";
  return "Low";
}

// ---- Simple in-memory cache (cuts API calls on repeat issues) ----
const CACHE_TTL_MS = Number(process.env.PRIORITY_AI_CACHE_TTL_MS || 15 * 60 * 1000); // 15m
const cache = new Map(); // key -> { at:number, result:{priority, reason, source} }
const norm = s => s?.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 500) || "";

// ---- Circuit breaker (after quota/rate error, pause AI calls) ----
const COOLDOWN_MS = Number(process.env.PRIORITY_AI_COOLDOWN_MS || 10 * 60 * 1000); // 10m
let cooldownUntil = 0;
const inCooldown = () => Date.now() < cooldownUntil;
const startCooldown = () => { cooldownUntil = Date.now() + COOLDOWN_MS; };

// small sleep helper for retries
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// detect quota/rate-limit
function isRateOrQuotaError(err) {
  const msg = String(err?.message || "");
  return err?.status === 429 || /rate|quota|exceeded/i.test(msg);
}

/**
 * Decide ticket priority via OpenAI; falls back to rules on errors.
 * Returns { priority: "Low"|"Medium"|"High", reason: string, source: "ai"|"rules"|"cooldown" }
 */
export async function classifyPriority(issueText = "", customerSnapshot = {}) {
  const key = norm(issueText);

  // 0) cooldown short-circuit
  if (inCooldown()) {
    return { priority: fallbackRules(issueText), reason: "AI cooldown (previous 429)", source: "cooldown" };
  }

  // 1) cache hit
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;

  // 2) no API key → rules
  if (!process.env.OPENAI_API_KEY) {
    const result = { priority: fallbackRules(issueText), reason: "No OPENAI_API_KEY (fallback rules)", source: "rules" };
    cache.set(key, { at: Date.now(), result });
    return result;
  }

  // 3) try AI with small backoff+retry
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const prompt = [
        {
          role: "system",
          content:
            "You are a support triage assistant. Output JSON only. Decide priority: High, Medium, or Low. " +
            "High: safety/security/account access, payment failures/chargebacks, not delivered/stolen, product broken/damaged, urgent words. " +
            "Medium: delivery delays, wrong/incorrect product, exchange/replacement, warranty, invoice. " +
            "Low: general questions or low-impact requests."
        },
        {
          role: "user",
          content: JSON.stringify({
            issue: issueText,
            customer: {
              name: customerSnapshot?.name || "",
              email: customerSnapshot?.email || "",
            },
          }),
        },
      ];

      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: prompt,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "priority_schema",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                priority: { type: "string", enum: ["Low", "Medium", "High"] },
                reason: { type: "string" }
              },
              required: ["priority","reason"]
            }
          }
        }
      });

      const content = resp.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content);
      const candidate = ["Low", "Medium", "High"].includes(parsed.priority) ? parsed.priority : fallbackRules(issueText);

      const result = { priority: candidate, reason: parsed.reason || "AI classification", source: "ai" };
      cache.set(key, { at: Date.now(), result });
      return result;

    } catch (err) {
      // If it’s a rate/quota error, back off or enter cooldown
      if (isRateOrQuotaError(err)) {
        if (attempt === maxAttempts) {
          // too many failures → enter cooldown so we stop hitting the API for a while
          startCooldown();
          break;
        }
        // exponential backoff with jitter
        const base = 400 * Math.pow(2, attempt - 1); // 400ms, 800ms
        const jitter = Math.floor(Math.random() * 200);
        await sleep(base + jitter);
        continue;
      }
      // other errors: just break to fallback
      break;
    }
  }

  // 4) fallback
  const result = {
    priority: fallbackRules(issueText),
    reason: inCooldown() ? "AI cooldown (429/quota)" : "AI error (fallback rules)",
    source: inCooldown() ? "cooldown" : "rules",
  };
  cache.set(key, { at: Date.now(), result });
  return result;
}