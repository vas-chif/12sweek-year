/**
 * @file firebase.ts
 * @description Inizializzazione Firebase SDK (Auth, Firestore) per sincronizzazione e backup 12WY
 * @author Vasile Chifeac
 * @created 2026-10-09
 * @notes
 * - Progetto Firebase: week-year-12 (1048564984929)
 * - §5 AGENTS.md: Crittografia locale e salvaguardia dati clinici
 */

// ── 1. Firebase SDK ─────────────────────────────────────────────────────────────
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// ── 2. Configurazione Progetto ──────────────────────────────────────────────────
// Lettura protetta da variabili d'ambiente (.env protetto e non tracciato su Git)
export const firebaseConfig = {
  apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY ?? ""),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? ""),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID ?? ""),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? ""),
  messagingSenderId: String(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? ""
  ),
  appId: String(import.meta.env.VITE_FIREBASE_APP_ID ?? "")
};

// ── 3. Inizializzazione Sicura & Difensiva (Local-First Fallback) ─────────────
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

const hasValidConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId
);

if (hasValidConfig) {
  try {
    appInstance =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  } catch (err: unknown) {
    console.warn(
      "⚠️ [Firebase] Inizializzazione non riuscita, modalità offline locale attiva:",
      err
    );
    appInstance = null;
    authInstance = null;
    dbInstance = null;
  }
} else {
  // Modalità Offline / Local-First nativa
  appInstance = null;
  authInstance = null;
  dbInstance = null;
}

export const firebaseApp: FirebaseApp | null = appInstance;
export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;

/**
 * Verifica se Firebase è correttamente inizializzato e pronto all'uso
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(appInstance && authInstance && dbInstance);
} /*end isFirebaseConfigured*/
