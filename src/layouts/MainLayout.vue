<script setup lang="ts">
/**
 * @file MainLayout.vue
 * @description Main Layout: Martial Dark Slate Design System, Mobile Bottom Tabs, Desktop Drawer & Print A4
 * @author Vasile Chifeac
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Mobile-First Bottom Tabs (Oggi, Settimana 12WY, Calendario, Obiettivi & Черепаха 🐢)
 * - Desktop Header with Real-Time WAM Execution Score
 * - Print sheet @media print single clean A4
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import { SHIFT_DETAILS } from "@/types/twelveWeek";

const $q = useQuasar();
const store = useTwelveWeekStore();

const leftDrawerOpen = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  $q.dark.set(true);
  store.loadFromLocalStorage();
});

const currentShiftInfo = computed(() => {
  const shift = store.todayHabit.shift;
  return SHIFT_DETAILS[shift] || SHIFT_DETAILS.R;
});

function handleSave(): void {
  store.saveToLocalStorage();
  $q.notify({
    type: "positive",
    message: "Stato sincronizzato in memoria locale!",
    position: "top-right",
    timeout: 1500
  });
} /*end handleSave*/

function handleExport(): void {
  store.exportJSON();
} /*end handleExport*/

function triggerFileInput(): void {
  fileInputRef.value?.click();
} /*end triggerFileInput*/

function handleFileChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const content = e.target?.result as string;
    if (content) {
      store.importJSON(content);
    }
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
  };
  reader.readAsText(file);
} /*end handleFileChange*/

function handlePrint(): void {
  window.print();
} /*end handlePrint*/

function confirmBlankReset(): void {
  $q.dialog({
    title: "Azzera Agenda (Tabula Rasa)",
    message:
      "Vuoi reimpostare l'agenda come pagina bianca nuova? Tutte le tattiche e i parametri inseriti verranno rimossi.",
    cancel: true,
    persistent: true,
    ok: {
      color: "negative",
      label: "Azzera Tutto"
    }
  }).onOk(() => {
    store.resetToBlank();
  });
} /*end confirmBlankReset*/
</script>

