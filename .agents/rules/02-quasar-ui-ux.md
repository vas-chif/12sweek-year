# 🎨 Regola 02: Quasar UI/UX Marziale, Standard File .vue & Mobile Bottom Tabs

> **Riferimento:** `AGENTS.md §4` | **Stack:** Quasar 2 / Vue 3 Composition API / TypeScript 5 Strict

Questa regola definisce l'architettura visiva, responsive, la struttura dei componenti e la resa cartacea per **TimesManagement 12WY**.

---

## 1. Struttura Obbligatoria File `.vue`

Ogni componente o pagina `.vue` deve rispettare tassativamente questo ordine di blocchi:

```vue
<script setup lang="ts">
// 1. Script SEMPRE PRIMA del template — MAI template prima di script
</script>

<template>
  <!-- 2. Template dopo lo script -->
</template>

<style scoped lang="scss">
/* 3. Style sempre in coda */
</style>
```

> ❌ MAI `<template>` prima di `<script>`.  
> ❌ MAI omettere `lang="ts"`.

---

## 2. Ordine Import Groups (Standard)

```typescript
// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, onMounted } from "vue";
import { useQuasar, Notify } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod (Source of Truth) ────────────────────────────────────
import type { TacticItem, TurtlePhase, LifeGoal } from "@/types/twelveWeek";

// ── 4. Composables & Utils ─────────────────────────────────────────────────────
// ── 5. Componenti Figli ────────────────────────────────────────────────────────
```

---

## 3. Limiti Dimensionali File e Modularità (Standard Decennale)

| Tipologia di File                             | Limite Massimo | Azione Correttiva se Superato                                                             |
| :-------------------------------------------- | :------------: | :---------------------------------------------------------------------------------------- |
| **Logica `<script>` in file `.vue`**          | **250 righe**  | Estrarre la business logic in un composable dedicato (`src/composables/`).                |
| **Componenti UI e Sezioni (`.vue`)**          | **400 righe**  | Estrarre sotto-componenti dedicati per card, dialog o tabelle.                            |
| **Pagine Orchestratrici (`src/pages/*.vue`)** | **600 righe**  | La pagina orchestra sotto-componenti specializzati invece di contenere markup monolitico. |
| **Moduli TypeScript (`.ts` / stores)**        | **500 righe**  | Scomporre per bounded context / utilità.                                                  |

---

## 4. Palette Marziale Dark Slate

- **Primary:** `#0284c7` (Sky Deep Focus)
- **Secondary:** `#64748b` (Slate Steel - Il vuoto _Ma_)
- **Accent:** `#f59e0b` (Amber Gold - Traguardo & 85%)
- **Dark:** `#1e293b` (Card Background)
- **Dark Page:** `#0b1120` (Notte profonda)
- **Priorità A (Rospo):** `#ef4444` (Rosso vivo)
- **Priorità B:** `#0ea5e9` (Sky chiaro)
- **Priorità C:** `#94a3b8` (Slate neutro)

---

## 5. Architettura Responsive Ibrida

- **Mobile-First (Smartphone):**
  - Barra fissa inferiore (`QFooter`) con `QTabs` e 4 schede touch:
    1. 📅 **Oggi** (`/today`): Data odierna, turno del giorno, blocco strategico 03:10, rospo A1 e compiti con log ore.
    2. ⚔️ **Settimana 12WY** (`/`): Intestazione W1-W12 con date esatte, mese fittizio ("Gennaio 12WY"), countdown milestone imminenti, score 85%, tabella tattiche.
    3. 🗓️ **Calendario** (`/calendar`): **Mese Singolo Navigabile** con selettore data di avvio ciclo, elenco settimane e import JSON turni.
    4. 🐢 **Obiettivi & Черепаха** (`/clan`): Selezione 3 Fasi Черепаха 🐢 (peso, girovita, trend), macro-obiettivi (Famiglia, Business, Finanze) e timer 60s _Ma_.
- **Desktop:**
  - `QHeader` con brand, score WAM, chip turno e pulsanti backup/stampa.
  - `QDrawer` laterale per configurazioni avanzate, export/import JSON e reset.

---

## 6. Scheda Stampa A4 (`@media print`)

- Il pulsante `[🖨️ Stampa A4]` stampa la scheda della settimana corrente perfettamente impaginata su **foglio singolo A4**:
  - Nasconde header, drawer, footer con tabs, pulsanti e dialog (`display: none !important;`).
  - Resetta i background su bianco puro con testo nero e bordi nitidi `#0f172a`.
  - Mostra caselle di spunta vuote per consentire la compilazione manuale a penna.
  - Intestazione chiara: _"12-WEEK YEAR OPERATIONAL HUB — SETTIMANA X (MESE 12WY)"_ con date da/a e box per note cartacee.
