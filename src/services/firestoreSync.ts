/**
 * @file firestoreSync.ts
 * @description Servizio di sincronizzazione Firestore per TimesManagement 12WY (Robot Salvadanaio & Cloud)
 * @author Vasile Chifeac
 * @created 2026-10-09
 * @notes
 * - §5 AGENTS.md: Local-First primario, Cloud Sync opzionale e protetto
 * - Database: projects/week-year-12/databases/(default)
 * - Struttura: users/{userId}/data/quarterPlan + sub-collezioni
 */

// ── 1. Firebase SDK & Auth ───────────────────────────────────────────────────────
import {
  doc,
  setDoc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import {
  signInAnonymously,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { auth, db } from "@/services/firebase";

// ── 2. Tipi & Schemi Zod ─────────────────────────────────────────────────────────
import {
  QuarterPlanSchema,
  type QuarterPlan,
  type TacticItem,
  type DailyHabit,
  type PhysicalMeasurementRecord,
  type LifeGoal
} from "@/types/twelveWeek";

export interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
  lastSync?: string;
}

// ── 3. Gestione Utente Firebase ──────────────────────────────────────────────────
let currentUser: User | null = null;
let authPromise: Promise<User> | null = null;

/**
 * Garantisce che un utente Firebase sia autenticato (anonimo o persistente)
 */
export async function ensureAuthUser(): Promise<User> {
  if (currentUser) return currentUser;
  if (authPromise) return authPromise;

  authPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async user => {
        unsubscribe();
        if (user) {
          currentUser = user;
          resolve(user);
        } else {
          try {
            const userCred = await signInAnonymously(auth);
            currentUser = userCred.user;
            resolve(currentUser);
          } catch (err: unknown) {
            console.warn(
              "Accesso anonimo Firebase non riuscito, uso fallback:",
              err
            );
            // Fallback: se l'autenticazione anonima è disabilitata nella console,
            // usiamo un identificativo deterministico locale per il dispositivo
            const fallbackUid =
              localStorage.getItem("twelve_week_client_id") ||
              `device_${Date.now()}`;
            localStorage.setItem("twelve_week_client_id", fallbackUid);
            resolve({ uid: fallbackUid } as User);
          }
        }
      },
      reject
    );
  });

  return authPromise;
} /*end ensureAuthUser*/

/**
 * Salva l'intero piano 12WY su Firestore strutturando sia lo snapshot atomico
 * che le relative sub-collezioni (tactics, habits, measurements, goals).
 */
