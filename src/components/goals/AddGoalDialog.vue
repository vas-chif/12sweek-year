<script setup lang="ts">
/**
 * @file AddGoalDialog.vue
 * @description Dialog di creazione/modifica Macro Obiettivo Trimestrale con categorie universali e fasi dinamiche
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Supporto per aggiunta e gestione fasi/milestone dinamiche (Immagine 2)
 * - Auto-apprendimento categorie personalizzate
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, reactive, watch } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type LifeGoal,
  type GoalPhase,
  LIFE_GOAL_CATEGORY_DETAILS
} from "@/types/twelveWeek";

interface CategoryOption {
  label: string;
  value: string;
  icon: string;
}

interface FormPhase {
  id: string;
  name: string;
  target: string;
  subtitle: string;
  description: string;
  rulesText: string;
}

const props = defineProps<{
  modelValue: boolean;
  goalToEdit?: LifeGoal | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const store = useTwelveWeekStore();
const $q = useQuasar();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
});

// ── Stato Form ─────────────────────────────────────────────────────────────────
const form = reactive({
  category: "business",
  title: "",
  deadline: "",
  targetDailyHours: 1.0,
  totalTargetHours: 0,
  notes: ""
});

const formPhases = ref<FormPhase[]>([]);

// ── Categorie Disponibili (Base + Custom Apprese) ───────────────────────────────
const categoryOptions = computed<CategoryOption[]>(() => {
  const baseOptions: CategoryOption[] = Object.entries(
    LIFE_GOAL_CATEGORY_DETAILS
  ).map(([key, val]) => ({
    label: val.label,
    value: key,
    icon: val.icon
  }));

  const customOptions: CategoryOption[] = store.customGoalCategories.map(
    cat => ({
      label: cat,
      value: cat,
      icon: "stars"
    })
  );

  return [...baseOptions, ...customOptions];
});

function handleFilterCategory(
  _val: string,
  update: (callback: () => void) => void
): void {
  update(() => {});
} /*end handleFilterCategory*/

function handleCreateCustomCategory(
  val: string,
  done: (item: CategoryOption, mode: "add-unique") => void
): void {
  const trimmed = val.trim();
  if (trimmed) {
    store.addCustomGoalCategory(trimmed);
    const newOpt: CategoryOption = {
      label: trimmed,
      value: trimmed,
      icon: "stars"
    };
    done(newOpt, "add-unique");
    $q.notify({
      type: "positive",
      message: `Nuova area di vita appresa: "${trimmed}"`,
      position: "top-right",
      timeout: 1500
    });
  }
} /*end handleCreateCustomCategory*/

