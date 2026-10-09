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
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ?? "",
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ?? "",
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ?? "",
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) ?? "",
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ??
    "",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ?? ""
};

// ── 3. Inizializzazione Singleton ──────────────────────────────────────────────
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
