<script setup lang="ts">
/**
 * @file CalendarView.vue
 * @description Single-Month Navigable Calendar & 12WY Timetable Selector with Fast JSON Shift Import
 * @author Vasile Chifeac
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Single Month View to eliminate visual clutter and cognitive fatigue
 * - Dynamic cycle start date selector (12/10, 19/10, 26/10, custom)
 * - Shift Import Engine JSON preserved with single-click manual override
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type HospitalShift,
  SHIFT_DETAILS,
  type TwelveWeekInfo
} from "@/types/twelveWeek";

// ── 5. Componenti Figli ────────────────────────────────────────────────────────
import ShiftImportDialog from "@/components/calendar/ShiftImportDialog.vue";

const store = useTwelveWeekStore();
const router = useRouter();
const $q = useQuasar();

// ── 4. Stato Navigazione Mese Singolo ──────────────────────────────────────────
// Inizializzato a Ottobre 2026 (o mese corrente)
const viewingYear = ref<number>(2026);
const viewingMonth = ref<number>(10); // 1-12 (Ottobre = 10)

const monthNames = [
  "GENNAIO",
  "FEBBRAIO",
  "MARZO",
  "APRILE",
  "MAGGIO",
  "GIUGNO",
  "LUGLIO",
  "AGOSTO",
  "SETTEMBRE",
  "OTTOBRE",
  "NOVEMBRE",
  "DICEMBRE"
];

const currentMonthLabel = computed(() => {
  return `${monthNames[viewingMonth.value - 1]} ${viewingYear.value}`;
});

function prevMonth(): void {
  if (viewingMonth.value === 1) {
    viewingMonth.value = 12;
    viewingYear.value--;
  } else {
    viewingMonth.value--;
  }
} /*end prevMonth*/

function nextMonth(): void {
  if (viewingMonth.value === 12) {
    viewingMonth.value = 1;
    viewingYear.value++;
  } else {
    viewingMonth.value++;
  }
} /*end nextMonth*/

function goToTodayMonth(): void {
  const today = store.currentDate;
  viewingYear.value = today.getFullYear();
  viewingMonth.value = today.getMonth() + 1;
} /*end goToTodayMonth*/

// ── 5. Selettore Inizio Ciclo 12WY Flessibile ──────────────────────────────────
const cycleStartOptions = [
  { label: "Lunedì 12 Ottobre 2026 (Standard)", value: "2026-10-12" },
  { label: "Lunedì 19 Ottobre 2026 (+1 Settimana)", value: "2026-10-19" },
  { label: "Lunedì 26 Ottobre 2026 (+2 Settimane)", value: "2026-10-26" }
];

function onCycleStartChange(newDate: string): void {
  store.setCycleStartDate(newDate);
} /*end onCycleStartChange*/

// ── 6. Generazione Griglia del Mese Singolo ────────────────────────────────────
interface MonthGridCell {
  day: number;
  dateStr: string;
  isToday: boolean;
  wyNum?: number | undefined;
}

interface MonthGridRow {
  weekNum: number;
  wyNum?: number | undefined;
  days: (MonthGridCell | null)[];
}

const singleMonthWeeks = computed<MonthGridRow[]>(() => {
  const y = viewingYear.value;
  const m = viewingMonth.value;
  const daysInMonth = new Date(y, m, 0).getDate();
  const todayStr = store.todayDateString;

  const rows: MonthGridRow[] = [];
  let currentDays: (MonthGridCell | null)[] = [];
  let weekCounter = 1;

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(y, m - 1, d);
    let dayOfWeek = curDate.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Lun=1 ... Dom=7

    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // Cerca se appartiene a una settimana 12WY
    const wyMatch = store.weeksTimetable.find(
      w => dateStr >= w.startDate && dateStr <= w.endDate
    );

    if (d === 1) {
      for (let pad = 1; pad < dayOfWeek; pad++) {
        currentDays.push(null);
      }
    }

    currentDays.push({
      day: d,
      dateStr,
      isToday: dateStr === todayStr,
      wyNum: wyMatch?.weekNumber
    });

    if (dayOfWeek === 7 || d === daysInMonth) {
      if (d === daysInMonth && dayOfWeek < 7) {
        for (let pad = dayOfWeek + 1; pad <= 7; pad++) {
          currentDays.push(null);
        }
      }

      const activeCellWithWy = currentDays.find(c => c && c.wyNum);

      rows.push({
        weekNum: weekCounter++,
        wyNum: activeCellWithWy?.wyNum,
        days: currentDays
      });
      currentDays = [];
    }
  }

  return rows;
});