<template>
  <q-layout view="hHh Lpr lff" class="bg-dark text-white">
    <!-- TOP HEADER (DESKTOP & TABLET) -->
    <q-header elevated class="martial-top-header text-white no-print">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-mr-sm"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <div
          class="row items-center q-gutter-x-sm cursor-pointer"
          @click="$router.push('/')"
        >
          <q-avatar
            size="36px"
            color="primary"
            text-color="white"
            icon="hourglass_top"
          />
          <div>
            <div
              class="text-weight-bold text-subtitle1 leading-tight tracking-wide"
            >
              12-WEEK YEAR OPERATIONAL HUB
            </div>
            <div class="text-caption text-grey-4">
              TimesManagement • Discipline & Focus Marziale
            </div>
          </div>
        </div>

        <q-space />

        <!-- CONTEXT BADGE DESKTOP: DATA & TURNO -->
        <div class="gt-sm row items-center q-gutter-x-sm q-mr-md">
          <q-chip
            outline
            color="primary"
            text-color="white"
            icon="today"
            class="text-weight-medium q-py-md"
          >
            {{ store.formattedToday }}
          </q-chip>

          <q-chip
            :color="currentShiftInfo.color"
            :text-color="currentShiftInfo.textColor"
            :icon="currentShiftInfo.icon"
            class="text-weight-bold"
          >
            Turno: {{ currentShiftInfo.label }} ({{ currentShiftInfo.time }})
          </q-chip>
        </div>

        <!-- WEEKLY EXECUTION SCORE PILL -->
        <div class="row items-center q-mr-sm">
          <q-badge
            :class="
              store.selectedWeekScore.isTargetMet
                ? 'score-badge-high'
                : 'score-badge-low'
            "
            class="q-px-md q-py-sm text-subtitle2 text-weight-bolder cursor-pointer"
            rounded
            @click="$router.push('/')"
          >
            <q-icon
              :name="
                store.selectedWeekScore.isTargetMet ? 'check_circle' : 'warning'
              "
              class="q-mr-xs"
            />
            W{{ store.selectedWeek }} Score:
            {{ store.selectedWeekScore.score }}%
            <span class="text-caption text-weight-regular q-ml-xs">
              ({{
                store.selectedWeekScore.isTargetMet
                  ? "≥ 85% Target"
                  : "< 85% Warning"
              }})
            </span>
          </q-badge>
        </div>

        <!-- ACTION TOOLBAR BUTTONS -->
        <div class="row items-center q-gutter-xs">
          <q-btn
            flat
            round
            dense
            icon="cloud_sync"
            color="info"
            :loading="store.cloudSyncStatus === 'syncing'"
            @click="store.syncToCloud"
          >
            <q-tooltip>☁️ Sincronizza su Cloud (Firestore)</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="save"
            color="primary"
            @click="handleSave"
          >
            <q-tooltip>💾 Salva Manuale</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="download"
            color="accent"
            @click="handleExport"
          >
            <q-tooltip>📤 Esporta Backup JSON</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="upload"
            color="info"
            @click="triggerFileInput"
          >
            <q-tooltip>📥 Importa Backup JSON</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="print"
            color="positive"
            @click="handlePrint"
          >
            <q-tooltip>🖨️ Stampa A4 Scheda Settimanale</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            color="grey-4"
            @click="$q.dark.toggle()"
          >
            <q-tooltip>Commuta Tema</q-tooltip>
          </q-btn>
        </div>

        <!-- INPUT NASCOSTO PER IMPORTAZIONE FILE -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".json,application/json"
          style="display: none"
          @change="handleFileChange"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER LATERALE (DESKTOP & CONFIGURAZIONI) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="290"
      class="bg-slate-900 border-r border-slate-800 text-white no-print"
    >
      <div class="q-pa-md border-b border-slate-800">
        <div class="text-subtitle2 text-weight-bold text-primary">
          CABINA DI REGIA OPERATIVA
        </div>
        <div class="text-caption text-grey-4">
          The 12 Week Year System • 4 Filosofie
        </div>
      </div>

      <q-list padding class="q-px-sm">
        <q-item
          clickable
          v-ripple
          to="/today"
          exact
          active-class="bg-slate-800 text-primary border-l-4 border-primary"
          class="rounded-borders q-my-xs"
        >
          <q-item-section avatar>
            <q-icon name="today" color="accent" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">Oggi</q-item-label>
            <q-item-label caption class="text-grey-4"
              >Turno, Blocco 03:10 & Rospo A1</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/"
          exact
          active-class="bg-slate-800 text-primary border-l-4 border-primary"
          class="rounded-borders q-my-xs"
        >
          <q-item-section avatar>
            <q-icon name="view_week" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">Settimana 12WY</q-item-label>
            <q-item-label caption class="text-grey-4"
              >Tattiche ABCDE & Score 85%</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/calendar"
          exact
          active-class="bg-slate-800 text-primary border-l-4 border-primary"
          class="rounded-borders q-my-xs"
        >
          <q-item-section avatar>
            <q-icon name="calendar_month" color="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold"
              >Calendario Mesi</q-item-label
            >
            <q-item-label caption class="text-grey-4"
              >Mese Singolo & Turni</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/clan"
          exact
          active-class="bg-slate-800 text-primary border-l-4 border-primary"
          class="rounded-borders q-my-xs"
        >
          <q-item-section avatar>
            <q-icon name="flag" color="emerald-4" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold"
              >Obiettivi & Черепаха 🐢</q-item-label
            >
            <q-item-label caption class="text-grey-4"
              >3 Fasi, Clan & Vuoto Ma</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md bg-slate-800" />

        <!-- PANNELLO DI CONTROLLO SCORE TRIMESTRE -->
        <div class="q-px-sm q-mb-md">
          <q-card
            flat
            class="bg-slate-800 border border-slate-700 q-pa-sm rounded-borders"
          >
            <div class="text-caption text-weight-bold text-accent">
              CICLO ATTIVO 12-WEEK YEAR
            </div>
            <div class="row justify-between items-center text-caption q-my-xs">
              <span class="text-grey-4">Soglia Efficacia:</span>
              <span class="text-weight-bold text-positive">≥ 85%</span>
            </div>
            <div class="row justify-between items-center text-caption q-my-xs">
              <span class="text-grey-4">Score Ciclo Totale:</span>
              <span class="text-weight-bold text-primary"
                >{{ store.overallQuarterScore }}%</span
              >
            </div>
            <div class="row justify-between items-center text-caption q-my-xs">
              <span class="text-grey-4">Stato Agenda:</span>
              <span class="text-weight-bold text-white"
                >{{ store.plan.tactics.length }} Tattiche attive</span
              >
            </div>
          </q-card>
        </div>

        <q-separator class="q-my-md bg-slate-800" />

        <!-- SEZIONE ROBOT SALVADANAIO & CLOUD FIRESTORE -->
        <div class="q-px-sm q-mb-md">
          <q-card
            flat
            class="bg-slate-800 border border-slate-700 q-pa-sm rounded-borders"
          >
            <div class="row items-center justify-between q-mb-xs">
              <div
                class="text-caption text-weight-bold text-info row items-center"
              >
                <q-icon name="cloud_sync" class="q-mr-xs" size="18px" />
                ROBOT SALVADANAIO (CLOUD)
              </div>
              <q-badge
                :color="
                  store.cloudSyncStatus === 'synced'
                    ? 'positive'
                    : store.cloudSyncStatus === 'syncing'
                      ? 'warning'
                      : store.cloudSyncStatus === 'error'
                        ? 'negative'
                        : 'grey-7'
                "
                :label="
                  store.cloudSyncStatus === 'synced'
                    ? 'Sincronizzato'
                    : store.cloudSyncStatus === 'syncing'
                      ? 'Sincronizzo...'
                      : store.cloudSyncStatus === 'error'
                        ? 'Errore'
                        : 'Locale'
                "
                size="xs"
              />
            </div>

            <div class="text-caption text-grey-4 q-mb-sm">
              Firestore DB • project: <strong>week-year-12</strong>
            </div>

            <div class="row q-gutter-x-xs q-mb-xs">
              <q-btn
                unelevated
                dense
                size="sm"
                color="primary"
                icon="cloud_upload"
                label="Salva Cloud"
                class="col text-weight-bold"
                no-caps
                :loading="store.cloudSyncStatus === 'syncing'"
                @click="store.syncToCloud"
              />
              <q-btn
                outline
                dense
                size="sm"
                color="info"
                icon="cloud_download"
                label="Scarica"
                class="col text-weight-bold"
                no-caps
                :loading="store.cloudSyncStatus === 'syncing'"
                @click="store.pullFromCloud"
              />
            </div>

            <q-btn
              flat
              dense
              size="xs"
              color="amber-4"
              icon="save"
              label="Crea Snapshot Backup Cloud"
              class="full-width q-mt-xs text-weight-medium"
              no-caps
              @click="store.createCloudBackup"
            />
          </q-card>
        </div>

        <q-separator class="q-my-md bg-slate-800" />

        <!-- AZIONE TABULA RASA (RESET AGENDA BIANCA) -->
        <q-item
          clickable
          v-ripple
          @click="confirmBlankReset"
          class="text-negative rounded-borders"
        >
          <q-item-section avatar>
            <q-icon name="delete_sweep" color="negative" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Azzera Agenda</q-item-label>
            <q-item-label caption class="text-grey-5"
              >Tabula Rasa (pagina bianca)</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>

      <div
        class="absolute-bottom q-pa-md text-center text-caption text-grey-5 border-t border-slate-800"
      >
        12WY Operational Hub • Edizione Marziale
      </div>
    </q-drawer>

    <!-- MOBILE-FIRST BOTTOM TABS (QFOOTER FISSO IN BASSO) -->
    <q-footer elevated class="martial-bottom-footer no-print">
      <q-tabs
        dense
        align="justify"
        indicator-color="transparent"
        class="martial-tabs"
      >
        <q-route-tab to="/today" exact icon="today" label="Oggi" />
        <q-route-tab to="/" exact icon="view_week" label="Settimana" />
        <q-route-tab
          to="/calendar"
          exact
          icon="calendar_month"
          label="Calendario"
        />
        <q-route-tab to="/clan" exact icon="flag" label="Obiettivi & 🐢" />
      </q-tabs>
    </q-footer>

    <!-- MAIN PAGE CONTAINER -->
    <q-page-container>
      <!-- PRINT HEADER ESCLUSIVO PER FOGLIO A4 -->
      <div class="print-only q-pa-md print-header">
        <div class="row justify-between items-center">
          <div>
            <h1 class="text-h5 text-weight-bold q-my-none">
              12-WEEK YEAR OPERATIONAL HUB — SCHEDA ESECUTIVA
            </h1>
            <div class="text-subtitle2 text-grey-8">
              {{ store.selectedWeekInfo.label }} | Metodo 12WY (Target Minimo:
              85%)
            </div>
          </div>
          <div class="text-right">
            <div class="text-h6 text-weight-bold">
              WAM Score: {{ store.selectedWeekScore.score }}%
            </div>
            <div class="text-caption">
              Data Stampa: {{ store.formattedToday }}
            </div>
          </div>
        </div>
      </div>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.score-badge-high {
  background-color: #065f46 !important;
  color: #34d399 !important;
  border: 1px solid #10b981;
}

.score-badge-low {
  background-color: #78350f !important;
  color: #fbbf24 !important;
  border: 1px solid #f59e0b;
}

.border-l-4 {
  border-left-width: 4px !important;
  border-left-style: solid;
}
</style>
