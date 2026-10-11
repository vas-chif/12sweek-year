<script setup lang="ts">
/**
 * @file AddGoalDialog.vue
 * @description Dialog di creazione Macro Obiettivo Trimestrale con categorie universali e auto-apprendimento
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Categorie di vita universali e neutre
 * - Auto-apprendimento categorie personalizzate digitate dall'utente
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, reactive, watch } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import { LIFE_GOAL_CATEGORY_DETAILS } from "@/types/twelveWeek";

interface CategoryOption {
  label: string;
  value: string;
  icon: string;
}

const props = defineProps<{
  modelValue: boolean;
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
  val: string,
  update: (callback: () => void) => void
): void {
  update(() => {
    // Il filtro è gestito reattivamente da categoryOptions
  });
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

function handleSubmit(): void {
  if (!form.title.trim()) {
    $q.notify({
      type: "warning",
      message: "Inserisci un titolo per il macro-obiettivo",
      position: "top-right"
    });
    return;
  }

  store.addLifeGoal({
    category: form.category,
    title: form.title.trim(),
    deadline: form.deadline.trim(),
    targetDailyHours: Number(form.targetDailyHours) || 0,
    totalTargetHours: Number(form.totalTargetHours) || 0,
    notes: form.notes.trim()
  });

  resetForm();
  isOpen.value = false;
} /*end handleSubmit*/

function resetForm(): void {
  form.category = "business";
  form.title = "";
  form.deadline = "";
  form.targetDailyHours = 1.0;
  form.totalTargetHours = 0;
  form.notes = "";
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
      style="min-width: 460px; max-width: 520px"
    >
      <q-card-section
        class="row items-center justify-between border-b border-slate-800 q-py-sm"
      >
        <div class="text-subtitle1 text-weight-bold row items-center">
          <q-icon name="flag" color="primary" size="22px" class="q-mr-sm" />
          Nuovo Macro Obiettivo Trimestrale
        </div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-gutter-y-md q-pt-md">
        <!-- SELETTORE AREA DI VITA CON AUTO-APPRENDIMENTO -->
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
          placeholder="Es. Lancio nuovo progetto, Certificazione, Risparmio..."
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
          placeholder="YYYY-MM-DD (es. 2026-12-31)"
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
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md border-t border-slate-800">
        <q-btn flat label="Annulla" color="grey-4" v-close-popup />
        <q-btn
          unelevated
          label="Salva Obiettivo"
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
