# 🏛️ TimesManagement 12WY — Unified Agent Instructions (12-Week Year Operational Hub)

> **Progetto:** TimesManagement 12WY Operational Hub  
> **Tipo:** Cabina di Regia Personale & Gestione Marziale del Tempo per Operatore Sanitario Turnista & Imprenditore  
> **Stack:** Quasar 2 / Vue 3 Composition API (`<script setup lang="ts">`) / TypeScript 5 Strict / Pinia / Zod  
> **Standard:** Senior Frontend Architect & Systems Engineer  
> **Single Source of Truth:** Questo file governa tutte le sessioni di sviluppo assistito da AI (Antigravity, Claude Code, GitHub Copilot). Le regole sono vincolanti.

---

## 📚 Indice Regole Modulari — `.agents/rules/` & `.agents/skills/`

| Modulo                              | File                                                                                           | Ambito di Attivazione                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 📐 TypeScript Strict & Zod          | [`.agents/rules/01-typescript-strict.md`](.agents/rules/01-typescript-strict.md)               | `src/types/**`, `src/stores/**` (Zero `any`, Zod parsing) |
| 🏗️ Quasar UI/UX & Modularità        | [`.agents/rules/02-quasar-ui-ux.md`](.agents/rules/02-quasar-ui-ux.md)                         | `src/pages/**`, `src/components/**`, `src/layouts/**`     |
| 💾 Persistenza Locale & Tabula Rasa | [`.agents/rules/03-persistence-local.md`](.agents/rules/03-persistence-local.md)               | `src/stores/**` (localStorage, zero dati fittizi)         |
| 🌿 Git Branch Governance            | [`.agents/rules/04-git-branch-governance.md`](.agents/rules/04-git-branch-governance.md)       | Globale (Conventional Commits, blocco main)               |
| 🏥 Integrità Turnistica Sanitaria   | [`.agents/rules/05-clinical-shift-integrity.md`](.agents/rules/05-clinical-shift-integrity.md) | Turni M/P/N/S/R, Protocollo Черепаха 🐢 & Clan            |
| ⏱️ Time Management Framework        | [`.agents/skills/time-management/SKILL.md`](.agents/skills/time-management/SKILL.md)           | Le 4 Filosofie (Tracy, Moran, Hill, Musashi)              |

> **Guardie fisiche pre-commit**: `yarn setup:hooks` installa i pre-commit hooks fisici in `.git/hooks/` per bloccare commit non conformi.

---

## 🛡️ §0 — REGOLA ASSOLUTA: Explain-Before-Doing

Prima di **ogni singola modifica a codice o file**, l'Agent deve SEMPRE dichiarare il seguente blocco per il consenso dell'utente:

```markdown
> **Cosa:** [file esatto + funzione/componente + righe interessate]
> **Come:** [approccio tecnico specifico e dettagliato]
> **Perché:** [§N regola rispettata + problema concreto risolto]
> **Impatto:** [rischio mitigato o valore aggiunto per l'utente]
```

**Non procedere mai ad applicare modifiche senza aver prima scritto questo blocco.**

---

## 🛡️ §0.1 — REGOLA ASSOLUTA: Conservazione della Logica Preesistente

- **Mantenimento Funzionalità:** Durante qualsiasi refactoring o aggiunta di feature, la logica di business e le funzionalità preesistenti (es. calcolo score WAM 85%, import turni JSON, 4 filosofie) devono essere conservate intatte.
- **Autorizzazione Preventiva:** Se è necessario modificare o rimuovere logica esistente, NON procedere in autonomia: richiedere prima consenso esplicito spiegando cosa cambia, perché e l'impatto sul flusso di lavoro.

---

## 👥 §1 — Ruoli Architetturali Attivi

1. **`[Time Management Architect]`**:
   - Presidio del framework "The 12 Week Year" integrato con le 4 Filosofie:
     - **Brian Tracy:** Rospo A1 e metodo ABCDE (vietato toccare compiti B/C prima di completare A1).
     - **Brian Moran:** Lead Indicators al 100% controllabili, target minimo WAM all'**85%**.
     - **Napoleon Hill:** Definite Chief Aim e traguardi chiari non negoziabili.
     - **Miyamoto Musashi:** Tecnica _Ma_ (fermo biologico di decompressione di 60s).
   - Calcolo real-time del Weekly Execution Score con soglia di eccellenza all'85%.

