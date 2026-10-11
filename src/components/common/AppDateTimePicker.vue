<script setup lang="ts">
/**
 * @file AppDateTimePicker.vue
 * @description Selettore Data & Ora Riutilizzabile (YYYY-MM-DD HH:mm) con popup QDate & QTime
 * @author Vasile Chifeac
 * @created 2026-10-11
 * @notes
 * - §4.1 AGENTS.md: <script setup lang="ts"> before <template>
 * - Componente comune separato per data e orario (formato 24h)
 * - Schede di navigazione rapida Data / Ora
 */

// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed } from "vue";

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
  label: "Data e Ora",
  placeholder: "YYYY-MM-DD HH:mm",
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

const activeTab = ref<"date" | "time">("date");

const dateTimeValue = computed<string>({
  get: () => props.modelValue || "",
  set: (val: string) => emit("update:modelValue", val || "")
});

function handleSetNow(): void {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  emit("update:modelValue", `${yyyy}-${mm}-${dd} ${hh}:${min}`);
} /*end handleSetNow*/

function handleClear(): void {
  emit("update:modelValue", "");
} /*end handleClear*/
</script>

<template>
  <q-input
    v-model="dateTimeValue"
    :label="label"
    :placeholder="placeholder"
    :outlined="outlined"
    :dense="dense"
    :dark="dark"
    :disable="disable"
    :readonly="readonly"
    :hint="hint"
    :rules="rules"
    class="app-datetime-picker"
  >
    <template #append>
      <div class="row items-center q-gutter-x-xs">
        <q-icon name="event" class="cursor-pointer text-grey-4">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <div class="bg-slate-900 border border-slate-700 rounded-borders">
              <q-tabs
                v-model="activeTab"
                dense
                class="text-grey-4 bg-slate-800"
                active-color="primary"
                indicator-color="primary"
                align="justify"
              >
                <q-tab name="date" icon="event" label="Data" />
                <q-tab name="time" icon="access_time" label="Ora" />
              </q-tabs>

              <q-tab-panels v-model="activeTab" animated class="bg-slate-900">
                <q-tab-panel name="date" class="q-pa-none">
                  <q-date
                    v-model="dateTimeValue"
                    mask="YYYY-MM-DD HH:mm"
                    dark
                    color="primary"
                    today-btn
                  />
                </q-tab-panel>

                <q-tab-panel name="time" class="q-pa-none">
                  <q-time
                    v-model="dateTimeValue"
                    mask="YYYY-MM-DD HH:mm"
                    format24h
                    dark
                    color="primary"
                  />
                </q-tab-panel>
              </q-tab-panels>

              <div
                class="row items-center justify-between q-pa-sm border-t border-slate-700 bg-slate-950"
              >
                <div class="row q-gutter-x-xs">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    label="Adesso"
                    color="accent"
                    @click="handleSetNow"
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
            </div>
          </q-popup-proxy>
        </q-icon>

        <q-icon name="access_time" class="cursor-pointer text-grey-4" />
      </div>
    </template>
  </q-input>
</template>

<style scoped lang="scss">
.app-datetime-picker {
  border-radius: 8px;
}
</style>
