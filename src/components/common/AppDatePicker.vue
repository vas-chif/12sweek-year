<script setup lang="ts">
/**
 * @file AppDatePicker.vue
 * @description Selettore Data Riutilizzabile (YYYY-MM-DD) con popup QDate in Dark Theme
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Componente comune universale per selezione data ISO (YYYY-MM-DD)
 * - Supporto per pulsante Oggi, Azzera e Chiudi
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { computed } from "vue";

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  outlined?: boolean;
  dense?: boolean;
  dark?: boolean;
  clearable?: boolean;
  disable?: boolean;
  readonly?: boolean;
  hint?: string;
  rules?: Array<(val: string) => boolean | string>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: "Data",
  placeholder: "YYYY-MM-DD",
  outlined: true,
  dense: true,
  dark: true,
  clearable: true,
  disable: false,
  readonly: false,
  hint: "",
  rules: () => []
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const dateValue = computed<string>({
  get: () => props.modelValue || "",
  set: (val: string) => emit("update:modelValue", val || "")
});

function handleSetToday(): void {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  emit("update:modelValue", `${yyyy}-${mm}-${dd}`);
} /*end handleSetToday*/

function handleClear(): void {
  emit("update:modelValue", "");
} /*end handleClear*/
</script>

<template>
  <q-input
    v-model="dateValue"
    :label="label"
    :placeholder="placeholder"
    :outlined="outlined"
    :dense="dense"
    :dark="dark"
    :disable="disable"
    :readonly="readonly"
    :hint="hint"
    :rules="rules"
    class="app-date-picker"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer text-grey-4">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="dateValue"
            mask="YYYY-MM-DD"
            dark
            color="primary"
            today-btn
          >
            <div
              class="row items-center justify-between q-pa-sm border-t border-slate-700 bg-slate-900"
            >
              <div class="row q-gutter-x-xs">
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Oggi"
                  color="accent"
                  @click="handleSetToday"
                />
                <q-btn
                  v-if="clearable"
                  flat
                  dense
                  size="sm"
                  label="Azzera"
                  color="grey-4"
                  @click="handleClear"
                />
              </div>
              <q-btn
                v-close-popup
                flat
                dense
                size="sm"
                label="Chiudi"
                color="primary"
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<style scoped lang="scss">
.app-date-picker {
  border-radius: 8px;
}
</style>
