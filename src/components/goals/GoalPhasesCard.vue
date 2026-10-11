<script setup lang="ts">
/**
 * @file GoalPhasesCard.vue
 * @description Card interattiva per Macro Obiettivo con supporto per Fasi / Milestone a schede
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Renderizza le fasi dinamiche dell'obiettivo con design Dark Slate a schede (Immagine 2)
 * - Selezione fase attiva reattiva e salvataggio nello store
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { computed } from "vue";
import { useQuasar } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import {
  type LifeGoal,
  type GoalPhase,
  getGoalCategoryMeta
} from "@/types/twelveWeek";

const props = defineProps<{
  goal: LifeGoal;
}>();

const emit = defineEmits<{
  (e: "edit", goal: LifeGoal): void;
}>();

const store = useTwelveWeekStore();
const $q = useQuasar();

// Categoria metadati visivi
const categoryMeta = computed(() => {
  return getGoalCategoryMeta(props.goal.category);
});

// Fasi dell'obiettivo
const phases = computed<GoalPhase[]>(() => {
  return props.goal.phases || [];
});

// Fase attiva
const currentPhase = computed<GoalPhase | null>(() => {
  if (phases.value.length === 0) return null;
  const found = phases.value.find(p => p.id === props.goal.activePhaseId);
  return found ?? phases.value[0] ?? null;
});

function handleSelectPhase(phaseId: string): void {
  store.setGoalActivePhase(props.goal.id, phaseId);
} /*end handleSelectPhase*/

function handleDelete(): void {
  $q.dialog({
    title: "Conferma Eliminazione",
    message: `Eliminare il macro-obiettivo "${props.goal.title}"?`,
    cancel: true,
    dark: true
  }).onOk(() => {
    store.deleteLifeGoal(props.goal.id);
  });
} /*end handleDelete*/
</script>

<template>
  <q-card
    flat
    class="glass-panel q-pa-md border border-slate-700 rounded-borders q-mb-md"
  >
    <!-- HEADER OBIETTIVO: TITOLO, CATEGORIA & TARGET ATTIVO -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="row items-center q-gutter-x-sm">
        <q-chip
          dense
          size="sm"
          :color="categoryMeta.color"
          :icon="categoryMeta.icon"
          text-color="white"
          class="text-weight-bold"
        >
          {{ categoryMeta.label }}
        </q-chip>
        <span class="text-subtitle1 text-weight-bolder text-white">
          {{ goal.title }}
        </span>
      </div>

      <div class="row items-center q-gutter-x-xs">
        <q-badge
          v-if="currentPhase && currentPhase.target"
          color="primary"
          text-color="white"
          class="text-weight-bold q-px-sm q-py-xs"
        >
          Target: {{ currentPhase.target }}
        </q-badge>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="edit"
          color="grey-4"
          @click="emit('edit', goal)"
        >
          <q-tooltip>Modifica obiettivo e fasi</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="delete"
          color="negative"
          @click="handleDelete"
        >
          <q-tooltip>Elimina obiettivo</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- INFORMAZIONI GENERALI (SCADENZA, IMPEGNO ORARIO) -->
    <div
      class="row items-center justify-between text-caption text-grey-4 q-mb-sm"
    >
      <div class="row items-center q-gutter-x-md">
        <span
          v-if="goal.deadline"
          class="row items-center q-gutter-x-xs text-amber-4"
        >
          <q-icon name="event" size="14px" />
          <span
            >Scadenza: <strong>{{ goal.deadline }}</strong></span
          >
        </span>
        <span v-if="goal.targetDailyHours > 0">
          ⏱️ Impegno: {{ goal.targetDailyHours }}h / giorno
        </span>
        <span v-if="goal.totalTargetHours > 0">
          Monte ore: {{ goal.totalTargetHours }}h tot.
        </span>
      </div>
      <div v-if="goal.notes" class="text-italic text-grey-5">
        {{ goal.notes }}
      </div>
    </div>

    <!-- SEZIONE FASI (SE PRESENTI, COME IN IMMAGINE 2) -->
    <div v-if="phases.length > 0" class="q-mt-sm">
      <!-- PULSANTI SELEZIONE FASI -->
      <div class="row q-gutter-xs q-mb-md">
        <q-btn
          v-for="phase in phases"
          :key="phase.id"
          unelevated
          :color="
            currentPhase && currentPhase.id === phase.id
              ? 'primary'
              : 'slate-800'
          "
          :text-color="
            currentPhase && currentPhase.id === phase.id ? 'white' : 'grey-4'
          "
          class="col text-weight-bold phase-btn"
          size="sm"
          no-caps
          @click="handleSelectPhase(phase.id)"
        >
          <div class="text-center">
            <div class="text-weight-bold">{{ phase.name }}</div>
            <div
              v-if="phase.target"
              class="text-caption"
              style="font-size: 10px"
            >
              {{ phase.target }}
            </div>
          </div>
        </q-btn>
      </div>

      <!-- DETTAGLIO FASE SELEZIONATA -->
      <div
        v-if="currentPhase"
        class="bg-slate-800 q-pa-md rounded-borders border border-slate-700"
      >
        <div class="text-subtitle2 text-weight-bold text-accent q-mb-xs">
          {{ currentPhase.name
          }}<span v-if="currentPhase.subtitle"
            >: {{ currentPhase.subtitle }}</span
          >
        </div>
        <div
          v-if="currentPhase.description"
          class="text-body2 text-grey-3 q-mb-sm"
        >
          {{ currentPhase.description }}
        </div>
        <div
          v-if="currentPhase.rules && currentPhase.rules.length > 0"
          class="q-gutter-y-xs"
        >
          <div
            v-for="(rule, rIdx) in currentPhase.rules"
            :key="rIdx"
            class="text-caption text-grey-4"
          >
            • {{ rule }}
          </div>
        </div>
      </div>
    </div>

    <!-- NESSUNA FASE ANCORA: INVITO ALL'AGGIUNTA -->
    <div
      v-else
      class="bg-slate-800 q-pa-sm rounded-borders border border-dashed border-slate-700 row items-center justify-between"
    >
      <div class="text-caption text-grey-4">
        Nessuna fase di avanzamento configurata per questo obiettivo.
      </div>
      <q-btn
        flat
        dense
        size="sm"
        color="primary"
        icon="add"
        label="Aggiungi Fasi"
        no-caps
        @click="emit('edit', goal)"
      />
    </div>
  </q-card>
</template>

<style scoped lang="scss">
.phase-btn {
  min-height: 42px;
  border-radius: 6px;
  transition: all 0.2s ease;
}
</style>