export async function savePlanToFirestore(
  plan: QuarterPlan
): Promise<SyncResult> {
  try {
    const user = await ensureAuthUser();
    const userId = user.uid;
    const nowIso = new Date().toISOString();

    // 1. Documento principale Utente con Metadata
    const userDocRef = doc(db, "users", userId);
    await setDoc(
      userDocRef,
      {
        uid: userId,
        cycleStartDate: plan.cycleStartDate,
        turtlePhase: plan.physicalMetrics.currentPhase,
        title: plan.title,
        lastSyncedAt: serverTimestamp(),
        lastSaved: nowIso,
        appVersion: "1.0.0"
      },
      { merge: true }
    );

    // 2. Snapshot atomico completo (per ripristino istantaneo con Zod safeParse)
    const snapshotDocRef = doc(db, "users", userId, "state", "current");
    await setDoc(snapshotDocRef, {
      ...plan,
      _syncedAt: nowIso
    });

    // 3. Salvataggio granulare con Batch per query e dashboard avanzate
    const batch = writeBatch(db);

    // 3a. Sub-collezione Tactics
    plan.tactics.forEach((tactic: TacticItem) => {
      const tacticRef = doc(db, "users", userId, "tactics", tactic.id);
      batch.set(tacticRef, {
        ...tactic,
        userId,
        updatedAt: nowIso
      });
    });

    // 3b. Sub-collezione Habits (date chiave)
    Object.entries(plan.dailyHabits).forEach(
      ([dateStr, habit]: [string, DailyHabit]) => {
        const habitRef = doc(db, "users", userId, "habits", dateStr);
        batch.set(habitRef, {
          ...habit,
          userId,
          updatedAt: nowIso
        });
      }
    );

    // 3c. Sub-collezione Misurazioni Черепаха
    plan.physicalMetrics.history.forEach((m: PhysicalMeasurementRecord) => {
      const mRef = doc(db, "users", userId, "measurements", m.id || m.date);
      batch.set(mRef, {
        ...m,
        userId,
        updatedAt: nowIso
      });
    });

    // 3d. Sub-collezione Macro-Obiettivi
    plan.goals.forEach((g: LifeGoal) => {
      const gRef = doc(db, "users", userId, "goals", g.id);
      batch.set(gRef, {
        ...g,
        userId,
        updatedAt: nowIso
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Sincronizzazione Cloud (Firestore) completata con successo",
      lastSync: nowIso
    };
  } catch (err: unknown) {
    console.error("Errore salvataggio Firestore:", err);
    return {
      success: false,
      message: "Impossibile salvare su Firestore",
      error: err instanceof Error ? err.message : String(err)
    };
  }
} /*end savePlanToFirestore*/

/**
 * Scarica lo stato del piano da Firestore e lo valida con Zod.
 */
export async function pullPlanFromFirestore(): Promise<{
  success: boolean;
  plan?: QuarterPlan;
  message: string;
  error?: string;
}> {
  try {
    const user = await ensureAuthUser();
    const userId = user.uid;

    const snapshotDocRef = doc(db, "users", userId, "state", "current");
    const docSnap = await getDoc(snapshotDocRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        message: "Nessun piano trovato su Firestore per questo account."
      };
    }

    const rawData = docSnap.data();
    const validation = QuarterPlanSchema.safeParse(rawData);

    if (!validation.success) {
      console.warn(
        "Dati Firestore non validi secondo lo schema Zod:",
        validation.error
      );
      return {
        success: false,
        message: "I dati cloud non sono conformi allo schema 12-Week Year.",
        error: validation.error.message
      };
    }

    return {
      success: true,
      plan: validation.data,
      message: "Piano scaricato con successo da Firestore."
    };
  } catch (err: unknown) {
    console.error("Errore caricamento Firestore:", err);
    return {
      success: false,
      message: "Errore durante il download da Firestore",
      error: err instanceof Error ? err.message : String(err)
    };
  }
} /*end pullPlanFromFirestore*/

/**
 * Robot Salvadanaio: Crea un backup istantaneo storicizzato nell'archivio cloud
 */
export async function createRobotBackup(
  plan: QuarterPlan
): Promise<SyncResult> {
  try {
    const user = await ensureAuthUser();
    const userId = user.uid;
    const timestamp = new Date().toISOString();
    const backupId = `backup_${timestamp.replace(/[:.]/g, "-")}`;

    const backupDocRef = doc(db, "users", userId, "backups", backupId);
    await setDoc(backupDocRef, {
      backupId,
      userId,
      createdAt: timestamp,
      planSnapshot: plan,
      summary: {
        cycleStartDate: plan.cycleStartDate,
        tacticsCount: plan.tactics.length,
        habitsCount: Object.keys(plan.dailyHabits).length,
        measurementsCount: plan.physicalMetrics.history.length
      }
    });

    return {
      success: true,
      message: `Robot Salvadanaio: Backup salvato su Cloud (#${backupId})`,
      lastSync: timestamp
    };
  } catch (err: unknown) {
    console.error("Errore creazione backup Robot Salvadanaio:", err);
    return {
      success: false,
      message: "Errore durante la creazione del backup su Firestore",
      error: err instanceof Error ? err.message : String(err)
    };
  }
} /*end createRobotBackup*/
