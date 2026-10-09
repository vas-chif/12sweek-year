<script setup lang="ts">
/**
 * @file ClanHealthView.vue
 * @description Life Goals Hub & Protocollo Черепаха 🐢 (3 Phases, Trend History, Clan Family & Ma)
 * @author Vasile Chifeac
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Protocollo Черепаха 🐢 a 3 Fasi con storico trend misurazioni
 * - Macro Life Goals management across 4 life pillars (Family, Business, Personal, Finances)
 * - Zero mock data at initial launch (Tabula Rasa)
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, reactive } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type TurtlePhase,
  TURTLE_PHASE_CONFIG,
  type LifeGoalCategory,
  LIFE_GOAL_CATEGORY_DETAILS
} from "@/types/twelveWeek";

const store = useTwelveWeekStore();
const $q = useQuasar();

// ── 4. Protocollo Черепаха 🐢 a 3 Fasi ─────────────────────────────────────────
const activePhase = computed<TurtlePhase>(() => {
  return store.plan.physicalMetrics.currentPhase || "phase1";
});

const activePhaseConfig = computed(() => {
  return TURTLE_PHASE_CONFIG[activePhase.value];
});

function selectPhase(phase: TurtlePhase): void {
  store.setTurtlePhase(phase);
} /*end selectPhase*/

// Input per nuova misurazione fisica
const draftWeight = ref<number>(store.plan.physicalMetrics.weightKg || 70.5);
const draftWaist = ref<number>(store.plan.physicalMetrics.waistCm || 84.0);
const draftNotes = ref<string>("");

function saveMeasurement(): void {
  if (draftWeight.value <= 0 || draftWaist.value <= 0) {
    $q.notify({
      type: "warning",
      message: "Inserisci valori validi per peso e girovita",
      position: "top-right"
    });
    return;
  }
  store.addPhysicalMeasurement(
    draftWeight.value,
    draftWaist.value,
    draftNotes.value.trim()
  );
  draftNotes.value = "";
} /*end saveMeasurement*/

// ── 5. Macro Obiettivi del Trimestre (Life Goals) ─────────────────────────────
const showAddGoalDialog = ref<boolean>(false);
const newGoal = reactive<{
  category: LifeGoalCategory;
  title: string;
  deadline: string;
  targetDailyHours: number;
  totalTargetHours: number;
  notes: string;
}>({
  category: "business",
  title: "",
  deadline: "2026-11-26",
  targetDailyHours: 2.0,
  totalTargetHours: 40,
  notes: ""
});

const goalCategoryOptions = Object.entries(LIFE_GOAL_CATEGORY_DETAILS).map(
  ([key, val]) => ({
    label: val.label,
    value: key as LifeGoalCategory,
    icon: val.icon
  })
);

function handleAddGoal(): void {
  if (!newGoal.title.trim()) {
    $q.notify({
      type: "warning",
      message: "Inserisci un titolo per l'obiettivo",
      position: "top-right"
    });
    return;
  }

  store.addLifeGoal({
    category: newGoal.category,
    title: newGoal.title.trim(),
    deadline: newGoal.deadline.trim(),
    targetDailyHours: Number(newGoal.targetDailyHours) || 0,
    totalTargetHours: Number(newGoal.totalTargetHours) || 0,
    notes: newGoal.notes.trim()
  });

  newGoal.title = "";
  newGoal.notes = "";
  showAddGoalDialog.value = false;
} /*end handleAddGoal*/

function handleDeleteGoal(id: string): void {
  $q.dialog({
    title: "Conferma Eliminazione",
    message: "Eliminare questo obiettivo dal piano?",
    cancel: true,
    dark: true
  }).onOk(() => {
    store.deleteLifeGoal(id);
  });
} /*end handleDeleteGoal*/

function getCategoryMeta(c: LifeGoalCategory) {
  return LIFE_GOAL_CATEGORY_DETAILS[c] || LIFE_GOAL_CATEGORY_DETAILS.business;
}