function getShift(dateStr: string): HospitalShift | null {
  return store.plan.dailyHabits[dateStr]?.shift ?? null;
} /*end getShift*/

function getDayNotes(dateStr: string): string {
  return store.plan.dailyHabits[dateStr]?.shiftNotes ?? "";
} /*end getDayNotes*/

function getDayDeadline(dateStr: string): string {
  return store.plan.dailyHabits[dateStr]?.deadlines ?? "";
} /*end getDayDeadline*/

function navigateToWeek(weekNum: number): void {
  store.selectedWeek = weekNum;
  router.push("/");
} /*end navigateToWeek*/

// ── 7. Dialog Dettaglio/Modifica Giorno Singolo ────────────────────────────────
const selectedDayDate = ref<string>("");
const showDayDialog = ref<boolean>(false);
const dayShiftDraft = ref<HospitalShift>("R");
const dayNotesDraft = ref<string>("");
const dayDeadlineDraft = ref<string>("");

function openDayDetail(dateStr: string): void {
  selectedDayDate.value = dateStr;
  const habit = store.plan.dailyHabits[dateStr];
  dayShiftDraft.value = habit?.shift ?? "R";
  dayNotesDraft.value = habit?.shiftNotes ?? "";
  dayDeadlineDraft.value = habit?.deadlines ?? "";
  showDayDialog.value = true;
} /*end openDayDetail*/

function saveDayDetail(): void {
  store.updateHabit(selectedDayDate.value, {
    shift: dayShiftDraft.value,
    shiftNotes: dayNotesDraft.value.trim(),
    deadlines: dayDeadlineDraft.value.trim()
  });
  showDayDialog.value = false;
  $q.notify({
    type: "positive",
    message: "Giorno aggiornato con successo",
    position: "top-right",
    timeout: 1500
  });
} /*end saveDayDetail*/

// ── 8. Dialog Importazione JSON Turni ──────────────────────────────────────────
const showShiftImportDialog = ref<boolean>(false);

function onShiftsImported(payload: {
  count: number;
  month?: number | undefined;
  year?: number | undefined;
}): void {
  if (payload.month && payload.year) {
    viewingMonth.value = payload.month;
    viewingYear.value = payload.year;
  }
} /*end onShiftsImported*/
</script>