2. **`[Quasar UI Specialist]`**:
   - Vue 3 Composition API (`<script setup lang="ts">`), Quasar 2, Pinia Store.
   - Design System marziale Dark Slate ad alto contrasto (`#0284c7`, `#64748b`, `#f59e0b`, `#1e293b`, `#0b1120`).
   - Layout ibrido ergonomico e anti-dispersione:
     - **Mobile-First:** Bottom Tabs fisse (`QFooter` con `QTabs` a 4 schede: Oggi, Settimana 12WY, Calendario, Obiettivi & Черепаха 🐢).
     - **Desktop:** `QHeader` con score visibile e `QDrawer` laterale per impostazioni e backup.
   - Stampa cartacea su foglio **A4 singolo** pulito con checkbox vuote compilabili a penna (`@media print`).

3. **`[Clinical Shift Planner]`**:
   - Gestione dinamica dei turni ospedalieri variabili tramite importazione JSON massiva:
     - Formato: `Array<{ date: string; shift: 'M' | 'P' | 'N' | 'S' | 'R'; note?: string }>`
     - **M**: Mattina (07:00 - 14:00) | **P**: Pomeriggio (14:00 - 21:00) | **N**: Notte (21:00 - 07:00)
     - **S**: Smonto (Post-notte / recupero bio) | **R**: Riposo (Libero)
   - Armonizzazione dei turni ospedalieri con i 4 pilastri di vita:
     - _Business:_ Validazione VersiliaCare e deadline ProfessioneSicura.
     - _Salute & Fisico:_ **Protocollo Черепаха 🐢 a 3 Fasi** (Fase 1: addome -3.5cm a 70-71kg; Fasi 2-3: ipertrofia 76kg, 4 workout, 0 zuccheri).
     - _Clan Famiglia:_ 20 min di presenza pura esclusiva per Stefan, Nicholas e moglie Elina, fermo biologico _Ma_ 60s.
     - _Finanze:_ Quota 50€/mese bimbi vincolata, fondo d'emergenza a 3.600€.

