import leo from "leo-profanity";
import sanitizeHtml from "sanitize-html";

// Load dictionary(s)
leo.loadDictionary("en"); // add more: leo.loadDictionary("fr"), etc.

// Optional: your custom words to block
const CUSTOM_BLOCKLIST = ["idiot", "stupid"]; // edit later
leo.add(CUSTOM_BLOCKLIST);

export function profanityGuard({ mode = "reject" } = {}) {
  return (req, res, next) => {
    // Fields we want to scan (description/issue, reply message, etc.)
    const fieldsToScan = [
      ["issue", req.body?.issue],
      ["message", req.body?.message],
    ];

    for (const [field, value] of fieldsToScan) {
      if (!value || typeof value !== "string") continue;

      // Basic XSS/html cleanup first
      const cleaned = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });

      // Check for profanity
      if (leo.check(cleaned)) {
        if (mode === "reject") {
          return res.status(400).json({ error: `Please remove inappropriate language in "${field}".` });
        } else if (mode === "mask") {
          // Replace bad words () and put it back onto req.body
          const masked = leo.clean(cleaned);
          req.body[field] = masked;
        }
      } else {
        req.body[field] = cleaned;
      }

      // Optional: length/rate controls
      if (req.body[field].length > 1000) {
        return res.status(400).json({ error: `${field} is too long (max 1000 chars).` });
      }
    }

    next();
  };
}
