<script setup lang="ts">
/**
 * @file TacticsDashboard.vue
 * @description Weekly Tactics Dashboard (12WY W1..W12) with Milestone Countdown & Cumulative Hours
 * @author Vasile Chifeac
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - WAM Execution Score (≥ 85% Target)
 * - Countdown banner for upcoming deadlines (e.g. ProfessioneSicura Torino 26-28 Nov)
 * - Cumulative hours tracker aggregated from daily execution logs
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, reactive } from "vue";
import { type QTableColumn, useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type TacticItem,
  type Priority,
  type TacticCategory,
  PRIORITY_DETAILS,
  CATEGORY_DETAILS
} from "@/types/twelveWeek";

const store = useTwelveWeekStore();
const $q = useQuasar();

const showAddDialog = ref<boolean>(false);

// ── 4. Navigazione Settimane ───────────────────────────────────────────────────
function prevWeek(): void {
  if (store.selectedWeek > 1) {
    store.selectedWeek--;
  }
} /*end prevWeek*/

function nextWeek(): void {
  if (store.selectedWeek < 12) {
    store.selectedWeek++;
  }
} /*end nextWeek*/

// Metadati della settimana selezionata
const currentWeekMeta = computed(() => store.selectedWeekInfo);
const scoreInfo = computed(() => store.selectedWeekScore);

// ── 5. Form Inserimento Nuova Tattica ──────────────────────────────────────────
const newTactic = reactive<{
  priority: Priority;
  category: TacticCategory;
  description: string;
  target: string;
  plannedDailyHours: number;
  goalId?: string | undefined;
}>({
  priority: "A1",
  category: "business",
  description: "",
  target: "",
  plannedDailyHours: 1.0,
  goalId: undefined
});

const priorityOptions = Object.entries(PRIORITY_DETAILS).map(([key, val]) => ({
  label: val.label,
  value: key as Priority,
  description: val.description
}));

const categoryOptions = Object.entries(CATEGORY_DETAILS).map(([key, val]) => ({
  label: val.label,
  value: key as TacticCategory,
  icon: val.icon
}));

const goalOptions = computed(() => {
  return [
    { label: "Nessun obiettivo collegato (Generico)", value: undefined },
    ...store.plan.goals.map(g => ({
      label: `${g.title} (${g.deadline || "Senza data"})`,
      value: g.id
    }))
  ];
});

function handleAddTactic(): void {
  if (!newTactic.description.trim()) {
    $q.notify({
      type: "warning",
      message: "Inserisci una descrizione valida per la tattica",
      position: "top-right"
    });
    return;
  }

  store.addTactic({
    weekNumber: store.selectedWeek,
    priority: newTactic.priority,
    category: newTactic.category,
    description: newTactic.description.trim(),
    target: newTactic.target.trim() || "Esecuzione 100%",
    completed: false,
    leadIndicator: true,
    plannedDailyHours: Number(newTactic.plannedDailyHours) || 0,
    loggedDailyHours: {},
    goalId: newTactic.goalId
  });

  // Reset form
  newTactic.description = "";
  newTactic.target = "";
  newTactic.plannedDailyHours = 1.0;
  newTactic.goalId = undefined;
  showAddDialog.value = false;
} /*end handleAddTactic*/

