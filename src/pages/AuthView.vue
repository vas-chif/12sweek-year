<script setup lang="ts">
/**
 * @file AuthView.vue
 * @description Schermata di Autenticazione Firebase & Blocco Postazione di Lavoro con PIN Marziale
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Design Marziale Dark Slate (#0b1120, #0f172a, #1e293b, #38bdf8)
 * - Protezione visiva postazione clinica/lavoro con PIN numerico
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// ── Stato Locale ───────────────────────────────────────────────────────────────
const tab = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const confirmPassword = ref("");
const showConfirmPassword = ref(false);
const enteredPin = ref("");
const setupPin = ref("");
const isSettingNewPin = ref(false);

onMounted(() => {
  if (!authStore.isRegistrationAllowed) {
    tab.value = "login";
  }
});

watch(
  () => authStore.isRegistrationAllowed,
  allowed => {
    if (!allowed && tab.value === "register") {
      tab.value = "login";
    }
  }
);

async function handleAuth(): Promise<void> {
  if (!email.value || !password.value) {
    $q.notify({
      type: "warning",
      message: "Inserisci sia email che password",
      position: "top"
    });
    return;
  }

  if (tab.value === "register") {
    if (password.value !== confirmPassword.value) {
      $q.notify({
        type: "warning",
        message: "Le password non coincidono",
        position: "top"
      });
      return;
    }
  }

  let success = false;
  if (tab.value === "login") {
    success = await authStore.login(email.value, password.value);
  } else {
    success = await authStore.register(email.value, password.value);
  }

  if (success) {
    $q.notify({
      type: "positive",
      message:
        tab.value === "login"
          ? "Benvenuto nella Cabina di Regia!"
          : "Account registrato con successo!",
      position: "top"
    });
    router.push("/");
  } else if (authStore.authError) {
    $q.notify({
      type: "negative",
      message: authStore.authError,
      position: "top"
    });
  }
} /*end handleAuth*/

function handleUnlock(): void {
  if (!enteredPin.value) return;

  const unlocked = authStore.unlockWithPin(enteredPin.value);
  if (unlocked) {
    enteredPin.value = "";
    $q.notify({
      type: "positive",
      message: "Postazione sbloccata. Focus riattivato!",
      position: "top",
      timeout: 1000
    });
    router.push("/");
  } else {
    enteredPin.value = "";
    $q.notify({
      type: "negative",
      message: authStore.authError || "PIN errato",
      position: "top"
    });
  }
} /*end handleUnlock*/

function handleSavePin(): void {
  if (setupPin.value.length < 4 || setupPin.value.length > 8) {
    $q.notify({
      type: "warning",
      message: "Il PIN deve contenere tra 4 e 8 cifre numeriche",
      position: "top"
    });
    return;
  }

  authStore.setSecurityPin(setupPin.value);
  setupPin.value = "";
  isSettingNewPin.value = false;
  $q.notify({
    type: "positive",
    message: "PIN di sblocco rapido salvato con successo!",
    position: "top"
  });
} /*end handleSavePin*/

function appendPinDigit(digit: string): void {
  if (enteredPin.value.length < 8) {
    enteredPin.value += digit;
  }
} /*end appendPinDigit*/

function clearPin(): void {
  enteredPin.value = "";
} /*end clearPin*/

function backspacePin(): void {
  enteredPin.value = enteredPin.value.slice(0, -1);
} /*end backspacePin*/

async function handleLogout(): Promise<void> {
  await authStore.logout();
  enteredPin.value = "";
  $q.notify({
    type: "info",
    message: "Sessione terminata.",
    position: "top"
  });
} /*end handleLogout*/
</script>

