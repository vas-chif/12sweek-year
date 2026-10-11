<script setup lang="ts">
/**
 * @file TodayView.vue
 * @description Daily Execution Focus: Shift, Brian Tracy Frog A1, Weekly Tactics Sync & Hours Logging
 * @author Vasile Chifeac
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Direct bidirectional connection with Active Week Tactics
 * - Daily logged hours sync to cumulative weekly total
 * - Non-negotiable daily rituals: Черепаха 🐢 workout, zero sugar, clan family & Ma
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { computed, ref } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type HospitalShift,
  type DailyHabit,
  SHIFT_DETAILS,
  PRIORITY_DETAILS,
  CATEGORY_DETAILS,
  type Priority,
  type TacticCategory
} from "@/types/twelveWeek";

const store = useTwelveWeekStore();
const $q = useQuasar();

const currentHabit = computed<DailyHabit>(() => store.todayHabit);

const shiftInfo = computed(() => {
  return SHIFT_DETAILS[currentHabit.value.shift] || SHIFT_DETAILS.R;
});

function setTodayShift(shift: HospitalShift): void {
  store.updateHabit(store.todayDateString, { shift });
} /*end setTodayShift*/

function onHabitUpdate(): void {
  store.updateHabit(store.todayDateString, currentHabit.value);
} /*end onHabitUpdate*/

// ── 4. Tattiche della Settimana Collegate a Oggi ───────────────────────────────
const todaysTactics = computed(() => {
  return [...store.currentWeekTactics].sort((a, b) => {
    const order: Record<Priority, number> = {
      A1: 1,
      A2: 2,
      B1: 3,
      B2: 4,
      C1: 5,
      D: 6,
      E: 7
    };
    return (order[a.priority] || 99) - (order[b.priority] || 99);
  });
});

function getTacticHoursToday(tacticId: string): number {
  const tactic = store.plan.tactics.find(t => t.id === tacticId);
  return tactic?.loggedDailyHours?.[store.todayDateString] ?? 0;
} /*end getTacticHoursToday*/

function onHoursChange(tacticId: string, hours: number | string | null): void {
  const num = Number(hours) || 0;
  store.logTacticHours(tacticId, store.todayDateString, num);
} /*end onHoursChange*/

function getPriorityMeta(p: Priority) {
  return PRIORITY_DETAILS[p] || PRIORITY_DETAILS.A1;
}

function getCategoryMeta(c: TacticCategory) {
  return CATEGORY_DETAILS[c] || CATEGORY_DETAILS.business;
}

