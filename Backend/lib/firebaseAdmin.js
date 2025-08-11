// Backend/lib/firebaseAdmin.js
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

function init() {
  if (admin.apps.length) return;

  try {
    let svc = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      const jsonStr = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
      svc = JSON.parse(jsonStr);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // If you use JSON in .env, allow either \n or \\n
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
      const normalized = raw.replace(/\\n/g, "\n"); // in case you used \\n in .env
      svc = JSON.parse(normalized);
    } else {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_B64 or FIREBASE_SERVICE_ACCOUNT_JSON");
    }

    admin.initializeApp({
      credential: admin.credential.cert(svc),
      projectId: svc.project_id,
    });
    console.log("[FirebaseAdmin] Initialized for project:", svc.project_id);
  } catch (e) {
    console.error("[FirebaseAdmin] Initialization failed:", e.message);
    throw e;
  }
}

init();

export const authAdmin = admin.auth();
export default admin;