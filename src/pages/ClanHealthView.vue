<script setup lang="ts">
/**
 * @file ClanHealthView.vue
 * @description Hub Macro Obiettivi di Vita (12-Week Year) con Fasi / Milestone modulari (Tabula Rasa)
 * @author Vasile Chifeac
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - §4.4 AGENTS.md: Pagina orchestratrice modulare < 600 righe
 * - Tabula Rasa assoluta: nessun dato fittizio o protocollo statico hardcoded
 * - Fasi e milestone dinamiche per ciascun obiettivo (Immagine 2)
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import type { LifeGoal } from "@/types/twelveWeek";

// ── 5. Componenti Figli ────────────────────────────────────────────────────────
import AddGoalDialog from "@/components/goals/AddGoalDialog.vue";
import GoalPhasesCard from "@/components/goals/GoalPhasesCard.vue";

const store = useTwelveWeekStore();
const $q = useQuasar();

// ── Stato Dialog e Modifica ───────────────────────────────────────────────────
const showAddGoalDialog = ref<boolean>(false);
const selectedGoalToEdit = ref<LifeGoal | null>(null);

function openNewGoal(): void {
  selectedGoalToEdit.value = null;
  showAddGoalDialog.value = true;
} /*end openNewGoal*/

function handleEditGoal(goal: LifeGoal): void {
  selectedGoalToEdit.value = goal;
  showAddGoalDialog.value = true;
} /*end handleEditGoal*/

function confirmClearGoals(): void {
  $q.dialog({
    title: "Azzera Tutti gli Obiettivi (Tabula Rasa)",
    message:
      "Sei sicuro di voler rimuovere tutti i macro-obiettivi salvati? L'elenco tornerà completamente vuoto.",
    cancel: true,
    dark: true
  }).onOk(() => {
    store.clearAllGoals();
  });
} /*end confirmClearGoals*/

// ── Timer Vuoto "Ma" (Fermo Biologico di 60 Secondi) ──────────────────────────
const timerSeconds = ref<number>(60);
const isTimerRunning = ref<boolean>(false);
let timerInterval: ReturnType<typeof setInterval> | null = null;

function startMaTimer(): void {
  if (isTimerRunning.value) return;
  isTimerRunning.value = true;
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--;
    } else {
      stopMaTimer();
      $q.notify({
        type: "positive",
        message:
          "Vuoto 'Ma' completato. Decompressione diaframmatica completata.",
        position: "top-right"
      });
    }
  }, 1000);
} /*end startMaTimer*/

function stopMaTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isTimerRunning.value = false;
} /*end stopMaTimer*/

function resetMaTimer(): void {
  stopMaTimer();
  timerSeconds.value = 60;
} /*end resetMaTimer*/
</script>

<template>
  <q-page class="q-pa-md bg-dark-page text-white">
    <!-- 1. TOP HEADER ORCHESTRATORE -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="stars" color="primary" size="30px" />
          <h1 class="text-h6 text-weight-bolder text-white q-my-none">
            MACRO OBIETTIVI DI VITA (12-WEEK YEAR)
          </h1>
        </div>
        <div class="text-caption text-grey-4">
          Definite Chief Aim & Milestone Scadenzate a Fasi
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm no-print">
        <q-btn
          v-if="store.plan.goals.length > 0"
          flat
          dense
          color="negative"
          icon="delete_sweep"
          label="Azzera Obiettivi"
          no-caps
          @click="confirmClearGoals"
        />
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Nuovo Obiettivo"
          class="text-weight-bold"
          no-caps
          @click="openNewGoal"
        />
      </div>
    </div>

    <!-- 2. EMPTY STATE FEDELE ALL'IMMAGINE 1 (TABULA RASA QUANDO VUOTA) -->
    <div v-if="store.plan.goals.length === 0" class="q-mb-lg">
      <q-card
        flat
        class="glass-panel q-pa-xl border border-slate-700 text-center rounded-borders"
      >
        <div class="column items-center justify-center q-gutter-y-sm">
          <q-icon
            name="track_changes"
            size="48px"
            color="primary"
            class="q-mb-xs"
          />
          <div class="text-subtitle1 text-weight-bolder text-white">
            Nessun macro-obiettivo registrato
          </div>
          <div class="text-caption text-grey-4 max-w-md">
            Definisci i tuoi traguardi chiave per le 12 settimane. Clicca sul
            pulsante sottostante per impostare il tuo primo obiettivo.
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Crea Primo Macro Obiettivo"
            no-caps
            class="text-weight-bold q-px-lg q-mt-sm"
            @click="openNewGoal"
          />
        </div>
      </q-card>
    </div>

    <!-- 3. LISTA OBIETTIVI ATTIVI CON SCHEDE FASI (IMMAGINE 2) -->
    <div v-else class="q-mb-lg">
      <GoalPhasesCard
        v-for="goal in store.plan.goals"
        :key="goal.id"
        :goal="goal"
        @edit="handleEditGoal"
      />
    </div>

    <!-- 4. STRUMENTO DECOMPRESSIONE: VUOTO "MA" (60s) UNIVERSALE -->
    <div class="row q-col-gutter-md q-mt-md no-print">
      <div class="col-12 col-md-6 offset-md-3">
        <q-card
          flat
          class="glass-panel q-pa-md border border-slate-700 text-center rounded-borders"
        >
          <div class="text-subtitle2 text-weight-bolder text-primary q-mb-xs">
            MIYAMOTO MUSASHI — IL VUOTO "MA" (60s)
          </div>
          <div class="text-caption text-grey-4 q-mb-xs">
            Intervallo di decompressione diaframmatica per il reset
            dell'attenzione
          </div>

          <div
            class="text-h4 text-weight-bolder text-primary q-my-sm font-mono"
          >
            {{ timerSeconds }}s
          </div>

          <div class="row justify-center q-gutter-x-sm">
            <q-btn
              v-if="!isTimerRunning"
              unelevated
              size="sm"
              color="primary"
              label="Avvia 60s"
              no-caps
              @click="startMaTimer"
            />
            <q-btn
              v-else
              unelevated
              size="sm"
              color="warning"
              label="Pausa"
              no-caps
              @click="stopMaTimer"
            />
            <q-btn
              flat
              size="sm"
              color="grey-4"
              label="Reset"
              no-caps
              @click="resetMaTimer"
            />
          </div>
        </q-card>
      </div>
    </div>

    <!-- 5. DIALOG MODULARE AGGIUNGI / MODIFICA MACRO OBIETTIVO -->
    <AddGoalDialog
      v-model="showAddGoalDialog"
      :goal-to-edit="selectedGoalToEdit"
    />
  </q-page>
</template>

<style scoped lang="scss">
.max-w-md {
  max-width: 480px;
}
.font-mono {
  font-family: monospace;
}
</style>