<template>
  <q-page class="q-pa-md bg-dark-page text-white">
    <!-- 1. TOP HEADER & AZIONI -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="calendar_month" color="info" size="32px" />
          <h1 class="text-h6 text-weight-bolder text-white q-my-none">
            CALENDARIO MENSILE & TURNI CLINICI
          </h1>
        </div>
        <div class="text-caption text-grey-4">
          Visualizzazione a singolo mese focalizzato • Sincronizzazione turni e
          scadenze
        </div>
      </div>

      <div class="row q-gutter-x-sm no-print">
        <q-btn
          unelevated
          color="primary"
          icon="file_upload"
          label="Importa Turni (JSON)"
          class="text-weight-bold"
          no-caps
          @click="showShiftImportDialog = true"
        />
      </div>
    </div>

    <!-- 2. BARRA CONFIGURAZIONE INIZIO CICLO 12WY & LEGENDA -->
    <div
      class="row items-center justify-between bg-slate-900 q-pa-sm rounded-borders border border-slate-700 q-mb-md q-col-gutter-sm"
    >
      <div class="col-12 col-md-5 row items-center q-gutter-x-sm">
        <span class="text-caption text-weight-bold text-accent"
          >Partenza Ciclo 12WY:</span
        >
        <q-select
          v-model="store.plan.cycleStartDate"
          :options="cycleStartOptions"
          emit-value
          map-options
          dense
          outlined
          dark
          class="bg-slate-800 col"
          @update:model-value="onCycleStartChange"
        />
      </div>

      <div
        class="col-12 col-md-7 row items-center justify-end q-gutter-xs text-caption"
      >
        <span class="text-grey-4 text-weight-bold q-mr-xs">TURNI:</span>
        <q-chip size="xs" color="sky-7" text-color="white" icon="wb_sunny"
          >M: 07-14</q-chip
        >
        <q-chip size="xs" color="amber-8" text-color="white" icon="wb_twilight"
          >P: 14-21</q-chip
        >
        <q-chip size="xs" color="indigo-9" text-color="white" icon="nights_stay"
          >N: 21-07</q-chip
        >
        <q-chip size="xs" color="purple-7" text-color="white" icon="bed"
          >S: Smonto</q-chip
        >
        <q-chip size="xs" color="emerald-7" text-color="white" icon="hotel"
          >R: Riposo</q-chip
        >
        <q-chip size="xs" color="teal-8" text-color="white" icon="event_busy"
          >A: Ferie/Assenza</q-chip
        >
      </div>
    </div>

    <!-- 3. LAYOUT PRINCIPALE: MESE SINGOLO (SX) + TIMETABLE 12WY (DX) -->
    <div class="row q-col-gutter-md">
      <!-- CALENDARIO MESE SINGOLO -->
      <div class="col-12 col-lg-8">
        <q-card flat class="glass-panel border border-slate-700">
          <!-- NAVIGATORE MESE -->
          <q-card-section
            class="bg-slate-800 row items-center justify-between q-py-sm border-b border-slate-700"
          >
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              color="white"
              @click="prevMonth"
            />
            <div class="row items-center q-gutter-x-sm">
              <span class="text-h6 text-weight-bolder text-accent">{{
                currentMonthLabel
              }}</span>
              <q-btn
                outline
                dense
                size="sm"
                color="info"
                label="Oggi"
                class="q-px-sm"
                @click="goToTodayMonth"
              />
            </div>
            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              color="white"
              @click="nextMonth"
            />
          </q-card-section>

          <!-- GRIGLIA GIORNI MESE SINGOLO -->
          <q-card-section class="q-pa-sm">
            <div class="single-month-grid">
              <div class="grid-header">12WY</div>
              <div
                class="grid-header"
                v-for="d in ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']"
                :key="d"
              >
                {{ d }}
              </div>

              <template v-for="row in singleMonthWeeks" :key="row.weekNum">
                <!-- ETICHETTA SETTIMANA 12WY -->
                <div
                  class="grid-week-label"
                  :class="{ 'highlight-wy cursor-pointer': row.wyNum }"
                  @click="row.wyNum && navigateToWeek(row.wyNum)"
                >
                  <span v-if="row.wyNum" class="text-weight-bold"
                    >W{{ row.wyNum }}</span
                  >
                  <span v-else class="text-grey-6">-</span>
                </div>

                <!-- CELLE DEI GIORNI -->
                <div
                  v-for="(cell, cIdx) in row.days"
                  :key="cIdx"
                  class="grid-day-cell"
                  :class="{
                    'cell-empty': !cell,
                    'cell-today': cell?.isToday,
                    'cursor-pointer': !!cell
                  }"
                  @click="cell && openDayDetail(cell.dateStr)"
                >
                  <template v-if="cell">
                    <div class="row items-center justify-between w-full">
                      <span class="day-num">{{ cell.day }}</span>
                      <span
                        v-if="getShift(cell.dateStr)"
                        :class="`shift-badge shift-${getShift(cell.dateStr)}`"
                      >
                        {{ getShift(cell.dateStr) }}
                      </span>
                    </div>

                    <!-- INDICATORE NOTE O DEADLINE -->
                    <div
                      v-if="getDayDeadline(cell.dateStr)"
                      class="deadline-pill text-truncate"
                    >
                      🎯 {{ getDayDeadline(cell.dateStr) }}
                    </div>
                    <div
                      v-else-if="getDayNotes(cell.dateStr)"
                      class="note-pill text-truncate"
                    >
                      📝 {{ getDayNotes(cell.dateStr) }}
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- TIMETABLE LATERALE 12WY (LISTA SETTIMANE CLICCABILI) -->
      <div class="col-12 col-lg-4">
        <q-card flat class="glass-panel border border-slate-700 h-full">
          <q-card-section
            class="bg-slate-800 q-py-sm border-b border-slate-700"
          >
            <div
              class="text-subtitle2 text-weight-bolder text-primary row items-center"
            >
              <q-icon name="view_week" class="q-mr-xs" />
              TIMETABLE DELLE 12 SETTIMANE
            </div>
          </q-card-section>

          <q-card-section class="q-pa-xs">
            <q-list dense separator class="rounded-borders">
              <q-item
                v-for="w in store.weeksTimetable"
                :key="w.weekNumber"
                clickable
                v-ripple
                :active="store.selectedWeek === w.weekNumber"
                active-class="bg-slate-800 text-accent border-l-4 border-accent"
                class="rounded-borders q-my-xs q-py-sm"
                @click="navigateToWeek(w.weekNumber)"
              >
                <q-item-section avatar class="min-w-0 q-pr-sm">
                  <q-badge
                    :color="
                      store.selectedWeek === w.weekNumber
                        ? 'accent'
                        : 'slate-700'
                    "
                    :text-color="
                      store.selectedWeek === w.weekNumber ? 'dark' : 'white'
                    "
                    class="text-weight-bold"
                  >
                    W{{ w.weekNumber }}
                  </q-badge>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-caption text-weight-bold">
                    {{ w.startDate.substring(5) }} –
                    {{ w.endDate.substring(5) }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-4">
                    {{ w.fictitiousMonth }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="chevron_right" size="18px" color="grey-5" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- DIALOG MODIFICA GIORNO SINGOLO -->
    <q-dialog v-model="showDayDialog">
      <q-card
        class="bg-slate-900 text-white border border-slate-700"
        style="min-width: 360px"
      >
        <q-card-section
          class="row items-center justify-between border-b border-slate-800"
        >
          <div class="text-subtitle1 text-weight-bold">
            Dettaglio Giorno: {{ selectedDayDate }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md q-pt-md">
          <!-- SELETTORE TURNO -->
          <div>
            <div class="text-caption text-grey-4 q-mb-xs"
              >Turno Ospedaliero:</div
            >
            <div class="row q-gutter-xs">
              <q-btn
                v-for="s in ['M', 'P', 'N', 'S', 'R', 'A'] as HospitalShift[]"
                :key="s"
                unelevated
                :color="
                  dayShiftDraft === s ? SHIFT_DETAILS[s].color : 'slate-800'
                "
                :text-color="dayShiftDraft === s ? 'white' : 'grey-4'"
                :label="`${s} - ${SHIFT_DETAILS[s].label}`"
                size="sm"
                no-caps
                @click="dayShiftDraft = s"
              />
            </div>
          </div>

          <!-- DEADLINE / MILESTONE -->
          <q-input
            v-model="dayDeadlineDraft"
            label="Scadenza / Evento Chiave (es. Presentazione Torino)"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <!-- NOTE REPARTO -->
          <q-input
            v-model="dayNotesDraft"
            label="Note cliniche / servizio"
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
            label="Salva Giorno"
            color="primary"
            @click="saveDayDetail"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOG MODULARE IMPORTAZIONE TURNI JSON / FILE -->
    <ShiftImportDialog
      v-model="showShiftImportDialog"
      @imported="onShiftsImported"
    />
  </q-page>
</template>

<style scoped lang="scss">
.single-month-grid {
  display: grid;
  grid-template-columns: 50px repeat(7, 1fr);
  gap: 4px;
}

.grid-header {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  padding: 6px 2px;
  background-color: #0f172a;
  border-radius: 4px;
}

.grid-week-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background-color: #1e293b;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s ease;

  &.highlight-wy {
    background: #0284c7;
    color: white;
    font-weight: bold;
    &:hover {
      background: #0369a1;
    }
  }
}

.grid-day-cell {
  min-height: 68px;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: all 0.15s ease;

  &:hover {
    border-color: #0284c7;
    background-color: #243247;
  }

  &.cell-empty {
    background-color: #0b1120;
    border-color: #1e293b;
    opacity: 0.3;
    pointer-events: none;
  }

  &.cell-today {
    border: 2px solid #f59e0b;
    background-color: #2b394a;
  }
}

.day-num {
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
}

.shift-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 3px;
  color: white;

  &.shift-M {
    background-color: #0284c7;
  }
  &.shift-P {
    background-color: #d97706;
  }
  &.shift-N {
    background-color: #312e81;
  }
  &.shift-S {
    background-color: #7e22ce;
  }
  &.shift-R {
    background-color: #047857;
  }
}

.deadline-pill {
  font-size: 9px;
  background-color: #7f1d1d;
  color: #fca5a5;
  padding: 1px 3px;
  border-radius: 2px;
  margin-top: 2px;
}

.note-pill {
  font-size: 9px;
  background-color: #1e3a5f;
  color: #93c5fd;
  padding: 1px 3px;
  border-radius: 2px;
  margin-top: 2px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