<template>
  <div
    class="auth-wrapper fullscreen flex flex-center bg-dark text-white q-pa-md"
  >
    <div class="auth-card glass-panel q-pa-lg">
      <!-- HEADER BRAND MARZIALE -->
      <div class="text-center q-mb-lg">
        <q-avatar
          size="64px"
          color="primary"
          text-color="white"
          icon="security"
          class="q-mb-sm shadow-4"
        />
        <div class="text-h6 text-weight-bolder tracking-wide text-white">
          12-WEEK YEAR OPERATIONAL HUB
        </div>
        <div class="text-caption text-grey-4">
          Cabina di Regia Marziale • Protezione Dati & Privacy
        </div>
      </div>

      <!-- CASO 1: SCHERMO BLOCCATO (UTENTE LOGGATO, SERVE SOLO PIN) -->
      <div
        v-if="authStore.isAuthenticated && authStore.isLocked"
        class="lock-screen-section"
      >
        <q-card
          flat
          class="bg-slate-900 border border-slate-700 q-pa-md q-mb-md rounded-borders text-center"
        >
          <q-icon name="lock" color="amber-5" size="32px" class="q-mb-xs" />
          <div class="text-subtitle2 text-weight-bold text-amber-5">
            POSTAZIONE DI LAVORO PROTETTA
          </div>
          <div class="text-caption text-grey-4 q-mt-xs">
            Account attivo: <strong>{{ authStore.userEmail }}</strong>
          </div>
        </q-card>

        <!-- PIN INPUT VISIVO -->
        <div class="text-center q-my-md">
          <div class="text-caption text-grey-4 q-mb-xs">
            {{
              authStore.hasPin
                ? "Inserisci il PIN numerico di sblocco:"
                : "Nessun PIN impostato. Clicca Sblocca per accedere:"
            }}
          </div>
          <div
            v-if="authStore.hasPin"
            class="pin-display row justify-center q-gutter-x-sm q-my-sm"
          >
            <span
              v-for="i in 6"
              :key="i"
              class="pin-dot"
              :class="{ filled: enteredPin.length >= i }"
            />
          </div>
        </div>

        <!-- TASTIERINO NUMERICO ERGONOMICO -->
        <div v-if="authStore.hasPin" class="keypad q-mx-auto q-mb-md">
          <div class="row justify-center q-gutter-xs q-mb-xs">
            <q-btn
              v-for="n in ['1', '2', '3']"
              :key="n"
              flat
              class="keypad-btn"
              :label="n"
              @click="appendPinDigit(n)"
            />
          </div>
          <div class="row justify-center q-gutter-xs q-mb-xs">
            <q-btn
              v-for="n in ['4', '5', '6']"
              :key="n"
              flat
              class="keypad-btn"
              :label="n"
              @click="appendPinDigit(n)"
            />
          </div>
          <div class="row justify-center q-gutter-xs q-mb-xs">
            <q-btn
              v-for="n in ['7', '8', '9']"
              :key="n"
              flat
              class="keypad-btn"
              :label="n"
              @click="appendPinDigit(n)"
            />
          </div>
          <div class="row justify-center q-gutter-xs">
            <q-btn
              flat
              class="keypad-btn text-negative"
              icon="clear"
              @click="clearPin"
            />
            <q-btn
              flat
              class="keypad-btn"
              label="0"
              @click="appendPinDigit('0')"
            />
            <q-btn
              flat
              class="keypad-btn text-warning"
              icon="backspace"
              @click="backspacePin"
            />
          </div>
        </div>

        <q-btn
          unelevated
          color="primary"
          icon="lock_open"
          label="Sblocca Agenda"
          class="full-width text-weight-bold q-py-sm q-mb-sm"
          @click="handleUnlock"
        />

        <div class="row justify-between items-center q-mt-md">
          <q-btn
            flat
            dense
            size="sm"
            color="grey-4"
            icon="vpn_key"
            label="Modifica PIN"
            @click="isSettingNewPin = !isSettingNewPin"
          />
          <q-btn
            flat
            dense
            size="sm"
            color="negative"
            icon="logout"
            label="Disconnetti"
            @click="handleLogout"
          />
        </div>

        <!-- DIALOG MODIFICA PIN -->
        <div
          v-if="isSettingNewPin"
          class="q-mt-md q-pa-sm bg-slate-800 rounded-borders border border-slate-700"
        >
          <div class="text-caption text-weight-bold q-mb-xs"
            >Imposta Nuovo PIN (4-8 cifre):</div
          >
          <q-input
            v-model="setupPin"
            dark
            dense
            outlined
            no-error-icon
            type="password"
            maxlength="8"
            placeholder="Es. 1234"
            class="auth-input q-mb-xs"
          />
          <div class="row q-gutter-x-xs">
            <q-btn
              dense
              size="sm"
              color="positive"
              label="Salva PIN"
              class="col"
              @click="handleSavePin"
            />
            <q-btn
              dense
              size="sm"
              color="negative"
              flat
              label="Annulla"
              class="col"
              @click="isSettingNewPin = false"
            />
          </div>
        </div>
      </div>

      <!-- CASO 2: LOGIN / REGISTRAZIONE EMAIL & PASSWORD -->
      <div v-else class="login-register-section">
        <!-- SELEZIONE ACCEDI / REGISTRATI (VISIBILE SOLO SE NON C'È ANCORA UN UTENTE REGISTRATO) -->
        <q-tabs
          v-if="authStore.isRegistrationAllowed"
          v-model="tab"
          dense
          active-color="primary"
          indicator-color="primary"
          align="justify"
          class="q-mb-md text-grey-4"
        >
          <q-tab name="login" label="Accedi" icon="login" />
          <q-tab name="register" label="Registrati" icon="person_add" />
        </q-tabs>

        <!-- SE C'È GIÀ UN UTENTE REGISTRATO: ACCESSO ESCLUSIVO PROPRIETARIO -->
        <div
          v-else
          class="row items-center justify-center q-py-sm q-mb-md bg-slate-900 border border-slate-800 rounded-borders text-primary text-subtitle2 text-weight-bold"
        >
          <q-icon
            name="admin_panel_settings"
            size="20px"
            class="q-mr-xs text-primary"
          />
          ACCESSO CABINA DI REGIA • PROPRIETARIO
        </div>

        <q-form @submit.prevent="handleAuth" class="q-gutter-y-md">
          <q-input
            v-model="email"
            dark
            outlined
            dense
            no-error-icon
            class="auth-input"
            label="Email Personale"
            type="email"
            autocomplete="email"
            color="primary"
            :rules="[val => !!val || 'Email obbligatoria']"
          >
            <template #prepend>
              <q-icon name="email" color="grey-4" size="20px" />
            </template>
            <template #append>
              <q-icon
                v-if="email"
                name="cancel"
                size="20px"
                class="cursor-pointer text-grey-5"
                @click="email = ''"
              />
            </template>
          </q-input>

          <q-input
            v-model="password"
            dark
            outlined
            dense
            no-error-icon
            class="auth-input"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            :autocomplete="
              tab === 'login' ? 'current-password' : 'new-password'
            "
            color="primary"
            :rules="[
              val => !!val || 'Password obbligatoria',
              val => val.length >= 6 || 'Minimo 6 caratteri'
            ]"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-4" size="20px" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                size="20px"
                class="cursor-pointer text-grey-4"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-if="tab === 'register' && authStore.isRegistrationAllowed"
            v-model="confirmPassword"
            dark
            outlined
            dense
            no-error-icon
            class="auth-input"
            label="Conferma Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            color="primary"
            :rules="[
              val => !!val || 'Conferma password obbligatoria',
              val => val === password || 'Le password non coincidono'
            ]"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-4" size="20px" />
            </template>
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                size="20px"
                class="cursor-pointer text-grey-4"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <q-btn
            unelevated
            type="submit"
            color="primary"
            :loading="authStore.authLoading"
            class="full-width text-weight-bold q-py-sm"
            :icon="tab === 'login' ? 'login' : 'how_to_reg'"
            :label="
              tab === 'login'
                ? 'Entra nella Cabina di Regia'
                : 'Crea Account Personale'
            "
          />
        </q-form>

        <q-card
          flat
          class="q-mt-md q-pa-sm bg-slate-900 border border-slate-800 text-caption text-grey-4"
        >
          <div class="row items-center text-info q-mb-xs">
            <q-icon name="shield" class="q-mr-xs" size="16px" />
            <strong>Riservatezza & Protezione al Lavoro</strong>
          </div>
          I tuoi turni sanitari, il rospo A1 e le metriche del protocollo
          Черепаха 🐢 sono protetti e accessibili solo con il tuo account
          personale.
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-wrapper {
  background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0b1120 70%);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #334155;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}