function addPhase(): void {
  const phaseIndex = formPhases.value.length + 1;
  formPhases.value.push({
    id: `phase-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `Fase ${phaseIndex}: `,
    target: "",
    subtitle: "",
    description: "",
    rulesText: ""
  });
} /*end addPhase*/

function removePhase(index: number): void {
  formPhases.value.splice(index, 1);
} /*end removePhase*/

function handleSubmit(): void {
  if (!form.title.trim()) {
    $q.notify({
      type: "warning",
      message: "Inserisci un titolo per il macro-obiettivo",
      position: "top-right"
    });
    return;
  }

  const mappedPhases: GoalPhase[] = formPhases.value
    .filter(p => p.name.trim().length > 0)
    .map(p => ({
      id: p.id,
      name: p.name.trim(),
      target: p.target.trim(),
      subtitle: p.subtitle.trim(),
      description: p.description.trim(),
      rules: p.rulesText
        .split("\n")
        .map(r => r.trim())
        .filter(r => r.length > 0)
    }));

  if (props.goalToEdit) {
    store.updateLifeGoal(props.goalToEdit.id, {
      category: form.category,
      title: form.title.trim(),
      deadline: form.deadline.trim(),
      targetDailyHours: Number(form.targetDailyHours) || 0,
      totalTargetHours: Number(form.totalTargetHours) || 0,
      notes: form.notes.trim(),
      phases: mappedPhases,
      activePhaseId: mappedPhases[0]?.id || ""
    });
  } else {
    store.addLifeGoal({
      category: form.category,
      title: form.title.trim(),
      deadline: form.deadline.trim(),
      targetDailyHours: Number(form.targetDailyHours) || 0,
      totalTargetHours: Number(form.totalTargetHours) || 0,
      notes: form.notes.trim(),
      phases: mappedPhases,
      activePhaseId: mappedPhases[0]?.id || ""
    });
  }

  resetForm();
  isOpen.value = false;
} /*end handleSubmit*/

function resetForm(): void {
  if (props.goalToEdit) {
    form.category = props.goalToEdit.category;
    form.title = props.goalToEdit.title;
    form.deadline = props.goalToEdit.deadline || "";
    form.targetDailyHours = props.goalToEdit.targetDailyHours || 1.0;
    form.totalTargetHours = props.goalToEdit.totalTargetHours || 0;
    form.notes = props.goalToEdit.notes || "";
    formPhases.value = (props.goalToEdit.phases || []).map(p => ({
      id: p.id,
      name: p.name,
      target: p.target || "",
      subtitle: p.subtitle || "",
      description: p.description || "",
      rulesText: (p.rules || []).join("\n")
    }));
  } else {
    form.category = "business";
    form.title = "";
    form.deadline = "";
    form.targetDailyHours = 1.0;
    form.totalTargetHours = 0;
    form.notes = "";
    formPhases.value = [];
  }
} /*end resetForm*/

watch(
  () => props.modelValue,
  val => {
    if (val) {
      resetForm();
    }
  }
);
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card
      class="bg-slate-900 text-white border border-slate-700 dialog-card"
      style="
        width: 95vw;
        max-width: 600px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
      "
    >
      <q-card-section
        class="row items-center justify-between border-b border-slate-800 q-py-sm"
      >
        <div class="text-subtitle1 text-weight-bold row items-center">
          <q-icon name="flag" color="primary" size="22px" class="q-mr-sm" />
          {{
            goalToEdit
              ? "Modifica Macro Obiettivo"
              : "Nuovo Macro Obiettivo Trimestrale"
          }}
        </div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-gutter-y-md q-pt-md scroll" style="flex: 1">
        <!-- SELETTORE AREA DI VITA -->
        <div>
          <q-select
            v-model="form.category"
            :options="categoryOptions"
            emit-value
            map-options
            use-input
            new-value-mode="add-unique"
            label="Area di Vita / Categoria"
            hint="Scegli un'area o digita una nuova categoria personalizzata e premi Invio"
            outlined
            dense
            dark
            class="bg-slate-800"
            @filter="handleFilterCategory"
            @new-value="handleCreateCustomCategory"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon || 'stars'" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- TITOLO OBIETTIVO -->
        <q-input
          v-model="form.title"
          label="Titolo Obiettivo"
          placeholder="Es. Sviluppo Progetto, Forma Fisica, Risparmio, Famiglia..."
          outlined
          dense
          dark
          class="bg-slate-800"
          :rules="[val => !!val || 'Titolo obbligatorio']"
        />

        <!-- DATA SCADENZA -->
        <q-input
          v-model="form.deadline"
          label="Data Scadenza / Deadline (opzionale)"
          placeholder="YYYY-MM-DD"
          outlined
          dense
          dark
          class="bg-slate-800"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer text-grey-4" />
          </template>
        </q-input>

        <!-- ORE PREVISTE -->
        <!-- ORE PREVISTE -->
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model.number="form.targetDailyHours"
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
              v-model.number="form.totalTargetHours"
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

        <!-- NOTE CONTESTO -->
        <q-input
          v-model="form.notes"
          label="Note operative / Contesto (opzionale)"
          outlined
          dense
          dark
          type="textarea"
          rows="2"
          class="bg-slate-800"
        />

        <!-- SEZIONE GESTIONE FASI / MILESTONE (IMMAGINE 2) -->
        <div class="border-t border-slate-800 q-pt-sm">
          <div class="row items-center justify-between q-mb-sm">
            <div
              class="text-subtitle2 text-weight-bold text-accent row items-center"
            >
              <q-icon name="view_timeline" class="q-mr-xs" size="18px" />
              Fasi di Avanzamento / Milestone (Opzionali)
            </div>
            <q-btn
              flat
              dense
              size="sm"
              color="primary"
              icon="add"
              label="Aggiungi Fase"
              no-caps
              @click="addPhase"
            />
          </div>

          <div
            v-if="formPhases.length === 0"
            class="text-caption text-grey-5 q-mb-xs"
          >
            Nessuna fase definita. Clicca su "+ Aggiungi Fase" per strutturare
            l'obiettivo a step/fasi come nell'Immagine 2.
          </div>

          <!-- LISTA SCHEDE FASI -->
          <div
            v-for="(phase, pIdx) in formPhases"
            :key="phase.id"
            class="bg-slate-800 q-pa-sm rounded-borders q-mb-sm border border-slate-700"
          >
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption text-weight-bold text-primary"
                >Fase {{ pIdx + 1 }}</span
              >
              <q-btn
                flat
                round
                dense
                size="xs"
                icon="close"
                color="negative"
                @click="removePhase(pIdx)"
              />
            </div>

            <div class="row q-col-gutter-xs q-mb-xs">
              <div class="col-7">
                <q-input
                  v-model="phase.name"
                  label="Nome Fase"
                  placeholder="es. Fase 1: Taglio Grasso"
                  dense
                  outlined
                  dark
                  class="bg-slate-900"
                />
              </div>
              <div class="col-5">
                <q-input
                  v-model="phase.target"
                  label="Target Fase"
                  placeholder="es. 70-71 kg o 10k MRR"
                  dense
                  outlined
                  dark
                  class="bg-slate-900"
                />
              </div>
            </div>

            <div class="q-mb-xs">
              <q-input
                v-model="phase.description"
                label="Descrizione Fase"
                placeholder="Spiega l'obiettivo di questo step..."
                dense
                outlined
                dark
                class="bg-slate-900"
              />
            </div>

            <div>
              <q-input
                v-model="phase.rulesText"
                label="Regole / Azioni (una per riga)"
                placeholder="es. Zero zuccheri raffinati&#10;4 allenamenti"
                type="textarea"
                rows="2"
                dense
                outlined
                dark
                class="bg-slate-900"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md border-t border-slate-800 bg-slate-900"
        style="flex-shrink: 0"
      >
        <q-btn flat label="Annulla" color="grey-4" v-close-popup />
        <q-btn
          unelevated
          :label="goalToEdit ? 'Aggiorna Obiettivo' : 'Salva Obiettivo'"
          color="primary"
          class="text-weight-bold"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.dialog-card {
  border-radius: 12px;
}
</style>
