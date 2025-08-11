// Backend/utils/moderationAI.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Quick local phrases to catch common rude language immediately
const BANNED_PHRASES = [
  "idiot", "stupid", "dumb", "moron", "loser", "useless",
  "shut up", "waste of time", "wasting our time", "get lost"
];

// Control how to behave if the AI key is missing or the API errors:
//   open  = allow (dev-friendly)
//   closed = block (prod-strict)
const FAIL_MODE = (process.env.MODERATION_FAIL_MODE || "open").toLowerCase();

/**
 * Check if a message is acceptable.
 * Returns: { ok: boolean, reason?: string, categories?: object }
 */
export async function moderateMessage(message = "") {
  const lower = message.toLowerCase();

  // 1) Fast local check first (blocks immediately)
  if (BANNED_PHRASES.some(p => lower.includes(p))) {
    return { ok: false, reason: "banned-phrase" };
  }

  // 2) AI moderation
  if (!process.env.OPENAI_API_KEY) {
    // No key → allow only if fail-open
    return { ok: FAIL_MODE !== "closed", reason: "no-api-key" };
  }

  try {
    const resp = await client.moderations.create({
      model: "omni-moderation-latest",
      input: message,
    });

    const result = resp?.results?.[0];
    const harassment =
      result?.categories?.harassment ||
      result?.categories?.harassment_threatening;

    const flagged = Boolean(result?.flagged || harassment);
    return { ok: !flagged, categories: result?.categories };
  } catch (err) {
    // API error → allow only if fail-open
    return { ok: FAIL_MODE !== "closed", reason: "api-error" };
  }
}