// ── 6. Timer Vuoto "Ma" (Fermo Biologico di 60 Secondi) ────────────────────────
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
        message: "Vuoto 'Ma' completato. Mente decompressa con successo.",
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
    <!-- 1. TOP HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="flag" color="positive" size="32px" />
          <h1 class="text-h6 text-weight-bolder text-white q-my-none">
            OBIETTIVI & PROTOCOLLO ЧЕРЕПАХА 🐢
          </h1>
        </div>
        <div class="text-caption text-grey-4">
          Impostazione dei traguardi marziali per le 4 aree di vita &
          monitoraggio corporeo a 3 fasi
        </div>
      </div>

      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Nuovo Obiettivo"
        class="text-weight-bold no-print"
        no-caps
        @click="showAddGoalDialog = true"
      />
    </div>

    <!-- 2. PROTOCOLLO ЧЕРЕПАХА 🐢 A 3 FASI -->
    <q-card flat class="glass-panel q-pa-md border border-slate-700 q-mb-md">
      <div class="row items-center justify-between q-mb-sm">
        <div
          class="text-subtitle1 text-weight-bolder text-emerald-4 row items-center"
        >
          <q-icon name="fitness_center" class="q-mr-xs" size="24px" />
          PROTOCOLLO ЧЕРЕПАХА 🐢 (TARTARUGA) — LE 3 FASI
        </div>
        <q-badge color="emerald-9" text-color="white" class="text-weight-bold">
          Target: {{ activePhaseConfig.targetWaist }} •
          {{ activePhaseConfig.targetWeight }}
        </q-badge>
      </div>

      <!-- SELETTORE DELLE 3 FASI -->
      <div class="row q-gutter-xs q-mb-md">
        <q-btn
          v-for="phaseKey in ['phase1', 'phase2', 'phase3'] as TurtlePhase[]"
          :key="phaseKey"
          unelevated
          :color="activePhase === phaseKey ? 'emerald-7' : 'slate-800'"
          :text-color="activePhase === phaseKey ? 'white' : 'grey-4'"
          class="col text-weight-bold"
          size="sm"
          no-caps
          @click="selectPhase(phaseKey)"
        >
          <div>
            <div class="text-weight-bold">{{
              TURTLE_PHASE_CONFIG[phaseKey].name
            }}</div>
            <div class="text-caption" style="font-size: 10px">{{
              TURTLE_PHASE_CONFIG[phaseKey].targetWeight
            }}</div>
          </div>
        </q-btn>
      </div>

      <!-- SCHEDA DETTAGLIO FASE ATTIVA -->
      <div
        class="bg-slate-800 q-pa-md rounded-borders border border-slate-700 q-mb-md"
      >
        <div class="text-subtitle2 text-weight-bold text-accent q-mb-xs">
          {{ activePhaseConfig.name }}: {{ activePhaseConfig.subtitle }}
        </div>
        <div class="text-body2 text-grey-3 q-mb-sm">
          {{ activePhaseConfig.description }}
        </div>
        <div class="q-gutter-y-xs">
          <div
            v-for="(rule, rIdx) in activePhaseConfig.rules"
            :key="rIdx"
            class="text-caption text-grey-4"
          >
            • {{ rule }}
          </div>
        </div>
      </div>

      <!-- FORM INSERIMENTO MISURAZIONE & STORICO -->
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="draftWeight"
            type="number"
            label="Peso Attuale (kg)"
            dense
            outlined
            dark
            step="0.1"
            class="bg-slate-900"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="draftWaist"
            type="number"
            label="Girovita Addome (cm)"
            dense
            outlined
            dark
            step="0.5"
            class="bg-slate-900"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="draftNotes"
            label="Note misurazione (opzionale)"
            dense
            outlined
            dark
            class="bg-slate-900"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-btn
            unelevated
            color="emerald-6"
            text-color="dark"
            icon="save"
            label="Salva Misura"
            class="w-full text-weight-bold"
            no-caps
            @click="saveMeasurement"
          />
        </div>
      </div>

      <!-- TABELLA STORICO TREND -->
      <div v-if="store.plan.physicalMetrics.history.length > 0" class="q-mt-md">
        <div class="text-caption text-weight-bold text-grey-4 q-mb-xs">
          📈 STORICO MISURAZIONI E TREND:
        </div>
        <q-markup-table flat dense dark class="bg-slate-800 rounded-borders">
          <thead>
            <tr>
              <th class="text-left">Data</th>
              <th class="text-center">Fase</th>
              <th class="text-center">Peso</th>
              <th class="text-center">Girovita</th>
              <th class="text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in store.plan.physicalMetrics.history" :key="rec.id">
              <td class="text-left">{{ rec.date }}</td>
              <td class="text-center">
                <q-badge color="emerald-9" size="xs">{{ rec.phase }}</q-badge>
              </td>
              <td class="text-center text-weight-bold"
                >{{ rec.weightKg }} kg</td
              >
              <td class="text-center text-weight-bold">{{ rec.waistCm }} cm</td>
              <td class="text-left text-grey-4">{{ rec.notes || "-" }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </q-card>

    <!-- 3. I MACRO OBIETTIVI DELLE 4 AREE (BUSINESS, FAMIGLIA, FINANZE, PERSONALE) -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card flat class="glass-panel q-pa-md border border-slate-700">
          <div class="row items-center justify-between q-mb-sm">
            <div
              class="text-subtitle1 text-weight-bolder text-primary row items-center"
            >
              <q-icon name="stars" class="q-mr-xs" size="24px" />
              MACRO OBIETTIVI DI VITA (12-WEEK YEAR)
            </div>
            <div class="text-caption text-grey-4">
              Definite Chief Aim & Milestone Scadenzate
            </div>
          </div>

          <!-- LISTA OBIETTIVI ATTIVI -->
          <div v-if="store.plan.goals.length > 0" class="row q-col-gutter-sm">
            <div
              v-for="goal in store.plan.goals"
              :key="goal.id"
              class="col-12 col-md-6"
            >
              <q-card
                flat
                class="bg-slate-800 border border-slate-700 q-pa-sm rounded-borders h-full"
              >
                <div class="row items-center justify-between q-mb-xs">
                  <q-chip
                    dense
                    size="xs"
                    :color="getCategoryMeta(goal.category).color"
                    :icon="getCategoryMeta(goal.category).icon"
                    text-color="white"
                  >
                    {{ getCategoryMeta(goal.category).label }}
                  </q-chip>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="delete"
                    color="grey-5"
                    @click="handleDeleteGoal(goal.id)"
                  />
                </div>

                <div class="text-subtitle2 text-weight-bold text-white q-mb-xs">
                  {{ goal.title }}
                </div>

                <div
                  v-if="goal.deadline"
                  class="row items-center q-gutter-x-xs text-caption text-amber-4 q-mb-xs"
                >
                  <q-icon name="event" size="14px" />
                  <span
                    >Scadenza: <strong>{{ goal.deadline }}</strong></span
                  >
                </div>

                <div
                  class="row justify-between items-center text-caption text-grey-4"
                >
                  <span>⏱️ Impegno: {{ goal.targetDailyHours }}h/giorno</span>
                  <span v-if="goal.totalTargetHours"
                    >Target: {{ goal.totalTargetHours }}h tot.</span
                  >
                </div>
              </q-card>
            </div>
          </div>

          <div
            v-else
            class="text-center q-pa-md bg-slate-800 rounded-borders text-grey-5"
          >
            <div class="text-body2">Nessun macro-obiettivo registrato.</div>
            <div class="text-caption"
              >Usa il pulsante "+ Nuovo Obiettivo" in alto per definire
              traguardi chiari (es. ProfessioneSicura a Torino il 26-28
              Nov).</div
            >
          </div>
        </q-card>
      </div>
    </div>

    <!-- 4. SEZIONE CLAN FAMIGLIA & FERMO BIOLOGICO MA -->
    <div class="row q-col-gutter-md">
      <!-- CLAN FAMIGLIA -->
      <div class="col-12 col-lg-7">
        <q-card flat class="glass-panel q-pa-md border border-slate-700 h-full">
          <div
            class="text-subtitle1 text-weight-bolder text-rose-4 q-mb-sm row items-center"
          >
            <q-icon name="favorite" class="q-mr-xs" size="24px" />
            IL CLAN: PRESENZA PURA (20 MINUTI ESCLUSIVI)
          </div>

          <div class="q-gutter-y-xs text-caption text-grey-3 q-mb-md">
            <div class="bg-slate-800 q-pa-xs rounded-borders">
              👦 <strong>Stefan:</strong> Compiti, gioco, ascolto senza
              smartphone o pensieri clinici.
            </div>
            <div class="bg-slate-800 q-pa-xs rounded-borders">
              👶 <strong>Nicholas:</strong> Tempo di qualità dedicato, gioco
              puro e contatto visivo.
            </div>
            <div class="bg-slate-800 q-pa-xs rounded-borders">
              👩 <strong>Elina:</strong> Connessione di coppia, dialogo intimo e
              supporto reciproco.
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="store.plan.familyWellbeing.stefanNicholasSport"
                label="Sport Bimbi (Stefan & Nicholas)"
                dense
                outlined
                dark
                class="bg-slate-800"
                @update:model-value="store.saveToLocalStorage"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="store.plan.familyWellbeing.medicalChecks"
                label="Controlli Medici Famiglia"
                dense
                outlined
                dark
                class="bg-slate-800"
                @update:model-value="store.saveToLocalStorage"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- FERMO BIOLOGICO MA (60 SECONDI) -->
      <div class="col-12 col-lg-5">
        <q-card
          flat
          class="glass-panel q-pa-md border border-slate-700 text-center h-full"
        >
          <div class="text-subtitle2 text-weight-bolder text-primary q-mb-xs">
            MIYAMOTO MUSASHI — IL VUOTO "MA" (60s)
          </div>
          <div class="text-caption text-grey-4 q-mb-sm">
            Intervallo sacro di decompressione diaframmatica
          </div>

          <div class="text-h4 text-weight-bolder text-primary q-my-sm">
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

    <!-- 5. DIALOG AGGIUNGI MACRO OBIETTIVO -->
    <q-dialog v-model="showAddGoalDialog">
      <q-card
        class="bg-slate-900 text-white border border-slate-700"
        style="min-width: 440px"
      >
        <q-card-section
          class="row items-center justify-between border-b border-slate-800"
        >
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="flag" color="primary" class="q-mr-sm" />
            Nuovo Macro Obiettivo Trimestrale
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md q-pt-md">
          <q-select
            v-model="newGoal.category"
            :options="goalCategoryOptions"
            emit-value
            map-options
            label="Area di Vita"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <q-input
            v-model="newGoal.title"
            label="Titolo Obiettivo (es. Presentazione Torino)"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <q-input
            v-model="newGoal.deadline"
            label="Data Scadenza / Deadline (es. 2026-11-26)"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model.number="newGoal.targetDailyHours"
                label="Ore al giorno previste"
                type="number"
                step="0.5"
                min="0"
                outlined
                dense
                dark
                class="bg-slate-800"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="newGoal.totalTargetHours"
                label="Monte ore totale stimato"
                type="number"
                step="5"
                min="0"
                outlined
                dense
                dark
                class="bg-slate-800"
              />
            </div>
          </div>

          <q-input
            v-model="newGoal.notes"
            label="Note operative / contesto"
            outlined
            dense
            dark
            type="textarea"
            rows="2"
            class="bg-slate-800"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-t border-slate-800">
          <q-btn flat label="Annulla" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            label="Salva Obiettivo"
            color="primary"
            class="text-weight-bold"
            @click="handleAddGoal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped lang="scss">
.w-full {
  width: 100%;
}
</style>
