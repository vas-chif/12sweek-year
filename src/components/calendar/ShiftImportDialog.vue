<script setup lang="ts">
/**
 * @file ShiftImportDialog.vue
 * @description Dialog di caricamento ed importazione file JSON turni ospedalieri sanitari
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Caricamento diretto file .json (drag & drop o file picker) + opzione manuale
 * - Anteprima in tempo reale dei turni (M/P/N/S/R/A) e intervallo date
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type HospitalShift,
  SHIFT_DETAILS,
  normalizeDateToIso,
  normalizeShiftCode
} from "@/types/twelveWeek";

interface ImportedEventPayload {
  count: number;
  month?: number | undefined;
  year?: number | undefined;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "imported", payload: ImportedEventPayload): void;
}>();

const store = useTwelveWeekStore();
const $q = useQuasar();

// ── Stato Locale ───────────────────────────────────────────────────────────────
const activeTab = ref<"file" | "text">("file");
const selectedFile = ref<File | null>(null);
const jsonRawText = ref<string>("");
const isDragging = ref<boolean>(false);
const parsingError = ref<string | null>(null);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
});

interface ParsedSummary {
  total: number;
  startDate: string;
  endDate: string;
  counts: Record<HospitalShift, number>;
}

const parsedSummary = computed<ParsedSummary | null>(() => {
  const text = jsonRawText.value.trim();
  if (!text) return null;

  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data) || data.length === 0) return null;

    const counts: Record<HospitalShift, number> = {
      M: 0,
      P: 0,
      N: 0,
      S: 0,
      R: 0,
      A: 0
    };

    const dates: string[] = [];

    for (const item of data) {
      if (
        typeof item === "object" &&
        item !== null &&
        "date" in item &&
        "shift" in item
      ) {
        const iso = normalizeDateToIso(String(item.date));
        const s = normalizeShiftCode(String(item.shift));
        counts[s] = (counts[s] ?? 0) + 1;
        dates.push(iso);
      }
    }

    dates.sort();
    const startDate = dates[0] ?? "";
    const endDate = dates[dates.length - 1] ?? "";

    return {
      total: dates.length,
      startDate,
      endDate,
      counts
    };
  } catch {
    return null;
  }
});

function handleFileChange(file: File | null): void {
  if (!file) {
    selectedFile.value = null;
    jsonRawText.value = "";
    parsingError.value = null;
    return;
  }

  selectedFile.value = file;
  parsingError.value = null;

  const reader = new FileReader();
  reader.onload = e => {
    const content = e.target?.result;
    if (typeof content === "string") {
      jsonRawText.value = content;
      validateCurrentJson(content);
    }
  };
  reader.onerror = () => {
    parsingError.value = "Impossibile leggere il file selezionato.";
  };
  reader.readAsText(file);
} /*end handleFileChange*/

function handleDrop(e: DragEvent): void {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file && (file.name.endsWith(".json") || file.type.includes("json"))) {
      handleFileChange(file);
    } else {
      $q.notify({
        type: "warning",
        message: "Per favore rilascia un file con estensione .json",
        position: "top-right"
      });
    }
  }
} /*end handleDrop*/

function validateCurrentJson(text: string): boolean {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      parsingError.value =
        "Il JSON deve essere un array di oggetti turni: [ { date, shift, note } ]";
      return false;
    }
    if (parsed.length === 0) {
      parsingError.value = "L'array JSON è vuoto.";
      return false;
    }
    parsingError.value = null;
    return true;
  } catch (err) {
    parsingError.value =
      err instanceof Error ? err.message : "Sintassi JSON non valida";
    return false;
  }
} /*end validateCurrentJson*/

function onRawTextChange(val: string | number | null): void {
  validateCurrentJson(typeof val === "string" ? val : "");
} /*end onRawTextChange*/

function confirmImport(): void {
  if (!jsonRawText.value.trim()) {
    $q.notify({
      type: "warning",
      message: "Nessun dato da importare. Seleziona un file JSON.",
      position: "top-right"
    });
    return;
  }

  const result = store.importShiftsJSON(jsonRawText.value);
  if (result.success) {
    emit("imported", {
      count: result.count,
      month: result.month,
      year: result.year
    });
    isOpen.value = false;
    resetForm();
  }
} /*end confirmImport*/

function resetForm(): void {
  selectedFile.value = null;
  jsonRawText.value = "";
  parsingError.value = null;
  activeTab.value = "file";
} /*end resetForm*/

