// Backend/lib/firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("[FIREBASE ADMIN] firebaseAdmin.js loaded");

function init() {
  if (admin.apps.length) return admin.app();

  // 1) Inline JSON (FIREBASE_ADMIN_CREDENTIALS)
  const inline = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (inline) {
    try {
      const creds = JSON.parse(inline);
      const app = admin.initializeApp({
        credential: admin.credential.cert(creds),
        projectId: creds.project_id,                  // ⬅️ force project id
      });
      console.log("[FIREBASE ADMIN] init: FIREBASE_ADMIN_CREDENTIALS (inline JSON)");
      console.log("[FIREBASE ADMIN] projectId =", creds.project_id);
      console.log("[FIREBASE ADMIN] client_email =", creds.client_email);
      return app;
    } catch (e) {
      console.error("[FIREBASE ADMIN] Failed to parse FIREBASE_ADMIN_CREDENTIALS:", e.message);
    }
  }

  // 2) GOOGLE_APPLICATION_CREDENTIALS (path)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    // Try to read it so we can log useful info
    try {
      const creds = JSON.parse(fs.readFileSync(p, "utf8"));
      const app = admin.initializeApp({
        credential: admin.credential.cert(creds),
        projectId: creds.project_id,                  // ⬅️ force project id
      });
      console.log("[FIREBASE ADMIN] init: GOOGLE_APPLICATION_CREDENTIALS ->", p);
      console.log("[FIREBASE ADMIN] projectId =", creds.project_id);
      console.log("[FIREBASE ADMIN] client_email =", creds.client_email);
      return app;
    } catch (e) {
      console.error("[FIREBASE ADMIN] Could not read GOOGLE_APPLICATION_CREDENTIALS:", e.message);
    }
  }

  // 3) Local fallback: Backend/service-account.json
  const localPath = path.join(__dirname, "..", "service-account.json");
  console.log("[FIREBASE ADMIN] looking for:", localPath);
  if (fs.existsSync(localPath)) {
    try {
      const file = JSON.parse(fs.readFileSync(localPath, "utf8"));
      const app = admin.initializeApp({
        credential: admin.credential.cert(file),
        projectId: file.project_id,                   // ⬅️ force project id
      });
      console.log("[FIREBASE ADMIN] init: local service-account.json");
      console.log("[FIREBASE ADMIN] projectId =", file.project_id);
      console.log("[FIREBASE ADMIN] client_email =", file.client_email);
      return app;
    } catch (e) {
      console.error("[FIREBASE ADMIN] Failed to read local service-account.json:", e.message);
    }
  }

  throw new Error(
    "Firebase Admin credentials not configured. Set FIREBASE_ADMIN_CREDENTIALS, " +
      "or GOOGLE_APPLICATION_CREDENTIALS, or add Backend/service-account.json"
  );
}

const app = init();
export const authAdmin = admin.auth();
export default app;