// ── 5. Timer Vuoto "Ma" (Fermo Biologico di 60 Secondi) ────────────────────────
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
      currentHabit.value.zenMaDone = true;
      onHabitUpdate();
      $q.notify({
        type: "positive",
        message:
          "Vuoto 'Ma' completato. Respiro diaframmatico eseguito con successo.",
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
    <!-- 1. HEADER DATA ODIERNA & TURNO ATTIVO -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="today" color="accent" size="32px" />
          <h1 class="text-h6 text-weight-bolder text-white q-my-none">
            FOCUS DI OGGI
          </h1>
        </div>
        <div class="text-caption text-grey-4">
          {{ store.formattedToday }} • Settimana
          <strong>W{{ store.selectedWeek }}</strong> ({{
            store.selectedWeekInfo.fictitiousMonth
          }})
        </div>
      </div>

      <!-- TURNO DEL GIORNO ATTIVO -->
      <q-chip
        :color="shiftInfo.color"
        :text-color="shiftInfo.textColor"
        :icon="shiftInfo.icon"
        class="text-weight-bold text-subtitle2 q-py-md"
      >
        Turno: {{ shiftInfo.label }} ({{ shiftInfo.time }})
      </q-chip>
    </div>

    <div class="row q-col-gutter-md">
      <!-- 2. COLONNA SINISTRA: ROSPO A1 & COMPITI DALLA SETTIMANA -->
      <div class="col-12 col-lg-7">
        <!-- BRIAN TRACY: STRATEGIC BLOCK & IL ROSPO A1 -->
        <q-card
          flat
          class="glass-panel q-pa-md border border-slate-700 q-mb-md"
        >
          <div class="row items-center justify-between q-mb-sm">
            <div
              class="text-subtitle1 text-weight-bolder text-negative row items-center"
            >
              <q-icon name="pest_control" class="q-mr-xs" size="24px" />
              BRIAN TRACY — EAT THAT FROG (IL ROSPO A1)
            </div>
            <q-badge
              color="negative"
              text-color="white"
              label="Priorità Assoluta"
            />
          </div>

          <div class="text-body2 text-grey-3 q-mb-md">
            Il compito decisivo che genera l'<strong>80% del valore</strong>.
            <div class="text-caption text-amber-4 q-mt-xs">
              ⚠️
              <em
                >Vietato toccare compiti B o C prima che il Rospo A1 sia
                interamente ingoiato!</em
              >
            </div>
          </div>

          <!-- INPUT/DISPLAY DEL ROSPO A1 -->
          <div
            class="bg-slate-800 q-pa-md rounded-borders border border-slate-700 q-mb-md"
          >
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-bold text-grey-4"
                >ROASPO A1 DI OGGI:</span
              >
              <q-checkbox
                v-model="currentHabit.frogA1Done"
                color="positive"
                label="Rospo Ingoiato (Completato)"
                class="text-weight-bold"
                @update:model-value="onHabitUpdate"
              />
            </div>
            <q-input
              v-model="currentHabit.deadlines"
              placeholder="Qual è il rospo A1 che devi divorare oggi prima di qualsiasi altra cosa?"
              outlined
              dense
              dark
              type="textarea"
              rows="2"
              class="bg-slate-900"
              @update:model-value="onHabitUpdate"
            />
          </div>

          <!-- STRATEGIC BLOCK MATTUTINO (03:10 - 04:30 AM) -->
          <div
            class="row items-center justify-between bg-slate-800/80 q-pa-sm rounded-borders border border-slate-700"
          >
            <div class="row items-center q-gutter-x-sm">
              <q-avatar
                size="32px"
                color="accent"
                text-color="dark"
                icon="alarm"
              />
              <div>
                <div class="text-weight-bold text-body2"
                  >Strategic Block Mattutino</div
                >
                <div class="text-caption text-grey-4"
                  >03:10 – 04:30 AM (80 min ininterrotti sul focus chiave)</div
                >
              </div>
            </div>
            <q-checkbox
              v-model="currentHabit.strategicBlockDone"
              color="positive"
              label="Eseguito"
              class="text-weight-bold"
              @update:model-value="onHabitUpdate"
            />
          </div>
        </q-card>

        <!-- ATTIVITÀ & TATTICHE DALLA SETTIMANA ATTIVA (CON REGISTRAZIONE ORE) -->
        <q-card
          flat
          class="glass-panel q-pa-md border border-slate-700 q-mb-md"
        >
          <div class="row items-center justify-between q-mb-sm">
            <div
              class="text-subtitle1 text-weight-bolder text-primary row items-center"
            >
              <q-icon name="checklist" class="q-mr-xs" size="24px" />
              TATTICHE DELLA SETTIMANA ATTIVA (W{{ store.selectedWeek }})
            </div>
            <q-badge
              color="primary"
              text-color="white"
              label="Sincronizzazione Ore"
            />
          </div>

          <div class="text-caption text-grey-4 q-mb-md">
            I compiti pianificati per questa settimana. Registra le ore lavorate
            oggi per aggiornare il monte ore totale.
          </div>

          <!-- LISTA DELLE TATTICHE ORDINATE PER PRIORITÀ -->
          <div v-if="todaysTactics.length > 0" class="q-gutter-y-sm">
            <div
              v-for="tactic in todaysTactics"
              :key="tactic.id"
              class="bg-slate-800 q-pa-sm rounded-borders border border-slate-700 row items-center justify-between"
            >
              <div class="col-12 col-sm-7 row items-center q-gutter-x-xs">
                <q-checkbox
                  v-model="tactic.completed"
                  color="positive"
                  @update:model-value="store.toggleTactic(tactic.id)"
                />
                <q-chip
                  :class="getPriorityMeta(tactic.priority).badgeClass"
                  size="xs"
                  class="text-weight-bold"
                >
                  {{ tactic.priority }}
                </q-chip>
                <div class="col">
                  <div
                    class="text-body2 text-weight-medium"
                    :class="{ 'line-through text-grey-5': tactic.completed }"
                  >
                    {{ tactic.description }}
                  </div>
                  <div class="text-caption text-grey-4">
                    {{ getCategoryMeta(tactic.category).label }} • Target:
                    {{ tactic.target }}
                  </div>
                </div>
              </div>

              <!-- INPUT REGISTRAZIONE ORE OGGI -->
              <div
                class="col-12 col-sm-5 row items-center justify-end q-gutter-x-sm q-mt-xs q-mt-sm-none"
              >
                <div class="text-right">
                  <div class="text-caption text-grey-4">Ore Oggi:</div>
                  <q-input
                    :model-value="getTacticHoursToday(tactic.id)"
                    type="number"
                    step="0.5"
                    min="0"
                    dense
                    outlined
                    dark
                    style="width: 85px"
                    class="bg-slate-900"
                    suffix="h"
                    @update:model-value="val => onHoursChange(tactic.id, val)"
                  />
                </div>
                <div class="text-right q-ml-xs">
                  <div class="text-caption text-grey-5">Totale W:</div>
                  <q-badge
                    color="sky-9"
                    text-color="sky-2"
                    class="text-weight-bold"
                  >
                    {{
                      store.getTacticWeeklyLoggedHours(
                        tactic,
                        store.selectedWeekInfo
                      )
                    }}h
                  </q-badge>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center q-pa-md bg-slate-800 rounded-borders text-grey-5"
          >
            <div class="text-body2"
              >Nessuna tattica nella Settimana W{{ store.selectedWeek }}.</div
            >
            <div class="text-caption"
              >Aggiungi i tuoi obiettivi e compiti nella scheda
              <strong>Settimana 12WY</strong>.</div
            >
          </div>
        </q-card>

        <!-- SELETTORE RAPIDO TURNO OSPEDALIERO -->
        <q-card flat class="glass-panel q-pa-md border border-slate-700">
          <div class="text-subtitle2 text-weight-bold text-accent q-mb-sm">
            GESTIONE TURNO OSPEDALIERO DI OGGI
          </div>
          <div class="row q-gutter-xs q-mb-sm">
            <q-btn
              v-for="s in ['M', 'P', 'N', 'S', 'R', 'A'] as HospitalShift[]"
              :key="s"
              unelevated
              :color="
                currentHabit.shift === s ? SHIFT_DETAILS[s].color : 'slate-800'
              "
              :text-color="currentHabit.shift === s ? 'white' : 'grey-4'"
              class="col text-weight-bold"
              size="sm"
              no-caps
              @click="setTodayShift(s)"
            >
              <div>
                <div>{{ s }}</div>
                <div class="text-caption" style="font-size: 9px">{{
                  SHIFT_DETAILS[s].label
                }}</div>
              </div>
            </q-btn>
          </div>
          <q-input
            v-model="currentHabit.shiftNotes"
            placeholder="Note cliniche / turni del giorno..."
            outlined
            dense
            dark
            class="bg-slate-800"
            @update:model-value="onHabitUpdate"
          />
        </q-card>
      </div>

      <!-- 3. COLONNA DESTRA: RITUALI NON NEGOZIABILI & VUOTO MA -->
      <div class="col-12 col-lg-5">
        <q-card flat class="glass-panel q-pa-md border border-slate-700">
          <div
            class="text-subtitle1 text-weight-bolder text-accent q-mb-md row items-center"
          >
            <q-icon name="checklist_rtl" class="q-mr-xs" size="24px" />
            RITUALI QUOTIDIANI NON NEGOZIABILI
          </div>

          <div class="q-gutter-y-sm">
            <!-- 1. WORKOUT ЧЕРЕПАХА 🐢 -->
            <div
              class="row items-center justify-between bg-slate-800 q-pa-sm rounded-borders border border-slate-700"
            >
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="fitness_center" color="emerald-4" size="22px" />
                <div>
                  <div class="text-weight-bold text-body2"
                    >Workout Черепаха 🐢</div
                  >
                  <div class="text-caption text-grey-4"
                    >Sessione forza / circuiti calibrata sul turno</div
                  >
                </div>
              </div>
              <q-checkbox
                v-model="currentHabit.workoutDone"
                color="emerald-5"
                @update:model-value="onHabitUpdate"
              />
            </div>

            <!-- 2. ZERO ZUCCHERI RAFFINATI -->
            <div
              class="row items-center justify-between bg-slate-800 q-pa-sm rounded-borders border border-slate-700"
            >
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="no_food" color="amber-5" size="22px" />
                <div>
                  <div class="text-weight-bold text-body2"
                    >Zero Zuccheri Raffinati</div
                  >
                  <div class="text-caption text-grey-4"
                    >Target -3.5cm girovita addome</div
                  >
                </div>
              </div>
              <q-checkbox
                v-model="currentHabit.zeroSugar"
                color="amber-6"
                @update:model-value="onHabitUpdate"
              />
            </div>

            <!-- 3. STEFAN: 20 MIN PRESENZA PURA -->
            <div
              class="row items-center justify-between bg-slate-800 q-pa-sm rounded-borders border border-slate-700"
            >
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="child_care" color="sky-4" size="22px" />
                <div>
                  <div class="text-weight-bold text-body2"
                    >Stefan: 20 min Presenza Pura</div
                  >
                  <div class="text-caption text-grey-4"
                    >Attenzione esclusiva, zero telefono</div
                  >
                </div>
              </div>
              <q-checkbox
                v-model="currentHabit.stefan20m"
                color="sky-5"
                @update:model-value="onHabitUpdate"
              />
            </div>

            <!-- 4. NICHOLAS: 20 MIN PRESENZA PURA -->
            <div
              class="row items-center justify-between bg-slate-800 q-pa-sm rounded-borders border border-slate-700"
            >
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="face" color="sky-4" size="22px" />
                <div>
                  <div class="text-weight-bold text-body2"
                    >Nicholas: 20 min Presenza Pura</div
                  >
                  <div class="text-caption text-grey-4"
                    >Tempo esclusivo senza distrazioni</div
                  >
                </div>
              </div>
              <q-checkbox
                v-model="currentHabit.nicholas20m"
                color="sky-5"
                @update:model-value="onHabitUpdate"
              />
            </div>

            <!-- 5. ELINA: 20 MIN CONNESSIONE DI COPPIA -->
            <div
              class="row items-center justify-between bg-slate-800 q-pa-sm rounded-borders border border-slate-700"
            >
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="favorite" color="rose-4" size="22px" />
                <div>
                  <div class="text-weight-bold text-body2"
                    >Elina: 20 min Connessione</div
                  >
                  <div class="text-caption text-grey-4"
                    >Dialogo, ascolto e supporto di coppia</div
                  >
                </div>
              </div>
              <q-checkbox
                v-model="currentHabit.elina20m"
                color="rose-5"
                @update:model-value="onHabitUpdate"
              />
            </div>

            <!-- 6. IL VUOTO "MA" CON TIMER INTEGRATO (60s) -->
            <div
              class="bg-slate-800 q-pa-sm rounded-borders border border-slate-700 q-mt-sm"
            >
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="self_improvement" color="primary" size="22px" />
                  <div>
                    <div class="text-weight-bold text-body2"
                      >Il Vuoto "Ma" (Decompressione)</div
                    >
                    <div class="text-caption text-grey-4"
                      >60s di respirazione diaframmatica</div
                    >
                  </div>
                </div>
                <q-checkbox
                  v-model="currentHabit.zenMaDone"
                  color="primary"
                  @update:model-value="onHabitUpdate"
                />
              </div>

              <!-- TIMER INTERATTIVO -->
              <div
                class="row items-center justify-between bg-slate-900 q-pa-sm rounded-borders q-mt-xs"
              >
                <div class="text-h6 text-weight-bolder text-primary">
                  {{ timerSeconds }}s
                </div>
                <div class="row q-gutter-x-xs">
                  <q-btn
                    v-if="!isTimerRunning"
                    unelevated
                    dense
                    size="sm"
                    color="primary"
                    label="Avvia 60s"
                    no-caps
                    @click="startMaTimer"
                  />
                  <q-btn
                    v-else
                    unelevated
                    dense
                    size="sm"
                    color="warning"
                    label="Pausa"
                    no-caps
                    @click="stopMaTimer"
                  />
                  <q-btn
                    flat
                    dense
                    size="sm"
                    color="grey-4"
                    label="Reset"
                    no-caps
                    @click="resetMaTimer"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.line-through {
  text-decoration: line-through;
}
</style>
