/**
 * @file authStore.ts
 * @description Store Pinia per Autenticazione Firebase (Email/Password) & Blocco Schermo Marziale con PIN
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §5 AGENTS.md: Privacy e protezione dati personali/sanitari
 * - Autenticazione Firebase: Email & Password
 * - Blocco Schermo Locale: PIN a 4-6 cifre per sblocco rapido sul posto di lavoro
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "@/services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const STORAGE_KEY_PIN = "twelve_week_lock_pin";
const STORAGE_KEY_LOCKED = "twelve_week_is_locked";
const STORAGE_KEY_REGISTERED = "twelve_week_owner_registered";

export const useAuthStore = defineStore("auth", () => {
  // ── Stato ──────────────────────────────────────────────────────────────────
  const user = ref<User | null>(null);
  const isAuthReady = ref<boolean>(false);
  const isLocked = ref<boolean>(
    localStorage.getItem(STORAGE_KEY_LOCKED) === "true"
  );
  const savedPin = ref<string>(localStorage.getItem(STORAGE_KEY_PIN) || "");
  const isRegistrationAllowed = ref<boolean>(
    localStorage.getItem(STORAGE_KEY_REGISTERED) !== "true"
  );
  const authLoading = ref<boolean>(false);
  const authError = ref<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  const isAuthenticated = computed<boolean>(() => user.value !== null);
  const hasPin = computed<boolean>(() => savedPin.value.length >= 4);
  const userEmail = computed<string>(() => user.value?.email || "");

  // ── Verifica Monoutente Proprietario ───────────────────────────────────────
  async function checkRegistrationStatus(): Promise<void> {
    if (localStorage.getItem(STORAGE_KEY_REGISTERED) === "true") {
      isRegistrationAllowed.value = false;
      return;
    }

    if (isFirebaseConfigured() && db) {
      try {
        const ownerDocRef = doc(db, "system", "owner");
        const docSnap = await getDoc(ownerDocRef);
        if (docSnap.exists()) {
          isRegistrationAllowed.value = false;
          localStorage.setItem(STORAGE_KEY_REGISTERED, "true");
        }
      } catch (err: unknown) {
        console.warn("Verifica stato registrazione proprietario:", err);
      }
    }
  } /*end checkRegistrationStatus*/

  // ── Inizializzazione Listener Firebase ─────────────────────────────────────
  function initAuth(): Promise<User | null> {
    return new Promise(resolve => {
      void checkRegistrationStatus();

      if (!isFirebaseConfigured() || !auth) {
        isAuthReady.value = true;
        resolve(null);
        return;
      }

      onAuthStateChanged(auth, currentUser => {
        user.value = currentUser;
        isAuthReady.value = true;
        // Se c'è già un utente autenticato, la registrazione è per definizione chiusa
        if (currentUser) {
          isRegistrationAllowed.value = false;
          localStorage.setItem(STORAGE_KEY_REGISTERED, "true");
        } else {
          isLocked.value = false;
          localStorage.removeItem(STORAGE_KEY_LOCKED);
        }
        resolve(currentUser);
      });
    });
  } /*end initAuth*/

  // ── Azioni Firebase Auth ───────────────────────────────────────────────────
  async function login(email: string, pass: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !auth) {
      authError.value =
        "Firebase non configurato in .env. Configura le credenziali prima di accedere.";
      return false;
    }

    authLoading.value = true;
    authError.value = null;

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      user.value = cred.user;
      isLocked.value = false;
      isRegistrationAllowed.value = false;
      localStorage.setItem(STORAGE_KEY_LOCKED, "false");
      localStorage.setItem(STORAGE_KEY_REGISTERED, "true");
      return true;
    } catch (err: unknown) {
      authError.value = formatAuthError(err);
      return false;
    } finally {
      authLoading.value = false;
    }
  } /*end login*/

  async function register(email: string, pass: string): Promise<boolean> {
    if (!isRegistrationAllowed.value) {
      authError.value =
        "Registrazione disabilitata. L'applicazione è riservata all'unico proprietario.";
      return false;
    }

    if (!isFirebaseConfigured() || !auth) {
      authError.value = "Firebase non configurato in .env.";
      return false;
    }

    authLoading.value = true;
    authError.value = null;

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        pass
      );
      user.value = cred.user;
      isLocked.value = false;
      isRegistrationAllowed.value = false;
      localStorage.setItem(STORAGE_KEY_LOCKED, "false");
      localStorage.setItem(STORAGE_KEY_REGISTERED, "true");

      // Salva il documento di lock del proprietario su Firestore se accessibile
      if (db) {
        try {
          const ownerDocRef = doc(db, "system", "owner");
          await setDoc(ownerDocRef, {
            ownerUid: cred.user.uid,
            ownerEmail: email.trim(),
            registeredAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Registrazione proprietario su Firestore:", dbErr);
        }
      }

      return true;
    } catch (err: unknown) {
      authError.value = formatAuthError(err);
      return false;
    } finally {
      authLoading.value = false;
    }
  } /*end register*/

  async function logout(): Promise<void> {
    authLoading.value = true;
    try {
      if (auth) {
        await signOut(auth);
      }
      user.value = null;
      isLocked.value = false;
      localStorage.removeItem(STORAGE_KEY_LOCKED);
    } catch (err: unknown) {
      console.warn("Errore durante logout Firebase:", err);
    } finally {
      authLoading.value = false;
    }
  } /*end logout*/

  // ── Azioni PIN & Blocco Schermo ────────────────────────────────────────────
  function setSecurityPin(newPin: string): boolean {
    if (newPin.length < 4 || newPin.length > 8) {
      authError.value = "Il PIN deve contenere tra 4 e 8 cifre numeriche.";
      return false;
    }
    savedPin.value = newPin;
    localStorage.setItem(STORAGE_KEY_PIN, newPin);
    return true;
  } /*end setSecurityPin*/

  function removeSecurityPin(): void {
    savedPin.value = "";
    localStorage.removeItem(STORAGE_KEY_PIN);
  } /*end removeSecurityPin*/

  function lockScreen(): void {
    isLocked.value = true;
    localStorage.setItem(STORAGE_KEY_LOCKED, "true");
  } /*end lockScreen*/

  function unlockWithPin(enteredPin: string): boolean {
    if (!hasPin.value) {
      // Se non ha impostato un PIN, si sblocca direttamente
      isLocked.value = false;
      localStorage.setItem(STORAGE_KEY_LOCKED, "false");
      return true;
    }

    if (enteredPin === savedPin.value) {
      isLocked.value = false;
      localStorage.setItem(STORAGE_KEY_LOCKED, "false");
      authError.value = null;
      return true;
    } else {
      authError.value = "PIN non corretto. Riprova.";
      return false;
    }
  } /*end unlockWithPin*/

  function formatAuthError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
      return "Credenziali non valide. Verifica email e password.";
    }
    if (msg.includes("user-not-found")) {
      return "Nessun account trovato con questa email.";
    }
    if (msg.includes("email-already-in-use")) {
      return "Questa email è già registrata. Accedi con le tue credenziali.";
    }
    if (msg.includes("weak-password")) {
      return "Password troppo debole. Inserisci almeno 6 caratteri.";
    }
    if (msg.includes("invalid-email")) {
      return "Formato email non valido.";
    }
    return `Errore autenticazione: ${msg}`;
  } /*end formatAuthError*/

  return {
    user,
    isAuthReady,
    isLocked,
    savedPin,
    isRegistrationAllowed,
    authLoading,
    authError,
    isAuthenticated,
    hasPin,
    userEmail,
    initAuth,
    checkRegistrationStatus,
    login,
    register,
    logout,
    setSecurityPin,
    removeSecurityPin,
    lockScreen,
    unlockWithPin
  };
});