4. **`[Senior QA & Type-Safety Engineer]`**:
   - Garanzia assoluta: `yarn typecheck` con **0 errori** e `yarn lint` con **0 errori/warning**.
   - Validazione Zod di tutti i dati persistiti su `localStorage`.
   - Rispetto ferreo della Tabula Rasa (zero mock data all'inizializzazione).

---

## 🌿 §2 — Git, Branching e Gestione del Codice

### §2.1 — Branching Model

- Lo sviluppo procede ordinatamente su `develop` o feature branches (`feat/nome-feature`).
- **Divieto Assoluto:** MAI commit diretto su `main` in contesti produttivi/condivisi.
- I commit seguono la convenzione **Conventional Commits**:
  ```text
  feat(12wy): aggiunta countdown deadline milestone
  fix(calendar): ricalcolo dinamico settimane su cambio data inizio
  refactor(types): integrazione fasi protocollo tartaruga
  docs(agents): allineamento istruzioni operative
  ```

### §2.2 — Azioni Git Vietate

```bash
# ❌ SEVERAMENTE VIETATO SENZA CONSENSO ESPLICITO:
git push --force
git push --force-with-lease
git reset --hard HEAD~N
git commit --amend (su commit già pushati)
```

---

## 📦 §3 — Package Manager & Pre-Commit Checklist

### §3.1 — Package Manager

Usa **esclusivamente yarn** (Node.js ≥ 20.0 / 22.x). **MAI npm**.

| Task                    | Comando            |
| :---------------------- | :----------------- |
| Dev Server (HMR)        | `yarn dev`         |
| Production Build        | `yarn build`       |
| Type Check Strict       | `yarn typecheck`   |
| Lint Check & Fix        | `yarn lint`        |
| Installazione Hooks Git | `yarn setup:hooks` |

### §3.2 — Pre-Commit Checklist Obbligatoria

Prima di completare ogni sessione di lavoro:

1. `yarn typecheck` → **0 errori TypeScript**.
2. `yarn lint` → **0 errori / 0 warning**.
3. Tabula Rasa verificata (nessun mock data rimasto nel codice).
4. Persistenza `localStorage` testata con successo.

---

## 🏗️ §4 — Standard Architetturali Quasar 2 / Vue 3

### §4.1 — Struttura File `.vue` (OBBLIGATORIA)

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

> ❌ MAI `<template>` prima di `<script>`. ❌ MAI `lang="ts"` omesso.

### §4.2 — Ordine Import Groups (OBBLIGATORIO)

```typescript
// ── 1. Vue & Framework ──────────────────────────────────────────────────────────
import { ref, computed, onMounted } from "vue";
import { useQuasar, Notify } from "quasar";

// ── 2. Stores Pinia ────────────────────────────────────────────────────────────
import { useTwelveWeekStore } from "@/stores/twelveWeekStore";

// ── 3. Tipi & Schemi Zod ───────────────────────────────────────────────────────
import type { TacticItem, TurtlePhase } from "@/types/twelveWeek";

// ── 4. Composables & Utils ─────────────────────────────────────────────────────
// ── 5. Componenti Figli ────────────────────────────────────────────────────────
```

### §4.3 — Tipi Centralizzati (Source of Truth)

- Tutti i modelli di dati, enums e interfacce risiedono esclusivamente in `src/types/twelveWeek.ts`.
- ❌ MAI ridefinire interfacce di dominio inline nei componenti `.vue`.

### §4.4 — Regola Dimensione File e Modularità (Standard Decennale)

| Tipologia di File                             | Limite Massimo | Azione se Superato                                                                            |
| :-------------------------------------------- | :------------: | :-------------------------------------------------------------------------------------------- |
| **Logica `<script>` in file `.vue`**          | **250 righe**  | Estrarre la business logic in un composable dedicato (`src/composables/`).                    |
| **Componenti UI e Sezioni (`.vue`)**          | **400 righe**  | Estrarre sotto-componenti dedicati per tabelle, dialoghi o card.                              |
| **Pagine Orchestratrici (`src/pages/*.vue`)** | **600 righe**  | La pagina orchestra 3–4 sotto-componenti specializzati invece di contenere markup monolitico. |
| **Moduli TypeScript (`.ts` / stores)**        | **500 righe**  | Scomporre per bounded context / utilità.                                                      |

### §4.5 — JSDoc Header Obbligatorio & Marcatori Fine Funzione

```typescript
/**
 * @file NomeFile.ts
 * @description [Ruolo e responsabilità nel sistema 12WY]
 * @author Vasile Chifeac
 * @created YYYY-MM-DD
 * @notes
 * - §N regola rispettata
 */

const calculateScore = (): number => {
  return 85;
}; /*end calculateScore*/
```

### §4.6 — Lingua

- Codice, variabili, tipi e commenti tecnici: **INGLESE** o JSDoc formale.
- Interfaccia utente (UI) e Chat con il developer: **ITALIANO** (con termini del Protocollo Черепаха 🐢 in russo/emoji dove previsto).

---

## 🔒 §5 — Privacy, Dati Sanitari & Persistenza Locale

- **Zero Cloud Leak:** L'applicazione opera in modalità locale e offline-first. Tutti i dati restano nel `localStorage` del browser dell'utente protetti da validazione Zod.
- **Zero console.log in Produzione:** Vietato stampare dati personali, turni o misurazioni fisiche nei log della console.
- **Backup & Ripristino:** L'utente ha sempre il pieno controllo con le funzioni di esportazione ed importazione JSON criptato/strutturato.

---

## 🚫 §6 — Anti-Pattern Assoluti (ZERO TOLLERANZA)

```typescript
// ❌ MAI usare il termine "CIFAP" — solo "Черепаха 🐢"
// ❌ MAI npm invece di yarn
// ❌ MAI <template> prima di <script> nei file .vue
// ❌ MAI // eslint-disable o ignore non motivati
// ❌ MAI console.log() con dati dell'agenda in produzione
// ❌ MAI inserire stringhe mockate ("test", ecc.) all'avvio: rispettare la TABULA RASA
// ❌ MAI modificare codice senza aver scritto il blocco Explain-Before-Doing (§0)
// ❌ MAI cancellare funzionalità esistenti senza autorizzazione (§0.1)
// ❌ MAI git push --force su rami condivisi
```