function handleDelete(id: string): void {
  $q.dialog({
    title: "Conferma Eliminazione",
    message: "Rimuovere questa tattica dal piano settimanale?",
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(() => {
    store.deleteTactic(id);
  });
} /*end handleDelete*/

function printWeekSheet(): void {
  window.print();
} /*end printWeekSheet*/

// Colonne Tabella Tattiche
const columns: QTableColumn<TacticItem>[] = [
  {
    name: "status",
    label: "Stato",
    field: "completed",
    align: "center",
    sortable: true
  },
  {
    name: "priority",
    label: "Priorità ABCDE",
    field: "priority",
    align: "center",
    sortable: true
  },
  { name: "category", label: "Area", field: "category", align: "left" },
  {
    name: "description",
    label: "Tattica / Lead Indicator",
    field: "description",
    align: "left"
  },
  { name: "hours", label: "Ore Settimana", field: "id", align: "center" },
  {
    name: "target",
    label: "Target Misurabile",
    field: "target",
    align: "left"
  },
  { name: "actions", label: "Azioni", field: "id", align: "center" }
];

function getPriorityMeta(p: Priority) {
  return PRIORITY_DETAILS[p] || PRIORITY_DETAILS.A1;
}

function getCategoryMeta(c: TacticCategory) {
  return CATEGORY_DETAILS[c] || CATEGORY_DETAILS.business;
}
</script>

<template>
  <q-page class="q-pa-md bg-dark-page text-white">
    <!-- 1. HEADER SETTIMANA 12WY & NAVIGAZIONE VELOCE -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            flat
            round
            dense
            icon="chevron_left"
            color="white"
            :disable="store.selectedWeek <= 1"
            @click="prevWeek"
          />
          <q-icon name="military_tech" color="accent" size="30px" />
          <h1 class="text-h6 text-weight-bolder text-white q-my-none">
            {{ currentWeekMeta.label }}
          </h1>
          <q-btn
            flat
            round
            dense
            icon="chevron_right"
            color="white"
            :disable="store.selectedWeek >= 12"
            @click="nextWeek"
          />
        </div>
        <div class="text-caption text-grey-4 q-ml-md">
          Mese Fittizio:
          <strong>{{ currentWeekMeta.fictitiousMonth }}</strong> • Target
          Efficacia WAM ≥ 85%
        </div>
      </div>

      <!-- BOTTONI AZIONE -->
      <div class="row q-gutter-x-sm no-print">
        <q-btn
          unelevated
          color="accent"
          text-color="dark"
          icon="add"
          label="Aggiungi Tattica / Eat That Frog"
          class="text-weight-bold"
          no-caps
          @click="showAddDialog = true"
        />
        <q-btn
          outline
          color="positive"
          icon="print"
          label="Stampa A4"
          no-caps
          @click="printWeekSheet"
        />
      </div>
    </div>

    <!-- 2. BANNER COUNTDOWN MILESTONE / SCADENZE IMMINENTI -->
    <div v-if="store.upcomingMilestones.length > 0" class="q-mb-md">
      <q-card
        flat
        class="bg-gradient-amber q-pa-sm border border-amber-500 rounded-borders text-white"
      >
        <div class="row items-center justify-between">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="flag" color="amber-3" size="26px" />
            <div>
              <div class="text-subtitle2 text-weight-bold text-amber-2">
                🎯 SCADENZA IMMINENTE: {{ store.upcomingMilestones[0]?.title }}
              </div>
              <div class="text-caption text-grey-3">
                Deadline:
                <strong>{{ store.upcomingMilestones[0]?.deadline }}</strong> •
                Mancano
                <strong
                  >{{
                    store.upcomingMilestones[0]?.weeksLeft
                  }}
                  settimane</strong
                >
                ({{ store.upcomingMilestones[0]?.daysLeft }} giorni rimasti)
              </div>
            </div>
          </div>
          <q-chip
            outline
            color="amber-3"
            text-color="amber-2"
            size="sm"
            class="text-weight-bold"
          >
            Alloca ore questa settimana!
          </q-chip>
        </div>
      </q-card>
    </div>

    <!-- 3. SCORE BANNER (WAM: WEEKLY ACCOUNTABILITY SCORE) -->
    <div class="q-mb-md">
      <q-card
        flat
        class="glass-panel q-pa-md border border-slate-700"
        :class="
          scoreInfo.isTargetMet ? 'border-emerald-500' : 'border-amber-500'
        "
      >
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md-7">
            <div class="row items-center q-gutter-x-sm q-mb-xs">
              <q-icon
                :name="scoreInfo.isTargetMet ? 'verified' : 'crisis_alert'"
                :color="scoreInfo.isTargetMet ? 'positive' : 'warning'"
                size="26px"
              />
              <span class="text-h6 text-weight-bolder">
                Execution Score W{{ store.selectedWeek }}:
                {{ scoreInfo.score }}%
              </span>
              <q-chip
                :color="scoreInfo.isTargetMet ? 'positive' : 'warning'"
                text-color="dark"
                class="text-weight-bold"
                size="sm"
              >
                {{
                  scoreInfo.isTargetMet
                    ? "TARGET ≥85% SUPERATO"
                    : "ATTENZIONE: SOTTO SOGLIA 85%"
                }}
              </q-chip>
            </div>

            <div class="text-body2 text-grey-3 q-mb-sm">
              <span v-if="scoreInfo.total === 0">
                📝 Agenda bianca per questa settimana. Inserisci i tuoi Lead
                Indicators e il Rospo A1 per iniziare.
              </span>
              <span v-else-if="scoreInfo.isTargetMet">
                🎯 <strong>Eccellenza Esecutiva:</strong> I lead indicator
                controllabili al 100% sono stati completati con successo.
              </span>
              <span v-else>
                ⚠️ <strong>Verifica WAM:</strong> Esecuzione al
                {{ scoreInfo.score }}%. Concentrati sull'unico fronte d'attacco
                prima di Domenica.
              </span>
            </div>

            <div class="row items-center q-gutter-x-md">
              <div class="col">
                <q-linear-progress
                  :value="scoreInfo.score / 100"
                  size="10px"
                  rounded
                  :color="scoreInfo.isTargetMet ? 'positive' : 'warning'"
                  track-color="slate-800"
                />
              </div>
              <div class="text-caption text-weight-bold">
                {{ scoreInfo.completed }} / {{ scoreInfo.total }} Tattiche
              </div>
            </div>
          </div>

          <!-- CONTATORE RAPIDO -->
          <div
            class="col-12 col-md-5 row justify-around text-center border-l-md border-slate-700"
          >
            <div>
              <div class="text-caption text-grey-4">Completate</div>
              <div class="text-h5 text-weight-bolder text-positive">{{
                scoreInfo.completed
              }}</div>
            </div>
            <div>
              <div class="text-caption text-grey-4">Rimanenti</div>
              <div class="text-h5 text-weight-bolder text-amber-5">{{
                scoreInfo.total - scoreInfo.completed
              }}</div>
            </div>
            <div>
              <div class="text-caption text-grey-4"
                >Totali W{{ store.selectedWeek }}</div
              >
              <div class="text-h5 text-weight-bolder text-white">{{
                scoreInfo.total
              }}</div>
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- 4. SELETTORE A PILLOLE DELLE 12 SETTIMANE -->
    <div
      class="row items-center q-gutter-xs q-mb-md no-print overflow-x-auto q-py-xs"
    >
      <span class="text-caption text-weight-bold text-grey-4 q-mr-xs"
        >SETTIMANA 12WY:</span
      >
      <q-btn
        v-for="w in 12"
        :key="w"
        dense
        unelevated
        :color="store.selectedWeek === w ? 'primary' : 'slate-800'"
        :text-color="store.selectedWeek === w ? 'white' : 'grey-4'"
        :label="`W${w}`"
        class="text-weight-bold q-px-sm"
        size="sm"
        @click="store.selectedWeek = w"
      />
      <q-space />
      <span class="text-caption text-grey-4 gt-xs">
        Periodo: {{ currentWeekMeta.startDate }} – {{ currentWeekMeta.endDate }}
      </span>
    </div>

    <!-- 5. CHECKLIST DELLE TATTICHE E LEAD INDICATORS -->
    <q-card flat class="glass-panel border border-slate-700">
      <q-card-section
        class="q-py-sm bg-slate-800 border-b border-slate-700 row items-center justify-between"
      >
        <div>
          <div class="text-subtitle2 text-weight-bolder text-white">
            CHECKLIST TATTICHE E LEAD INDICATORS
          </div>
          <div class="text-caption text-grey-4">
            Priorità Brian Tracy ABCDE • Registrazione ore cumulativa dai log
            giornalieri
          </div>
        </div>
      </q-card-section>

      <q-table
        flat
        dark
        dense
        :rows="store.currentWeekTactics"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
        class="bg-transparent"
      >
        <!-- STATO (CHECKBOX) -->
        <template #body-cell-status="props">
          <q-td :props="props" class="q-pa-none">
            <q-checkbox
              v-model="props.row.completed"
              color="positive"
              @update:model-value="store.toggleTactic(props.row.id)"
            />
          </q-td>
        </template>

        <!-- PRIORITA ABCDE -->
        <template #body-cell-priority="props">
          <q-td :props="props">
            <q-chip
              :class="getPriorityMeta(props.row.priority).badgeClass"
              size="sm"
              class="text-weight-bold"
            >
              {{ props.row.priority }}
            </q-chip>
          </q-td>
        </template>

        <!-- AREA DI VITA -->
        <template #body-cell-category="props">
          <q-td :props="props">
            <q-chip
              dense
              size="xs"
              outline
              :color="getCategoryMeta(props.row.category).color"
              :icon="getCategoryMeta(props.row.category).icon"
            >
              {{ getCategoryMeta(props.row.category).label }}
            </q-chip>
          </q-td>
        </template>

        <!-- DESCRIZIONE -->
        <template #body-cell-description="props">
          <q-td :props="props">
            <div :class="{ 'line-through text-grey-5': props.row.completed }">
              {{ props.row.description }}
            </div>
            <div
              v-if="props.row.plannedDailyHours > 0"
              class="text-caption text-accent"
            >
              ⏱️ Previste: {{ props.row.plannedDailyHours }}h / giorno
            </div>
          </q-td>
        </template>

        <!-- ORE SETTIMANALI CUMULATIVE -->
        <template #body-cell-hours="props">
          <q-td :props="props">
            <q-badge color="sky-9" text-color="sky-2" class="text-weight-bold">
              {{
                store.getTacticWeeklyLoggedHours(props.row, currentWeekMeta)
              }}h svolte
            </q-badge>
          </q-td>
        </template>

        <!-- TARGET MISURABILE -->
        <template #body-cell-target="props">
          <q-td :props="props">
            <span class="text-grey-3">{{ props.row.target }}</span>
          </q-td>
        </template>

        <!-- AZIONI -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              size="sm"
              @click="handleDelete(props.row.id)"
            >
              <q-tooltip>Elimina Tattica</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- EMPTY STATE (TABULA RASA) -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-lg text-grey-5">
            <q-icon name="menu_book" size="36px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle2 text-weight-bold"
                >Nessuna tattica pianificata per la Settimana
                {{ store.selectedWeek }}.</div
              >
              <div class="text-caption"
                >Clicca su "+ Aggiungi Tattica" per definire il Rospo A1 e i
                tuoi Lead Indicators.</div
              >
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- 6. DIALOG AGGIUNGI TATTICA -->
    <q-dialog v-model="showAddDialog">
      <q-card
        class="bg-slate-900 text-white border border-slate-700"
        style="min-width: 460px"
      >
        <q-card-section
          class="row items-center justify-between border-b border-slate-800"
        >
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="add_task" color="accent" class="q-mr-sm" />
            Aggiungi Tattica — Settimana {{ store.selectedWeek }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md q-pt-md">
          <!-- PRIORITA BRIAN TRACY -->
          <q-select
            v-model="newTactic.priority"
            :options="priorityOptions"
            emit-value
            map-options
            label="Priorità Brian Tracy ABCDE"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <!-- AREA DI VITA -->
          <q-select
            v-model="newTactic.category"
            :options="categoryOptions"
            emit-value
            map-options
            label="Area di Vita"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <!-- EVENTUALE OBIETTIVO MACRO COLLEGATO -->
          <q-select
            v-if="store.plan.goals.length > 0"
            v-model="newTactic.goalId"
            :options="goalOptions"
            emit-value
            map-options
            label="Collega a un Macro Obiettivo (Opzionale)"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <!-- DESCRIZIONE -->
          <q-input
            v-model="newTactic.description"
            label="Descrizione Azione / Tattica"
            outlined
            dense
            dark
            type="textarea"
            rows="2"
            class="bg-slate-800"
            placeholder="Azione precisa e non negoziabile..."
          />

          <!-- ORE DEDICATE AL GIORNO -->
          <q-input
            v-model.number="newTactic.plannedDailyHours"
            label="Ore previste al giorno (es. 2.0h su ProfessioneSicura)"
            type="number"
            step="0.5"
            min="0"
            outlined
            dense
            dark
            class="bg-slate-800"
          />

          <!-- TARGET MISURABILE -->
          <q-input
            v-model="newTactic.target"
            label="Target Misurabile (es. 5 MMG, 4 workout, 7/7 giorni)"
            outlined
            dense
            dark
            class="bg-slate-800"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-t border-slate-800">
          <q-btn flat label="Annulla" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            label="Aggiungi Tattica"
            color="primary"
            class="text-weight-bold"
            @click="handleAddTactic"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped lang="scss">
.bg-gradient-amber {
  background: linear-gradient(
    135deg,
    rgba(120, 53, 15, 0.4) 0%,
    rgba(180, 83, 9, 0.25) 100%
  );
}

.line-through {
  text-decoration: line-through;
}
</style>