function pasteSampleJson(): void {
  const sample = [
    { date: "01/10/2026", shift: "N", note: "" },
    { date: "02/10/2026", shift: "S", note: "Smonto notte" },
    { date: "03/10/2026", shift: "R", note: "Riposo" },
    { date: "04/10/2026", shift: "M", note: "Mattina" },
    { date: "05/10/2026", shift: "A", note: "Ferie / Assenza" }
  ];
  jsonRawText.value = JSON.stringify(sample, null, 2);
  validateCurrentJson(jsonRawText.value);
} /*end pasteSampleJson*/
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="bg-slate-900 text-white border border-slate-700 dialog-card">
      <!-- HEADER -->
      <q-card-section
        class="row items-center justify-between border-b border-slate-800 q-py-sm"
      >
        <div class="text-subtitle1 text-weight-bold row items-center">
          <q-icon name="upload_file" color="info" size="24px" class="q-mr-sm" />
          Importa Turni Ospedalieri (File JSON)
        </div>
        <q-btn flat round dense icon="close" v-close-popup @click="resetForm" />
      </q-card-section>

      <!-- TABS METODO CARICAMENTO -->
      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        class="bg-slate-950 text-grey-4 border-b border-slate-800"
      >
        <q-tab name="file" icon="attach_file" label="Carica File (.json)" />
        <q-tab name="text" icon="code" label="Incolla Testo JSON" />
      </q-tabs>

      <q-card-section class="q-pa-md q-gutter-y-md">
        <!-- MODALITÀ 1: CARICA FILE CON DRAG & DROP -->
        <div v-if="activeTab === 'file'">
          <div
            class="dropzone text-center q-pa-lg cursor-pointer rounded-borders"
            :class="{ dragging: isDragging, 'has-file': !!selectedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <q-file
              v-model="selectedFile"
              outlined
              dense
              dark
              accept=".json,application/json"
              label="Seleziona il file turni scaricato (.json)"
              class="q-mb-sm bg-slate-950"
              @update:model-value="handleFileChange"
            >
              <template #prepend>
                <q-icon name="folder_open" color="primary" />
              </template>
              <template #append v-if="selectedFile">
                <q-icon
                  name="close"
                  class="cursor-pointer"
                  @click.stop="handleFileChange(null)"
                />
              </template>
            </q-file>

            <div class="drop-hint text-grey-4 q-mt-xs">
              <q-icon
                name="cloud_upload"
                size="32px"
                color="sky-5"
                class="q-mb-xs block q-mx-auto"
              />
              <span
                >Trascina qui il file JSON dei turni oppure sfoglia le
                cartelle</span
              >
            </div>
          </div>
        </div>

        <!-- MODALITÀ 2: INCOLLA TESTO MANUALE -->
        <div v-else>
          <q-input
            v-model="jsonRawText"
            type="textarea"
            outlined
            dark
            rows="6"
            placeholder='[ { "date": "01/11/2026", "shift": "P", "note": "" } ]'
            class="bg-slate-950 font-mono text-caption"
            @update:model-value="onRawTextChange"
          />
          <div class="row justify-between items-center q-mt-xs">
            <span class="text-caption text-grey-5"
              >Supporta date sia "DD/MM/YYYY" che "YYYY-MM-DD"</span
            >
            <q-btn
              flat
              size="sm"
              color="accent"
              label="Incolla Esempio"
              no-caps
              @click="pasteSampleJson"
            />
          </div>
        </div>

        <!-- ERRORE DI PARSING (SE PRESENTE) -->
        <div
          v-if="parsingError"
          class="bg-negative-10 border border-negative q-pa-sm rounded-borders text-negative text-caption row items-center"
        >
          <q-icon name="error_outline" size="18px" class="q-mr-xs" />
          <span>{{ parsingError }}</span>
        </div>

        <!-- ANTEPRIMA STATISTICHE TURNI RILEVATI -->
        <div
          v-if="parsedSummary"
          class="bg-slate-950 border border-slate-800 q-pa-sm rounded-borders preview-section"
        >
          <div class="row justify-between items-center q-mb-xs">
            <div
              class="text-caption text-weight-bold text-sky-4 row items-center"
            >
              <q-icon
                name="check_circle"
                color="positive"
                size="16px"
                class="q-mr-xs"
              />
              <span>{{ parsedSummary.total }} Turni Rilevati con Successo</span>
            </div>
            <div class="text-caption text-grey-4">
              Periodo: <strong>{{ parsedSummary.startDate }}</strong> ➔
              <strong>{{ parsedSummary.endDate }}</strong>
            </div>
          </div>

          <div class="row q-gutter-xs q-mt-xs">
            <q-chip
              v-for="s in ['M', 'P', 'N', 'S', 'R', 'A'] as HospitalShift[]"
              :key="s"
              size="sm"
              :color="SHIFT_DETAILS[s].color"
              text-color="white"
              :icon="SHIFT_DETAILS[s].icon"
              class="q-ma-none text-weight-bold"
            >
              {{ s }}: {{ parsedSummary.counts[s] ?? 0 }}
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <!-- AZIONI FOOTER -->
      <q-card-actions align="right" class="q-pa-md border-t border-slate-800">
        <q-btn
          flat
          label="Annulla"
          color="grey-4"
          v-close-popup
          @click="resetForm"
        />
        <q-btn
          unelevated
          color="primary"
          label="Carica e Imposta Turni nel Calendario"
          icon="check"
          class="text-weight-bold"
          :disable="!parsedSummary || !!parsingError"
          @click="confirmImport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.dialog-card {
  width: 100%;
  max-width: 540px;
  border-radius: 12px;
}

.dropzone {
  border: 2px dashed #334155;
  background: rgba(15, 23, 42, 0.6);
  transition: all 0.2s ease;

  &.dragging {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
  }

  &.has-file {
    border-color: #10b981;
  }
}

.drop-hint {
  font-size: 12px;
}

.preview-section {
  border-radius: 8px;
}
</style>