.pin-display {
  min-height: 24px;
}

.pin-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #38bdf8;
  transition: all 0.2s ease;

  &.filled {
    background-color: #38bdf8;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
  }
}

.keypad {
  max-width: 240px;

  .keypad-btn {
    width: 64px;
    height: 48px;
    border-radius: 8px;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid #334155;
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;

    &:hover {
      background: rgba(56, 189, 248, 0.2);
      border-color: #38bdf8;
    }
  }
}

:deep(.auth-input) {
  .q-field__control {
    background-color: #0b1329 !important;
    border-radius: 8px;
    height: 48px;
    min-height: 48px;
    align-items: center;
    border: 1px solid #334155;
    transition: all 0.2s ease;

    &:before {
      border: none !important;
    }

    &:hover {
      border-color: #475569;
    }
  }

  &.q-field--focused .q-field__control {
    border-color: #38bdf8 !important;
    box-shadow: 0 0 0 1px #38bdf8;
  }

  &.q-field--error .q-field__control {
    border-color: #ef4444 !important;
  }

  .q-field__native,
  .q-field__input {
    color: #f8fafc !important;
  }

  .q-field__label {
    color: #94a3b8 !important;
  }

  /* Neutralizza lo sfondo chiaro/azzurro forzato da Chrome/Brave Autofill */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #0b1329 inset !important;
    -webkit-text-fill-color: #f8fafc !important;
    caret-color: #f8fafc !important;
    border-radius: 0;
    transition: background-color 5000s ease-in-out 0s;
  }
}
</style>
